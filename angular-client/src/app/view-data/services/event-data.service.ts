import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { map, take  } from 'rxjs/operators';
import { forkJoin } from 'rxjs';


import { ConfigurationService } from '../../services/configuration.service';
import {
  ListEventDataResponse,
  FilterOptions,
  EventDetails,
  ApiEventData,
  ApiAdvancedSearchBody,
  SearchSort,
  SortOrder
} from './event-types';
import { buildEventParameters } from './utility/build-event-query';
import {
  apiEventToEventDetails,
  transformApiEventResponseFlatToListEventDataResponseFlat,
  transformApiEventResponseToListEventDataResponse
} from './utility/api-event-transformer';

import { Observable } from 'rxjs';
import { isNil, not } from 'ramda';
import { ReferenceDataService, ApiCharacteristic, Characteristic } from '../../services/reference-data.service';

// end api interfaces

@Injectable({
  providedIn: 'root'
})
export class EventDataService {
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  readonly baseUri: string;

  constructor(
    private http: HttpClient,
    config: ConfigurationService,
    private referenceDataService: ReferenceDataService
  ) {
    this.baseUri = config.getConfig().apiUrl;
  }

  // custom event search with limit and all filter options provided, will search for page if pagination token provided
  searchEventsWithFilter(limit: number, filterOptions: FilterOptions, paginationToken: string): Observable<ListEventDataResponse> {
    let uri = `${this.baseUri}/events?limit=${limit}${buildEventParameters(filterOptions)}`;
    if (not(isNil(paginationToken))) {
      uri = uri + `&paginationToken=${paginationToken}`;
    }
    return this.http.get(uri, this.httpOptions).pipe(map(transformApiEventResponseToListEventDataResponse));
  }

  createAdvancedSearch(
    limit: number,
    advancedSearchBody: ApiAdvancedSearchBody,
    paginationToken: string,
    sort: SearchSort | null
  ): Observable<ListEventDataResponse> {
    let uri = `${this.baseUri}/events-a?limit=${limit}`;
    if (not(isNil(paginationToken))) {
      uri = uri + `&paginationToken=${paginationToken}`;
    }
    if (not(isNil(sort))) {
      uri = uri + buildSortOrder(sort);
    }
    return this.http.post(uri, advancedSearchBody, this.httpOptions).pipe(map(transformApiEventResponseFlatToListEventDataResponseFlat));
  }

  getEventDetails(eventId: string): Observable<EventDetails> {
    return forkJoin([
      this.getApiEventData(eventId),
      this.referenceDataService.characteristicsSubject.pipe(take(1)),
      this.referenceDataService.dataUploadReplaySubject.pipe(take(1))
    ]).pipe(map(([evData, characteristics, enums]) => {
      const eventDetails = apiEventToEventDetails(evData, characteristics);
      return eventDetails;
    }));
  }

  getApiEventData(eventId: string): Observable<ApiEventData> {
    const uri = `${this.baseUri}/events/${eventId}`;
    return this.http.get(uri, this.httpOptions) as Observable<ApiEventData>;
  }

  deleteEvent(eventId: string): Observable<any> {
    const uri = `${this.baseUri}/events/${eventId}`;
    return this.http.delete(uri, this.httpOptions) as Observable<any>;
  }

  getEventDataExtended(
    limit: number,
    filterOptions: FilterOptions,
    paginationToken: string,
    sort: SearchSort | null
  ): Observable<ListEventDataResponse> {
    let uri = `${this.baseUri}/events-s?limit=${limit}${buildEventParameters(filterOptions)}`;
    if (not(isNil(paginationToken))) {
      uri = uri + `&paginationToken=${paginationToken}`;
    }
    if (not(isNil(sort))) {
      uri = uri + buildSortOrder(sort);
    }
    return this.http.get(uri, this.httpOptions).pipe(map(transformApiEventResponseFlatToListEventDataResponseFlat));
  }
}

const buildSortOrder = (sort: SearchSort): string => {
  return `&sortBy=${sort.sortField}&order=${sort.order}`;
};
