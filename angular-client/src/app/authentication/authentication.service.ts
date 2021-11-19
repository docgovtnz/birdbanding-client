import { Injectable, Inject } from '@angular/core';
import { DOCUMENT, Location } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable, of, ReplaySubject, throwError } from 'rxjs';
import { isEmpty, isNil, not } from 'ramda';

import { ConfigurationService, Config } from '../services/configuration.service';
import { catchError, switchMap } from 'rxjs/operators';

export enum Role {
  Admin = 'admin',
  User = 'user'
}

export interface PersonIdentity {
  userId: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  role: Role;
  isAdmin: boolean;
}

export interface Jwt {
  idToken: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  tokenType: string;
}

export const LAST_PATH_KEY = 'last-path';

export const JWT_TOKEN = 'jwt-token';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private jwt: Jwt;

  private config: Config;

  jwtHelper: JwtHelperService = new JwtHelperService();

  // broadcasts the identity of a logged in person,  null is broadcast  when the person is logged out
  identitySubject: ReplaySubject<PersonIdentity> = new ReplaySubject<PersonIdentity>();

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    })
  };

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private location: Location,
    private configService: ConfigurationService,
    private http: HttpClient
  ) {
    this.config = configService.getConfig();
    this.checkSessionStorage();
  }

  setJwt(jwt: Jwt) {
    this.jwt = jwt;
    this.parseAndPublishPersonIdentity(this.jwt.idToken);
    sessionStorage.setItem(JWT_TOKEN, JSON.stringify(jwt));
  }

  getToken(): Observable<string> {
    if (this.isJwtExpired()) {
      return this.refreshJwt();
    }
    return of(this.jwt.idToken);
  }

  private isJwtExpired(): boolean {
    return isNil(this.jwt) || this.jwt.expiresAt < Date.now();
  }

  /**
   * Used to force a refresh of the id and access token
   * returns: Observable of the refreshed id token
   */
  refreshJwt(): Observable<string> {
    const tokenUrl = `${this.config.authBaseUrl + this.config.loginTokenPath}`;
    const refreshToken = this.jwt.refreshToken; // need to remember this as Cognito is not sending a new one
    const payload = `grant_type=refresh_token` + `&client_id=${this.config.loginClientId}` + `&refresh_token=${refreshToken}`;

    // refresh token, parse it, then return observable of refreshed token
    return this.http.post(tokenUrl, payload, this.httpOptions).pipe(
      switchMap((resp: string) => {
        if (not(isNil(resp))) {
          const jwt = apiToJWT(resp);
          jwt.refreshToken = refreshToken;
          this.setJwt(jwt);
          return of(jwt.idToken);
        }
      }),
      catchError(e => {
        console.error('Unable to refresh the token!');
        console.error(e);
        this.navigateToLogin();
        return throwError(e);
      })
    );
  }

  // check if there is a valid jwt in session storage
  private checkSessionStorage(): void {
    const jwt = sessionStorage.getItem(JWT_TOKEN);
    if (!isNil(jwt)) {
      this.jwt = JSON.parse(jwt);
      this.parseAndPublishPersonIdentity(this.jwt.idToken);
      if (this.isJwtExpired()) {
        this.refreshJwt();
      }
    }
  }

  parseAndPublishPersonIdentity(idToken: string) {
    const decodedToken = this.jwtHelper.decodeToken(idToken);
    let role: Role = Role.User;
    let isAdmin = false;
    const cognitoGroups = decodedToken['cognito:groups'];
    if (!isNil(cognitoGroups) && !isEmpty(cognitoGroups)) {
      role = this.getRole(cognitoGroups[0]);
      isAdmin = role === Role.Admin;
    }

    const identityObject: PersonIdentity = {
      userId: decodedToken.sub,
      firstName: decodedToken.given_name,
      lastName: decodedToken.family_name,
      name: decodedToken.name,
      email: decodedToken.email,
      role,
      isAdmin
    };
    this.identitySubject.next(identityObject);
  }

  isLoggedIn() {
    return !isNil(this.jwt) && !isNil(this.jwt.idToken) && !this.isJwtExpired();
  }

  refreshOrLogin(): boolean {
    if (this.jwt) {
      if (this.isJwtExpired()) {
        this.refreshJwt();
      }
      return true;
    } else {
      this.navigateToLogin();
    }
    return false;
  }

  navigateToLogin() {
    if (!isNil(this.config.authBaseUrl)) {
      const authUri =
        `${this.config.authBaseUrl + this.config.loginBaseUrl}` +
        `?response_type=${this.config.loginResponseType}` +
        `&client_id=${this.config.loginClientId}` +
        `&redirect_uri=${this.config.loginDefaultRedirectUri}`;
      // don't save the last path if it was login
      if (!(this.location.path().includes('/login') || this.location.path().includes('/token'))) {
        sessionStorage.setItem(LAST_PATH_KEY, this.location.path());
      }
      this.document.location.assign(authUri);
    }
  }

  getRole(apiRole: string): Role {
    if (apiRole.includes('admin')) {
      return Role.Admin;
    }
    return Role.User;
  }

  logOut() {
    const logoutUri =
      `${this.config.authBaseUrl + this.config.logoutUrl}` +
      `?client_id=${this.config.loginClientId}` +
      `&logout_uri=${this.config.logoutRedirect}`;
    sessionStorage.removeItem(JWT_TOKEN);
    this.identitySubject.next(null);
    this.document.location.assign(logoutUri);
  }
}

// Test refresh token: set expiresAt *10 instead of * 1000 -> refreshes all 36 seconds
export const apiToJWT = (api: any): Jwt => {
  return {
    idToken: api.id_token,
    accessToken: api.access_token,
    refreshToken: api.refresh_token,
    expiresAt: api.expires_in * 1000 + Date.now(),
    tokenType: api.token_type
  };
};
