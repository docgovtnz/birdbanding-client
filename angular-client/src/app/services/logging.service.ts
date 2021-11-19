import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

import { LogFields } from './log-data';
import { Logger } from './logger';
import { Config, ConfigurationService } from './configuration.service';
import { HttpClient } from '@angular/common/http';

/**
 * This Logging service will log to different endpoints:
 * - errors/exceptions or important stuff will be printed to the console and sent to a Logging Endpoint
 *   back to the server (at the moment: console)
 * - all other will be simply printed to the console - at the moment
 */
@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  private logger: Logger;
  private readonly conf: Config;
  private readonly userId = 'dummy';
  public isReady$ = of(false);

  constructor(private configService: ConfigurationService, private http: HttpClient) {
    this.conf = this.configService.getConfig();
    this.logger = new Logger(this.conf.appName, this.conf.apiUrl + '/logs', this.conf.buildEnv, this.conf.apiKey, http);
    this.isReady$.pipe(map(() => true));
  }

  public logWarning(errorMsg: string) {
    this.logger.log('WARN', errorMsg, this.getLogFields());
  }

  public logError(errorMsg: string) {
    this.logger.log('CRITICAL', errorMsg, this.getLogFields());
  }

  public logInfo(info: any) {
    this.logger.log('LOG', info, this.getLogFields());
  }

  // TODO: Do we need this?
  private getLogFields(): LogFields {
    return {
      userId: this.userId,
      elapsedTime: 0,
      requestPath: '',
      environment: this.conf.buildEnv,
      appVersion: this.conf.buildVersion,
      url: location.href
    };
  }
}
