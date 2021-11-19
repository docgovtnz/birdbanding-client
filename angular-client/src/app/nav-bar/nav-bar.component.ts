import { Component, OnInit } from '@angular/core';

import { ConfigurationService } from '../services/configuration.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {
  loginUrl: string;

  isSightings: boolean;

  dismissible = true;

  constructor(private configService: ConfigurationService, private authenticationService: AuthenticationService, private router: Router) {}

  ngOnInit() {
    this.router.events.subscribe(_ => {
      this.isSightings = this.router.url.includes('sightings');
    });
    const config = this.configService.getConfig();
    this.loginUrl =
      config.authBaseUrl +
      config.loginBaseUrl +
      '?response_type=' +
      config.loginResponseType +
      '&client_id=' +
      config.loginClientId +
      '&redirect_uri=' +
      config.loginDefaultRedirectUri;
  }
}
