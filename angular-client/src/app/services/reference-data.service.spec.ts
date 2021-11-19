import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ReferenceDataService } from './reference-data.service';
import { ConfigurationService } from './configuration.service';

describe('ReferenceDataService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: ConfigurationService,
          useValue: {
            getConfig: () => {
              return {
                apiUrl: 'testapiurl'
              };
            }
          }
        }
      ]
    })
  );

  it('should be created', () => {
    const service: ReferenceDataService = TestBed.inject(ReferenceDataService);
    expect(service).toBeTruthy();
  });
});
