import { TestBed } from '@angular/core/testing';

import { SightingReportService } from './sighting-report.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Config, ConfigurationService } from '../../services/configuration.service';

describe('SightingReportService', () => {
  const apiUrl = 'http://api.test.com';
  const apiKey = 'testKey';
  beforeEach(() => {
    const testConfig = new Config();
    testConfig.apiUrl = apiUrl;
    testConfig.apiKey = apiKey;
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
    const service: SightingReportService = TestBed.inject(SightingReportService);
    expect(service).toBeTruthy();
  });
});
