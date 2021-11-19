import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavBarComponent } from './nav-bar.component';

import { ConfigurationService } from '../services/configuration.service';

import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Component, Input, TemplateRef } from '@angular/core';
import { AuthenticationService } from '../authentication/authentication.service';
import { of } from 'rxjs';

@Component({
  selector: 'app-person-badge',
  template: '<div></div>'
})
class TestPersonBadgeComponent {
  @Input()
  buttonTemplate: TemplateRef<any>;
}

@Component({
  selector: 'app-sightings-nav',
  template: '<div></div>'
})
class TestSightingsNavComponent {
  @Input()
  loginUrl: string;
}

@Component({
  selector: 'app-banding-nav',
  template: '<div></div>'
})
class TestBandingNavComponent {
  @Input()
  loginUrl: string;
}

describe('NavBarComponent', () => {
  let component: NavBarComponent;
  let fixture: ComponentFixture<NavBarComponent>;

  const loginBaseUrl = 'testBaseUri';
  const authBaseUrl = 'authBaseUri';
  const loginResponseType = 'testResponseType';
  const clientId = 'testClientId';
  const loginDefaultRedirectUri = 'testRedirect';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [BsDropdownModule.forRoot(), RouterModule.forRoot([]), BrowserAnimationsModule],
      declarations: [NavBarComponent, TestPersonBadgeComponent, TestSightingsNavComponent, TestBandingNavComponent],
      providers: [
        {
          provide: ConfigurationService,
          useValue: {
            getConfig: () => {
              return {
                authBaseUrl,
                loginBaseUrl,
                loginResponseType,
                loginClientId: clientId,
                loginDefaultRedirectUri
              };
            }
          }
        },
        {
          provide: AuthenticationService,
          useValue: {
            identitySubject: of({}),
            timeoutSubject: of({})
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the correct loging uri', () => {
    const expectedUri =
      authBaseUrl +
      loginBaseUrl +
      '?response_type=' +
      loginResponseType +
      '&client_id=' +
      clientId +
      '&redirect_uri=' +
      loginDefaultRedirectUri;
    expect(expectedUri).toEqual(component.loginUrl);
  });
});
