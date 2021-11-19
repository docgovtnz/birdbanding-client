import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isEmpty, isNil, not } from 'ramda';

import { apiToJWT, AuthenticationService, Jwt, LAST_PATH_KEY } from '../authentication/authentication.service';
import { ConfigurationService } from '../services/configuration.service';


@Component({
  selector: 'app-login-callback',
  templateUrl: './login-callback.component.html'
})
export class LoginCallbackComponent implements OnInit {

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    })
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private config: ConfigurationService,
    private http: HttpClient) {}


  ngOnInit() {

    // get auth code from route
    this.route.queryParamMap.subscribe(params => {
      let authCode = params.get('code');

      if (authCode) {
        // use auth code to request access token (and refresh token)
        const tokenUrl = `${this.config.getConfig().authBaseUrl + this.config.getConfig().loginTokenPath}`;
        const payload =
          `grant_type=authorization_code` +
          `&code=${authCode}` +
          `&client_id=${this.config.getConfig().loginClientId}` +
          `&redirect_uri=${this.config.getConfig().loginDefaultRedirectUri}`;

        this.http.post(tokenUrl, payload, this.httpOptions).toPromise().then((resp: string) => {
          authCode = null;

          // store JWT in session storage
          if (not(isNil(resp))) {
            this.authenticationService.setJwt(apiToJWT(resp));
          }
          const lastPath = sessionStorage.getItem(LAST_PATH_KEY);
          sessionStorage.removeItem(LAST_PATH_KEY);
          // do not navigate to last path if it doesnt exist or is the dashboard
          if (!isNil(lastPath) && !isEmpty(lastPath) && lastPath !== '/') {
            this.router.navigate([lastPath]);
          } else {
            this.router.navigate(['/dashboard']);
          }
        });
      }
    });
  }
}


