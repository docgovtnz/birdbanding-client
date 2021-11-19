import { Component, Input, OnInit } from '@angular/core';
import { AuthenticationService, PersonIdentity } from '../../authentication/authentication.service';
import { isNil } from 'ramda';

@Component({
  selector: 'app-banding-nav',
  templateUrl: './banding-nav.component.html',
  styleUrls: ['./banding-nav.component.scss']
})
export class BandingNavComponent implements OnInit {
  @Input()
  loginUrl: string;

  constructor(private authenticationService: AuthenticationService) {}

  isLoggedIn = false;

  person: PersonIdentity;

  ngOnInit() {
    this.authenticationService.identitySubject.subscribe((identity: PersonIdentity) => {
      this.person = identity;
      // when the identity becomes null the user is logged out, if not null the PersonIdentity represents the logged in person
      this.isLoggedIn = !isNil(identity);
    });
  }
}
