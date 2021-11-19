import { TestBed } from '@angular/core/testing';

import { DataUploadService } from './data-upload.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Config, ConfigurationService } from '../../services/configuration.service';
import { ReferenceDataService } from '../../services/reference-data.service';
import { of } from 'rxjs';
import { PeopleService } from '../../services/people.service';
import { ProjectService } from '../../projects/services/project.service';

describe('DataUploadService', () => {
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
        },
        {
          provide: ReferenceDataService,
          useValue: {
            characteristicsSubject: of([])
          }
        },
        {
          provide: PeopleService,
          useValue: {
            getPeople: () => of([])
          }
        },
        {
          provide: ProjectService,
          useValue: {
            getApiEventData: () => of([])
          }
        }
      ]
    });
  });

  it('should be created', () => {
    const service: DataUploadService = TestBed.inject(DataUploadService);
    expect(service).toBeTruthy();
  });
});
