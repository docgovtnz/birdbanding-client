import { Injectable } from '@angular/core';
import { AdvancedFilterOption, ApiAdvancedSearchBody, EventData, FilterOptions, ListEventDataResponse, SearchSort } from './event-types';
import { buildEmptyFilterOptions } from './search-data.service';
import { BehaviorSubject, of } from 'rxjs';
import { EventDataService } from './event-data.service';
import { LoggingService } from '../../services/logging.service';
import { advancedFilterOptionsToApiAdvancedSearch, emptyApiAdvancedSearchBody } from './utility/api-event-transformer';
import { switchMap } from 'rxjs/operators';

export interface MapDataResult {
  mapData: EventData[];
  hasMoreData: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MapDataService {
  mapDataSubject: BehaviorSubject<MapDataResult> = new BehaviorSubject<MapDataResult>({
    mapData: [],
    hasMoreData: true
  });

  private currentEventData: EventData[] = [];

  currentSearchOptions: FilterOptions = buildEmptyFilterOptions();

  currentAdvancedSearch: ApiAdvancedSearchBody = emptyApiAdvancedSearchBody();

  nextPaginationToken: string;

  isAdvanceSearch = false;

  currentLimit = 5000;

  isLoadingBehaviour: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private eventDataService: EventDataService, private loggingService: LoggingService) {}

  searchMapEvents(filterOptions: FilterOptions) {
    this.currentEventData = [];
    this.currentLimit = 5000;
    this.currentSearchOptions = filterOptions;
    this.isAdvanceSearch = false;
    this.searchMapEventsByPage(null);
  }

  searchMapAdvanced(advanceFilterOptions: AdvancedFilterOption[]) {
    this.currentEventData = [];
    this.isAdvanceSearch = true;
    this.currentLimit = 100;
    this.currentAdvancedSearch = advancedFilterOptionsToApiAdvancedSearch(advanceFilterOptions);
    this.searchMapEventsByPage(null);
  }

  private searchMapEventsByPage(paginationToken: string) {
    this.isLoadingBehaviour.next(true);
    of({})
      .pipe(
        switchMap(_ => {
          if (this.isAdvanceSearch) {
            return this.eventDataService.createAdvancedSearch(this.currentLimit, this.currentAdvancedSearch, paginationToken, null);
          } else {
            return this.eventDataService.getEventDataExtended(this.currentLimit, this.currentSearchOptions, paginationToken, null);
          }
        })
      )
      .subscribe(
        (results: ListEventDataResponse) => {
          this.currentEventData.push(...results.listData);
          this.mapDataSubject.next({
            mapData: this.currentEventData,
            hasMoreData: !results.isLastPage
          });
          this.nextPaginationToken = results.nextPaginationToken;

          this.isLoadingBehaviour.next(false);
        },
        e => {
          this.isLoadingBehaviour.next(false);
          this.loggingService.logError(`Error searching events, httpStatus: ${e.status}, options: ${this.currentSearchOptions}`);
        }
      );
  }

  requestMoreData() {
    this.searchMapEventsByPage(this.nextPaginationToken);
  }

  redoCurrentSearch() {
    this.currentEventData = [];
    this.searchMapEventsByPage(null);
  }

  clear() {
    this.currentSearchOptions = buildEmptyFilterOptions();
    this.currentAdvancedSearch = emptyApiAdvancedSearchBody();
    this.currentEventData = [];
    this.nextPaginationToken = null;
    this.mapDataSubject.next({
      mapData: [],
      hasMoreData: true
    });
  }
}
