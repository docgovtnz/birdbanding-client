import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { AuthenticationService, PersonIdentity } from '../../authentication/authentication.service';
import { isNil } from 'ramda';

@Component({
  selector: 'app-person-badge',
  templateUrl: './person-badge.component.html',
  styleUrls: ['./person-badge.component.scss']
})
export class PersonBadgeComponent implements OnInit {
  constructor(private authenticationService: AuthenticationService) {}

  @Input()
  buttonTemplate: TemplateRef<any>;

  personIdentity: PersonIdentity;

  loggedIn = false;

  personInitials: string;

  isLoaded = false;

  ngOnInit() {
    this.authenticationService.identitySubject.subscribe((identity: PersonIdentity) => {
      // when the identity becomes null the user is logged out, if not null the PersonIdentity represents the logged in person
      if (isNil(identity)) {
        this.personIdentity = null;
        this.isLoaded = true;
        this.personInitials = '';
        this.loggedIn = false;
      } else {
        this.personIdentity = identity;
        this.personInitials =
          (this.personIdentity.firstName ? this.personIdentity.firstName.substring(0, 1) : '') +
          (this.personIdentity.lastName ? this.personIdentity.lastName.substring(0, 1) : '');
        this.loggedIn = true;
      }
    });
  }

  logOut() {
    this.authenticationService.logOut();
  }
}
