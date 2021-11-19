import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonBadgeComponent } from './person-badge.component';
import { AuthenticationService, PersonIdentity, Role } from '../../authentication/authentication.service';
import { Subject } from 'rxjs';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('PersonBadgeComponent', () => {
  let component: PersonBadgeComponent;
  let fixture: ComponentFixture<PersonBadgeComponent>;

  const testIdenity: PersonIdentity = {
    email: 'test.email@com',
    firstName: 'Future',
    lastName: 'Value',
    name: 'Future value',
    userId: ' test user id',
    isAdmin: true,
    role: Role.Admin
  };

  let authenticationService: AuthenticationService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [BsDropdownModule.forRoot(), RouterModule.forRoot([]), BrowserAnimationsModule],
      declarations: [PersonBadgeComponent],
      providers: [
        {
          provide: AuthenticationService,
          useValue: {
            identitySubject: new Subject<PersonIdentity>()
          }
        }
      ]
    }).compileComponents();
    authenticationService = TestBed.inject(AuthenticationService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not be logged in when the navbar loads', () => {
    expect(component.loggedIn).toBeFalsy();
  });

  it('should be logged in when the identity subject emits a value', () => {
    expect(component.loggedIn).toBeFalsy();
    authenticationService.identitySubject.next(testIdenity);
    expect(component.loggedIn).toBeTruthy();
  });

  it('should be store the correct initals when logged in', () => {
    expect(component.loggedIn).toBeFalsy();
    authenticationService.identitySubject.next(testIdenity);
    expect(component.loggedIn).toBeTruthy();
    const initals = testIdenity.firstName.substring(0, 1) + testIdenity.lastName.substring(0, 1);
    expect(component.personInitials).toEqual(initals);
  });
});
