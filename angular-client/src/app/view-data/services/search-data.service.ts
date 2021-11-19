import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { EventDataService } from './event-data.service';
import { AdvancedFilterOption, ApiAdvancedSearchBody, EventData, FilterOptions, ListEventDataResponse } from './event-types';
import { LoggingService } from '../../services/logging.service';
import { advancedFilterOptionsToApiAdvancedSearch, emptyApiAdvancedSearchBody } from './utility/api-event-transformer';
import { switchMap } from 'rxjs/operators';
import { FullApiError } from '../../common/errors/error-utilities';

export const buildEmptyFilterOptions = (): FilterOptions => {
  return {
    projects: [],
    species: [],
    showErrors: false,
    showMoratorium: false,
    bandCodes: [],
    locationDescription: '',
    uploadedBy: [],
    bandingSchemes: [],
    eventDates: [],
    speciesGroups: [],
  };
};

export interface SearchDataResult {
  eventData: EventData[];
  isFirstPage: boolean;
  isLastPage: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class SearchDataService {
  searchResults: BehaviorSubject<SearchDataResult> = new BehaviorSubject<SearchDataResult>({
    eventData: [],
    isFirstPage: false,
    isLastPage: false,
  });

  searchErrors: BehaviorSubject<FullApiError[]> = new BehaviorSubject<FullApiError[]>([]);

  currentSearchOptions: FilterOptions = buildEmptyFilterOptions();

  currentAdvancedOptions: AdvancedFilterOption[] = [];

  currentAdvancedApiBody: ApiAdvancedSearchBody = emptyApiAdvancedSearchBody();

  isAdvancedSearch = false;

  currentLimit = 50;

  isLoadingBehaviour: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  isLoadingPage$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  hasSearchToDisplayBehaviour: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private prevPaginationToken: string;

  private nextPaginationToken: string;

  private currentPaginationToken: string;

  constructor(private eventDataService: EventDataService, private loggingService: LoggingService) {}

  searchEvents(filterOptions: FilterOptions) {
    this.isAdvancedSearch = false;
    this.currentSearchOptions = filterOptions;
    this.isLoadingBehaviour.next(true);
    this.searchEventsWithPagination(null);
  }

  advancedSearch(advancedFilterOptions: AdvancedFilterOption[]) {
    this.isAdvancedSearch = true;
    this.currentAdvancedOptions = advancedFilterOptions;
    this.currentAdvancedApiBody = advancedFilterOptionsToApiAdvancedSearch(advancedFilterOptions);
    this.isLoadingBehaviour.next(true);
    this.searchEventsWithPagination(null);
  }

  private searchEventsWithPagination(paginationToken: string) {
    this.searchErrors.next([]);
    of({})
      .pipe(
        switchMap(() => {
          if (this.isAdvancedSearch) {
            return this.eventDataService.createAdvancedSearch(this.currentLimit, this.currentAdvancedApiBody, paginationToken, null);
          } else {
            return this.eventDataService.getEventDataExtended(this.currentLimit, this.currentSearchOptions, paginationToken, null);
          }
        })
      )
      .subscribe(
        (results: ListEventDataResponse) => {
          this.hasSearchToDisplayBehaviour.next(true);
          this.searchResults.next({
            eventData: results.listData,
            isLastPage: results.isLastPage,
            isFirstPage: results.isFirstPage,
          });
          this.nextPaginationToken = results.nextPaginationToken;
          this.prevPaginationToken = results.prevPaginationToken;
          this.currentPaginationToken = results.selfPaginationToken;
          this.isLoadingBehaviour.next(false);
          this.isLoadingPage$.next(false);
        },
        (e) => {
          console.error(e, e.error);
          if (e.error && e.error.details) {
            this.searchErrors.next(e.error.details);
          } else {
            this.searchErrors.next([
              {
                code: -1,
                type: '',
                severity: '',
                message: 'Unexpected error',
                keyword: '',
                property: 'Unknown',
                value: '',
              },
            ]);
          }
          this.isLoadingBehaviour.next(false);
          this.isLoadingPage$.next(false);
          if (this.isAdvancedSearch) {
            this.loggingService.logError(
              `Error advanced searching events, httpStatus: ${e.status}, options: ${this.currentAdvancedApiBody}`
            );
          } else {
            this.loggingService.logError(`Error searching events, httpStatus: ${e.status}, options: ${this.currentSearchOptions}`);
          }
        }
      );
  }

  searchAgain() {
    this.searchEventsWithPagination(this.currentPaginationToken);
  }

  nextPage() {
    this.isLoadingPage$.next(true);
    this.searchEventsWithPagination(this.nextPaginationToken);
  }

  previousPage() {
    this.isLoadingPage$.next(true);
    this.searchEventsWithPagination(this.prevPaginationToken);
  }

  changeLimit(newLimit: number) {
    this.isLoadingPage$.next(true);
    this.currentLimit = newLimit;
    this.searchEventsWithPagination(this.currentPaginationToken);
  }

  clearResults() {
    this.hasSearchToDisplayBehaviour.next(false);
    this.searchErrors.next([]);
    this.searchResults.next({
      eventData: [],
      isFirstPage: false,
      isLastPage: false,
    });
    this.nextPaginationToken = null;
    this.prevPaginationToken = null;
    this.currentPaginationToken = null;
  }

  clear(): FilterOptions {
    this.clearResults();
    this.currentSearchOptions = buildEmptyFilterOptions();
    this.currentAdvancedApiBody = emptyApiAdvancedSearchBody();
    this.currentAdvancedOptions = [];

    return buildEmptyFilterOptions();
  }
}
