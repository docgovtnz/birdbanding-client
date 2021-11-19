import { Injectable } from '@angular/core';

import { ReferenceDataService } from '../../services/reference-data.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigurationService } from '../../services/configuration.service';
import { combineLatest, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiDataRecord, SingleDataRecord, ValidationResponse } from './data-upload-types';
import {
  apiValidationResponseToValidationResponse,
  characteristicsNotReady,
  eventDetailsToSingleRecord,
  mapCharacteristicNameToId,
  singleDataRecordToCreateRecord,
  singleDataRecordToUpdateRecord
} from './data-upload-transformer';
import { ApiEventData } from '../../view-data/services/event-types';
import { EventDataService } from '../../view-data/services/event-data.service';
import { PeopleService } from '../../services/people.service';
import { ProjectService } from '../../projects/services/project.service';
import { LoggingService } from '../../services/logging.service';

@Injectable({
  providedIn: 'root'
})
export class DataUploadService {
  baseUri: string;

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  characteristicNameToId = characteristicsNotReady;

  constructor(
    private referenceDataService: ReferenceDataService,
    private eventsService: EventDataService,
    private peopleService: PeopleService,
    private projectService: ProjectService,
    private http: HttpClient,
    private loggingService: LoggingService,
    config: ConfigurationService
  ) {
    this.baseUri = config.getConfig().apiUrl;
    this.referenceDataService.characteristicsSubject.subscribe(c => {
      this.characteristicNameToId = mapCharacteristicNameToId(c);
    });
  }

  validateSingleRecord(record: SingleDataRecord): Observable<ValidationResponse> {
    let apiCreateRecord;
    try {
      apiCreateRecord = singleDataRecordToCreateRecord(record, this.characteristicNameToId);
    } catch (e) {
      return throwError(e);
    }
    const projectId = record.bandingEvent.registeredProject.id;
    return this.http
      .post(
        `${this.baseUri}/projects/${projectId}/event-validations?validationName=event` +
          `&validationName=markConfiguration&validationName=bird&validationName=bander&validationName=location`,
        [apiCreateRecord],
        this.httpOptions
      )
      .pipe(
        map(apiValidationResponseToValidationResponse),
        catchError(e => {
          this.loggingService.logError(JSON.stringify(e));
          return throwError(apiValidationResponseToValidationResponse(e.error, e.status));
        })
      );
  }

  createAddRecordSubmission(record: ApiDataRecord): Observable<ApiEventData> {
    const projectId = record.event.project_id;
    return this.http.post(`${this.baseUri}/projects/${projectId}/events`, [record], this.httpOptions).pipe(
      // get the first event of the returned list
      map((events: any) => events.data[0]),
      catchError(e => {
        this.loggingService.logError(JSON.stringify(e));
        return throwError(apiValidationResponseToValidationResponse(e.error, e.status));
      })
    ) as Observable<ApiEventData>;
  }

  getSingleRecord(eventId: string): Observable<SingleDataRecord> {
    return combineLatest([
      this.eventsService.getApiEventData(eventId),
      this.projectService.getProjects(),
      this.peopleService.getPeople(),
      this.referenceDataService.speciesSubject,
      this.referenceDataService.characteristicsSubject
    ]).pipe(map(eventDetailsToSingleRecord));
  }

  validateUpdateSingleRecord(record: SingleDataRecord): Observable<ValidationResponse> {
    let apiUpdateRecord;
    try {
      apiUpdateRecord = singleDataRecordToUpdateRecord(record, this.characteristicNameToId);
    } catch (e) {
      return throwError(e);
    }
    const eventId = record.eventId;
    return this.http
      .put(
        `${this.baseUri}/event-validations/${eventId}?validationName=event` +
          `&validationName=markConfiguration&validationName=bird&validationName=bander&validationName=location`,
        [apiUpdateRecord],
        this.httpOptions
      )
      .pipe(
        map(apiValidationResponseToValidationResponse),
        catchError(e => {
          this.loggingService.logError(JSON.stringify(e));
          return throwError(apiValidationResponseToValidationResponse(e.error, e.status));
        })
      ) as Observable<ValidationResponse>;
  }

  updateSingleRecord(apiRecord: ApiDataRecord): Observable<ApiEventData> {
    return this.http.put(`${this.baseUri}/events/${apiRecord.event.id}`, [apiRecord], this.httpOptions).pipe(
      map((events: any) => events.data[0]),
      catchError(e => {
        this.loggingService.logError(JSON.stringify(e));
        return throwError(apiValidationResponseToValidationResponse(e.error, e.status));
      })
    ) as Observable<ApiEventData>;
  }
}
