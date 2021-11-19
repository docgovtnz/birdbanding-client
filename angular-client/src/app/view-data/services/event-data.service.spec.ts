import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { EventDataService } from './event-data.service';
import { Config, ConfigurationService } from '../../services/configuration.service';

describe('EventDataServiceService', () => {
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
        }
      ]
    });
  });

  it('should be created', () => {
    const service: EventDataService = TestBed.inject(EventDataService);
    expect(service).toBeTruthy();
  });

  it('should use the correct api url', () => {
    const service: EventDataService = TestBed.inject(EventDataService);
    expect(service.baseUri).toEqual(apiUrl);
  });
});
