import { TestBed } from '@angular/core/testing';

import { ExportService } from './export.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Config, ConfigurationService } from '../../services/configuration.service';
import { AuthenticationService } from '../../authentication/authentication.service';
import { of } from 'rxjs';

describe('ExportService', () => {
  const apiUrl = 'http://api.test.com';
  beforeEach(() => {
    const testConfig = new Config();
    testConfig.apiUrl = apiUrl;
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: ConfigurationService,
          useValue: {
            getConfig: () => testConfig
          }
        },
        {
          provide: AuthenticationService,
          useValue: {
            identitySubject: of({})
          }
        }
      ]
    });
  });

  it('should be created', () => {
    const service: ExportService = TestBed.inject(ExportService);
    expect(service).toBeTruthy();
  });
});
