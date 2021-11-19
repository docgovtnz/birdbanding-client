import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, EMPTY, of, throwError, ObservableInput } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';

import { AuthenticationService } from './authentication.service';
import { isNil } from 'ramda';

const publicEndpoints = [
  {
    path: 'environment.properties',
    allowedMethods: ['get']
  },
  {
    path: '/public-events',
    allowedMethods: ['get', 'post']
  },
  {
    path: '/species',
    allowedMethods: ['get']
  },
  {
    path: '/logs',
    allowedMethods: ['get']
  },
  {
    path: '/enums',
    allowedMethods: ['get']
  },
  {
    path: '/characteristics',
    allowedMethods: ['get']
  },
  {
    path: '/cms-content',
    allowedMethods: ['get']
  }
];

const isPublicEndpoint = (method: string, uri: string): boolean => {
  for (const endPoint of publicEndpoints) {
    if (uri.includes(endPoint.path) && endPoint.allowedMethods.includes(method.toLowerCase())) {
      return true;
    }
  }
  return false;
};

@Injectable()
export class TokenAuthInterceptor implements HttpInterceptor {
  constructor(private authenticationService: AuthenticationService, private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // ignore public accessible
    if (isPublicEndpoint(request.method, request.url)) {
      return next.handle(request);
    }

    // ignore oauth request
    if (request.url.includes('oauth2')) {
      return next.handle(request);
    }
    // get latest token and add it to request
    return this.authenticationService.getToken().pipe(
      switchMap((token: string) => {
        request = addTokenToRequest(request, token);
        return next
          .handle(request)
          .pipe(catchError((error: HttpEvent<any>): ObservableInput<HttpEvent<any>> => this.handleError(error, next, request)));
      })
    );
  }

  private handleError(error: HttpEvent<any>, next, request): ObservableInput<HttpEvent<any>> {
    if (error instanceof HttpErrorResponse && error.status === 404) {
      this.router.navigateByUrl('/not-found', { replaceUrl: false });
      return EMPTY;
    } else if (error instanceof HttpErrorResponse && error.status === 401) {
      // try to  explicitly refresh the session in case expired is in a unknown state
      return this.refreshTokenAndRetry(request, next);
    } else {
      return throwError(error);
    }
  }

  private refreshTokenAndRetry(request: HttpRequest<any>, next): ObservableInput<HttpEvent<any>> {
    return this.authenticationService.refreshJwt().pipe(
      switchMap((newToken: string) => {
        request = addTokenToRequest(request, newToken);
        // try again with a new token
        return next.handle(request).pipe(
          // if this fails, assume unrecoverable and navigate to login
          catchError(e => {
            this.authenticationService.navigateToLogin();
            return throwError(e);
          })
        );
      })
    );
  }
}

const addTokenToRequest = (request: HttpRequest<any>, token: string): HttpRequest<any> => {
  if (isNil(token)) {
    return request;
  } else {
    return request.clone({
      setHeaders: {
        Authorization: `${token}`
      }
    });
  }
};
