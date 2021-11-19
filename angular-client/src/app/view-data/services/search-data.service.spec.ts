import { TestBed } from '@angular/core/testing';

import { SearchDataService, buildEmptyFilterOptions, SearchDataResult } from './search-data.service';
import { EventDataService } from './event-data.service';
import { EventData } from './event-types';

import { of } from 'rxjs';
import { LoggingService } from '../../services/logging.service';

describe('SerchDataService', () => {
  const testSearchResults: EventData[] = [
    {
      eventId: 'dfd',
      isBird: true,
      scientificName: 'testSname',
      bandNumber: 'bandNumber',
      bandPrefix: 'testBandPrefxi',
      banderName: 'testBanderName',
      banderNumber: 'testBanderNubmer',
      bbsCode: 'bbsCode',
      birdId: 'birdId',
      colourBand: 'colourBand',
      dateOfEvent: new Date(),
      dateUploaded: new Date(),
      dateUpdated: new Date(),
      hasBird: true,
      projectName: ' projectName',
      region: 'region',
      speciesCode: 'code',
      commonName: 'special bird',
      lat: 0,
      lng: 0
    }
  ];

  const spySearchEventsWithFilter: jasmine.Spy = jasmine.createSpy('searchEventsWithFilter').and.returnValue(
    of({
      listData: testSearchResults,
      nextPaginationToken: '',
      prevPaginationToken: '',
      selfPaginationToken: '',
      isFirstPage: false,
      isLastPage: false
    })
  );
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        {
          provide: EventDataService,
          useValue: {
            searchEventsWithFilter: spySearchEventsWithFilter,
            getEventDataExtended: spySearchEventsWithFilter
          }
        },
        {
          provide: LoggingService,
          useValue: {
            logError: () => {}
          }
        }
      ]
    })
  );

  it('should be created', () => {
    const service: SearchDataService = TestBed.inject(SearchDataService);
    expect(service).toBeTruthy();
  });

  it('stores the last search result in searchResults ', done => {
    const service: SearchDataService = TestBed.inject(SearchDataService);
    const filterOptions = buildEmptyFilterOptions();
    service.searchEvents(filterOptions);
    // check that the last results are present
    service.searchResults.subscribe((lastResults: SearchDataResult) => {
      expect(lastResults.eventData).toEqual(testSearchResults);
      done();
    });
  });

  it(' indicates that a previous search is avalible to load', done => {
    const service: SearchDataService = TestBed.inject(SearchDataService);
    const filterOptions = buildEmptyFilterOptions();
    service.searchEvents(filterOptions);
    // check that the last results are present
    service.hasSearchToDisplayBehaviour.subscribe((dispaly: boolean) => {
      expect(dispaly).toBeTruthy();
      done();
    });
  });

  it('clears the last search when clear is called', done => {
    const service: SearchDataService = TestBed.inject(SearchDataService);
    const filterOptions = buildEmptyFilterOptions();
    // set service up with non empty search
    filterOptions.locationDescription = 'test';

    service.searchEvents(filterOptions);
    expect(service.currentSearchOptions).toEqual(filterOptions);

    service.clear();
    // check filter and search to be cleared
    expect(service.currentSearchOptions).toEqual(buildEmptyFilterOptions());
    service.searchResults.subscribe((lastResults: SearchDataResult) => {
      expect(lastResults.eventData).toEqual([]);
      done();
    });
  });

  it('search to display is false when clear is called', done => {
    const service: SearchDataService = TestBed.inject(SearchDataService);
    const filterOptions = buildEmptyFilterOptions();
    // set service up with non empty search
    filterOptions.locationDescription = 'test';
    service.searchEvents(filterOptions);
    service.clear();
    // check results to display is now false
    service.hasSearchToDisplayBehaviour.subscribe((hasResultsToDispaly: boolean) => {
      expect(hasResultsToDispaly).toEqual(false);
      done();
    });
  });

  it('changes the limit of the search results when change limit is called', () => {
    const service: SearchDataService = TestBed.inject(SearchDataService);

    const newLimit = 500;
    service.changeLimit(newLimit);
    expect(service.currentLimit).toEqual(newLimit);
    expect(spySearchEventsWithFilter.calls.mostRecent().args[0]).toEqual(newLimit);
  });
});
