import { TestBed } from '@angular/core/testing';

import { ProjectService } from './project.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Config, ConfigurationService } from '../../services/configuration.service';

describe('ProjectService', () => {
  const apiUrl = 'testUrl';
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
    const service: ProjectService = TestBed.inject(ProjectService);
    expect(service).toBeTruthy();
  });
});
