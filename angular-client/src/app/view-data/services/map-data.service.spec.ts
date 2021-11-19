import { TestBed } from '@angular/core/testing';

import { MapDataService } from './map-data.service';
import { EventDataService } from './event-data.service';
import { LoggingService } from '../../services/logging.service';

describe('MapDataService', () => {
  let service: MapDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: EventDataService,
          useValue: {
            searchEventsWithFilter: () => {}
          }
        },
        {
          provide: LoggingService,
          useValue: {
            logError: () => {}
          }
        }
      ]
    });
    service = TestBed.inject(MapDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
