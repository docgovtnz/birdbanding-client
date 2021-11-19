import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { PeopleService } from '../../services/people.service';
import { PeopleData, PersonData } from '../../people/people-data';
import { AuthenticationService, PersonIdentity } from '../../authentication/authentication.service';
import { combineLatest } from 'rxjs';
import { isNil } from 'ramda';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.scss']
})
export class PeopleComponent implements OnInit {
  @Input()
  peopleForm: FormGroup;

  @Input()
  formType: string;

  people: PeopleData[];

  identity: PersonIdentity;

  constructor(private peopleService: PeopleService, private authenticationService: AuthenticationService) {}

  ngOnInit() {
    // use first instead of destroy pattern and there is no subscriptions taking a constant stream
    combineLatest([this.peopleService.getPeople(), this.authenticationService.identitySubject])
      .pipe(first())
      .subscribe(([people, personLoggedIn]) => {
        this.people = people;
        this.identity = personLoggedIn;
        if (this.formType === 'ADD') {
          // find the logged in person in the list of people, set them as the reporter
          const reporter = this.people.find(p => personLoggedIn && p.id === personLoggedIn.userId);
          if (!isNil(reporter)) {
            this.reporterControl.setValue(reporter);
          }
        }
      });
  }

  get primaryControl() {
    return this.peopleForm.get('primary');
  }

  get reporterControl() {
    return this.peopleForm.get('reporter');
  }

  get otherName() {
    return this.peopleForm.get('otherName');
  }

  get otherContact() {
    return this.peopleForm.get('otherContact');
  }
}
