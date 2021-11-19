import { ErrorHandler, Injectable } from '@angular/core';

import { LoggingService } from 'src/app/services/logging.service';

/**
 * This global error handler replaces the Angular provided error handler.
 * I might be useful to add a NotificationService which opens a modal dialog for
 * certain error messages (unable to load configuration, API offline, ...).
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private sentencesForWarningLogging: string[] = [];

  constructor(private logService: LoggingService) {}

  public handleError(error) {
    const message = error.message ? error.message : error.toString();

    if (error.status) {
      error = new Error(message);
    }

    const errorTraceStr = `Error message:\n${message}.\nStack trace: ${error.stack}`;

    // can be that logService is not yet initialised. Need this, otherwise the logService call
    // will cause an exception which masks the real exception.
    if (this.logService.isReady$) {
      if (this.isWarning(errorTraceStr)) {
        this.logService.logWarning(errorTraceStr);
      } else {
        this.logService.logError(errorTraceStr);
      }
      throw error;
    } else {
      console.error(errorTraceStr);
    }
  }

  private isWarning(errorTraceStr: string) {
    let isWarning = true;
    // Error comes from app
    if (errorTraceStr.includes('/src/app/')) {
      isWarning = false;
    }
    this.sentencesForWarningLogging.forEach(whiteListSentence => {
      if (errorTraceStr.includes(whiteListSentence)) {
        isWarning = true;
      }
    });
    return isWarning;
  }
}
