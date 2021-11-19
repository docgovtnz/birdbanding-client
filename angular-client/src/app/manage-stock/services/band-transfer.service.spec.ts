import { TestBed } from '@angular/core/testing';

import { BandTransferService } from './band-transfer.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConfigurationService } from '../../services/configuration.service';
import { LoggingService } from '../../services/logging.service';

describe('BandTransferService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: ConfigurationService,
          useValue: {
            getConfig: () => {
              return {
                apiUrl: ''
              };
            }
          }
        },
        {
          provide: LoggingService,
          useValue: {}
        }
      ]
    })
  );

  it('should be created', () => {
    const service: BandTransferService = TestBed.inject(BandTransferService);
    expect(service).toBeTruthy();
  });
});
