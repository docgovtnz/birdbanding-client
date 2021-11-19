import { AuthenticationService } from './authentication.service';
import { Location, DOCUMENT } from '@angular/common';

import { of } from 'rxjs';

import { ConfigurationService, Config } from '../services/configuration.service';

import { TestBed } from '@angular/core/testing';
describe('The authentication service', () => {
  const loginBaseUrl = 'http://test.auth.doc.com';
  const loginDefaultRedirectUri = 'http://test.doc.com/login';
  const loginResponseType = 'specail';
  const loginClientId = '12345';
  const fakeIdentity = {
    sub: 'uuid',
    given_name: 'testFirstName',
    family_name: 'testFamilyName',
    name: 'test full name',
    email: 'test@test.com',
    'cognito:groups': ['admin-group']
  };
  let authenticationService: AuthenticationService;
  let locationSpy: jasmine.SpyObj<Location>;
  let documentSpy;
  beforeEach(() => {
    const spyLocation: jasmine.SpyObj<Location> = jasmine.createSpyObj('Location', ['path']);
    const spyDomcument = { location: jasmine.createSpyObj('location', ['assign']) };
    const testConfig = new Config();
    testConfig.loginBaseUrl = loginBaseUrl;
    testConfig.loginClientId = loginClientId;
    testConfig.loginDefaultRedirectUri = loginDefaultRedirectUri;
    testConfig.loginResponseType = loginResponseType;

    TestBed.configureTestingModule({
      declarations: [],
      imports: [],
      providers: [
        {
          provide: ConfigurationService,
          useValue: {
            config: of(testConfig),
            getConfig: () => testConfig
          }
        },
        { provide: Location, useValue: spyLocation },
        { provide: DOCUMENT, useValue: spyDomcument },
        AuthenticationService
      ]
    }).compileComponents();
    authenticationService = TestBed.inject(AuthenticationService);
    locationSpy = TestBed.inject(Location) as jasmine.SpyObj<Location>;
    documentSpy = TestBed.inject(DOCUMENT);
    spyOn(authenticationService.jwtHelper, 'decodeToken').and.returnValue(fakeIdentity);
    // authenticationService.setTokensAndExpiry('', 300);
    locationSpy.path.and.returnValue('/');
  });
  afterEach(() => {
    locationSpy.path.calls.reset();
    documentSpy.location.assign.calls.reset();
    sessionStorage.clear();
  });

  // it('Gets the id token', () => {
  //   const testIdToken = 'testIdToken';
  //   authenticationService.setTokensAndExpiry(testIdToken, 300);
  //   expect(authenticationService.getIdToken()).toEqual(testIdToken);
  // });
  //
  // it('Redirects to login if the id token has expired', () => {
  //   const authUri =
  //     `${loginBaseUrl}` +
  //     `?response_type=${loginResponseType}` +
  //     `&client_id=${loginClientId}` +
  //     `&redirect_uri=${loginDefaultRedirectUri}`;
  //   locationSpy.path.and.returnValue('/');
  //   const idToken = 'testIdToken';
  //
  //   authenticationService.setTokensAndExpiry(idToken, -1);
  //   authenticationService.getIdToken();
  //   expect(documentSpy.location.assign.calls.mostRecent().args[0]).toEqual(authUri);
  // });

  // it('Saves last path of the user into session storage', () => {
  //   const authUri =
  //     `${loginBaseUrl}` +
  //     `?response_type=${loginResponseType}` +
  //     `&client_id=${loginClientId}` +
  //     `&redirect_uri=${loginDefaultRedirectUri}`;
  //   const path = '/users';
  //   locationSpy.path.and.returnValue(path);
  //   const idToken = 'testIdToken';
  //   authenticationService.setTokensAndExpiry(idToken, -1);
  //   authenticationService.getIdToken();
  //
  //   expect(documentSpy.location.assign.calls.mostRecent().args[0]).toEqual(authUri);
  //   expect(sessionStorage.getItem(LAST_PATH_KEY)).toEqual(path);
  // });

  // it('produces an identity observable when getIdentity is called ', done => {
  //   const identityObservable: Observable<PersonIdentity> = authenticationService.identitySubject;
  //   identityObservable.subscribe((identity: PersonIdentity) => {
  //     expect(identity.email).toEqual(fakeIdentity.email);
  //     expect(identity.firstName).toEqual(fakeIdentity.given_name);
  //     expect(identity.lastName).toEqual(fakeIdentity.family_name);
  //     expect(identity.userId).toEqual(fakeIdentity.sub);
  //     expect(identity.name).toEqual(fakeIdentity.name);
  //     done();
  //   });
  //   authenticationService.setTokensAndExpiry('', 300);
  // });
});
