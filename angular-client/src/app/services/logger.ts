import { Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, filter } from 'rxjs/operators';
import * as dateFns from 'date-fns';

import { LogFields } from './log-data';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export type LogType = 'LOG' | 'WARN' | 'CRITICAL';

interface LogEntry {
  type: LogType;
  message: string;
  data?: LogFields;
}

enum LoggerEvents {
  Flush = 1
}

/**
 * This Logger is doing the heavy lifting of creating the log message and sending it
 * to the API. It gets used by the LoggingService.
 * POST {api-endpoint}/birdbanding/logs
 *  Expected HTTP body structure (JSON):
 * {
 *   "id": <UUID-String>,
 *   "type": <Unspecified-String>,
 *   "message": <Unspecified-String>,
 *   "severity": <Enumerated-Severity> LOG | WARN | CRITICAL
 * }
 */
export class Logger {
  private buffer: LogEntry[] = [];
  private flush = new Subject<LoggerEvents>();

  constructor(
    private appName: string,
    private logEndpoint: string,
    private env: string,
    private loggingKey: string,
    private http: HttpClient
  ) {
    this.flush
      .pipe(
        debounceTime(5000),
        filter(event => event === LoggerEvents.Flush)
      )
      .subscribe(() => this.flushBuffer());
  }

  private static buildMessage(entry: LogEntry): string {
    return dateFns.formatISO(new Date()) + ' - ' + entry.message + (entry.data ? ' - ' + JSON.stringify(entry.data) : '');
  }

  private static buildBodyChunk(entry: LogEntry) {
    const body = {
      id: '00000000-0000-0000-0000-000000000000',
      type: 'BirdBanding',
      message: Logger.buildMessage(entry),
      severity: entry.type
    };
    return JSON.stringify(body);
  }

  public log(type: LogType, message: string, data: LogFields) {
    this.buffer.push({
      type,
      message
    });
    this.flush.next(LoggerEvents.Flush);
  }

  private flushBuffer() {
    const data = this.buffer.splice(0);

    if (data.length === 0) {
      return;
    }

    let body = data.map(entry => Logger.buildBodyChunk(entry)).reduce((sum, entry) => (sum += entry + ','), '');
    // remove last, and surround with [] to have a valid Json
    body = '[' + body.substring(0, body.length - 1) + ']';

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-api-key': this.loggingKey
      })
    };

    if (this.env === 'prod') {
      this.http
        .post(this.logEndpoint, body, httpOptions)
        .pipe(catchError(this.handleError<any>('sendLog')))
        .subscribe(
          next => {
          },
          err => {
            console.error('Unable to send log entry to API');
            console.error('log entry: ' + body);
            console.error('returned error' + err);
          }
        );
    }
  }

  /**
   * Can't send log entry, print it to console instead.
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
