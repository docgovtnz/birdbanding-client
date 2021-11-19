import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isNil, isEmpty } from 'ramda';
import { formatISO, parseISO } from 'date-fns';

import { ConfigurationService } from './configuration.service';
import { PeopleData, PersonData, PersonProject } from '../people/people-data';
import { LoggingService } from './logging.service';
import { CacheService } from './cache.service';
import { ReferenceDataService, SpeciesGroup } from './reference-data.service';
import { apiToCerts } from './certification.service';

/**
 * This service provides functions to communicate with the API. Sadly the autogenerated
 * BandersService is not sufficient enough. This might change as soon as DOC defines
 * models in SWAGGER.  'Cache-Control': 'max-age=0'
 */
@Injectable({
  providedIn: 'root'
})
export class PeopleService {
  readonly PEOPLE_LIST = 'pplList';
  readonly PEOPLE_LIST_TIMEOUT = 5 * 60 * 1000; // cache for 5 minutes

  speciesGroups: SpeciesGroup[];

  private readonly baseUrl: string;
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };
  private httpOptionsPP = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Cache-Control': 'max-age=0'
    })
  };

  constructor(
    private config: ConfigurationService,
    private logService: LoggingService,
    private cache: CacheService,
    private refService: ReferenceDataService,
    private httpClient: HttpClient
  ) {
    this.baseUrl = config.getConfig().apiUrl;
    this.refService.speciesGroupSubject.subscribe(data => {
      this.speciesGroups = data;
    });
  }

  /**
   * Returns a list of people from the API.
   */
  public getPeople(path?: string): Observable<PeopleData[]> {
    if (isNil(path) || isEmpty(path)) {
      path = '/banders';
    }
    // TODO: This will cache any call to this method regardless of the path.
    if (this.cache.hasKey(this.PEOPLE_LIST + path)) {
      return this.cache.get(this.PEOPLE_LIST + path);
    } else {
      this.logService.logInfo('Requesting people from API');
      const people$ = this.httpClient.get(this.baseUrl + path, this.httpOptionsPP).pipe(
        map((response: any) => {
          return apiToPeople(response);
        })
      );
      this.cache.add(this.PEOPLE_LIST + path, people$, this.PEOPLE_LIST_TIMEOUT);
      return people$;
    }
  }

  /**
   * Returns the data of one person specified by the given id
   */
  public getPerson(id: string): Observable<PersonData> {
    const path = '/banders/' + id;
    this.logService.logInfo('Getting person from API');
    return this.httpClient.get(this.baseUrl + path, this.httpOptions).pipe(
      map((response: any) => {
        return apiToPerson(response);
      })
    );
  }

  /**
   * Converts the given PersonData object to the API model and post's it.
   */
  public addPerson(data: PersonData): Observable<any> {
    const path = '/banders/';
    this.logService.logInfo('Adding person to API');
    this.cache.removeAll(this.PEOPLE_LIST);
    // remove the id from the data object
    delete data.id;
    return this.httpClient.post(this.baseUrl + path, personToApi(data), this.httpOptions);
  }

  /**
   * Converts the given PersonData object to the API model and sends a PUT request.
   */
  public updatePerson(data: PersonData): Observable<any> {
    const path = '/banders/' + data.id;
    this.logService.logInfo('Updating person to API');
    this.cache.removeAll(this.PEOPLE_LIST);
    return this.httpClient.put(this.baseUrl + path, personToApi(data), this.httpOptions);
  }

  /**
   * Converts PersonData object to the API model and posts an API resend request
   */
  public resendInvitation(data: PersonData): Observable<any> {
    const apiPerson = personToApi(data);
    const uri = `${this.baseUrl}/banders?resendInvite=true`;
    return this.httpClient.post(uri, apiPerson, this.httpOptions);
  }

  /**
   * gets the presigned uri of the latest bader data file, attempts to download this url
   */
  public getBanderDataFile(): Observable<any> {
    const uri = `${this.baseUrl}/banders?format=file`;
    return this.httpClient.get(uri, this.httpOptions).pipe(
      tap((fileName: any) => {
        const a = document.createElement('a');
        a.href = fileName.presigned_url;
        a.click();
        a.remove();
      }),
      catchError(err => {
        this.logService.logError(`couldn't export banding details: ${JSON.stringify(err)}`);
        return throwError(err);
      })
    );
  }
}

// Convert API models to internal models and vice versa

const apiToPeople = (response: any) => {
  const people: PeopleData[] = [];
  for (const data of response.data) {
    people.push({
      id: data.id,
      personName: data.person_name,
      firstName: data.given_name,
      lastName: data.family_name,
      userName: data.username,
      display: data.given_name + ' ' + data.family_name + ' - ' + data.username,
      banderNumber: data.nznbbs_certification_number,
      maxBandingLevel: data.maximum_certification_level,
      company: data.primary_organisation,
      jointDate: data.row_creation_timestamp_ ? parseISO(data.row_creation_timestamp_) : null,
      lastLogin: data.last_login ? parseISO(data.last_login) : null,
      status: data.bander_state,
      hidden: data.isHidden ? data.isHidden : false
    });
  }
  return people;
};

const apiToPerson = (data: any) => {
  const person = {
    id: data.id,
    firstName: data.given_name,
    lastName: data.family_name,
    email: data.email,
    userName: data.username,
    banderId: data.nznbbs_certification_number,
    maxCertificationLevel: data.maximum_certification_level,
    banderStatus: data.bander_state,
    lastLogin: data.last_login ? parseISO(data.last_login) : null,
    lastUpdated: data.row_update_timestamp_ ? parseISO(data.row_update_timestamp_) : null,
    phone: data.phone_number,
    address: data.address,
    company: data.primary_organisation,
    nznbb: data.is_hidden,
    projects: apiToProject(data.bander_projects),
    certs: apiToCerts(data.bander_certifications)
  };
  return person;
};

const personToApi = (data: PersonData) => {
  return {
    id: data.id,
    name: data.firstName,
    given_name: data.firstName,
    family_name: data.lastName,
    email: data.email,
    username: data.userName,
    phone_number: data.phone,
    address: data.address,
    primary_organisation: data.company,
    nznbbs_certification_number: data.banderId ? data.banderId : null,
    maximum_certification_level: data.maxCertificationLevel,
    is_hidden: data.nznbb,
    bander_state: data.banderStatus ? data.banderStatus : 'INACTIVE'
  };
};

const apiToProject = (apiProjects: any) => {
  const projects: PersonProject[] = [];
  for (const apiProject of apiProjects) {
    projects.push({
      projectId: apiProject.project_id,
      banderId: apiProject.id,
      projectName: apiProject.name,
      isManager: apiProject.is_coordinator
    });
  }
  return projects;
};
