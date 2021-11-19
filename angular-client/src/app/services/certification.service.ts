import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { parseISO } from 'date-fns';

import { ConfigurationService } from './configuration.service';
import { LoggingService } from './logging.service';
import { BandingLevel } from '../people/people-data';
import { CacheService } from './cache.service';
import { SpeciesGroup } from './reference-data.service';

export type CertificationType = 'SPECIES_GROUP' | 'ENDORSEMENT';

export class PersonCertificate {
  id: number;
  userId: string;
  banderId: string;
  speciesGroupId: number;
  speciesGroup: SpeciesGroup;
  endorsement: string;
  certificationType: CertificationType;
  bandingLevel: BandingLevel;
  validFrom: Date;
  comment: string;
  isInEditMode: boolean;
}

/**
 * Service provides  functions to get, update or to add certificates.
 * PUT  /bander-certifications/{{bander_certifications_id}}
 * POST /bander-certifications/
 * GET  /bander-certifications/?certificationCommentContains=Test&competencyLevel=L2
 * DELETE /bander-certifications/{{certification_id}}
 */
@Injectable({
  providedIn: 'root'
})
export class CertificationService {
  readonly CERT_LIST = 'certList';
  readonly PERSON_LIST = 'pplList'; // used in view-person
  readonly CERT_LIST_TIMEOUT = 5 * 60 * 1000; // cache for 5 minutes

  private readonly baseUrl: string;
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Cache-Control': 'max-age=0'
    })
  };

  constructor(
    private config: ConfigurationService,
    private logService: LoggingService,
    private cache: CacheService,
    private httpClient: HttpClient
  ) {
    this.baseUrl = config.getConfig().apiUrl;
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-api-key': config.getConfig().apiKey
      })
    }; // TODO: 'Cache-Control': 'max-age=0', not allowed here -> CORS
  }

  /**
   * Converts the given PersonData object to the API model and post's it.
   */
  public addCertificate(data: PersonCertificate): Observable<any> {
    const path = '/bander-certifications/';
    this.logService.logInfo('Adding certificate to API');
    this.cache.removeAll(this.CERT_LIST);
    const apiData = certToApi(data);
    delete apiData.id; // API doesn't like the ID field even if it is null :(
    return this.httpClient.post(this.baseUrl + path, apiData, this.httpOptions);
  }

  /**
   * Converts the given PersonData object to the API model and sends a PUT request.
   */
  public updateCertificate(data: PersonCertificate): Observable<any> {
    const path = '/bander-certifications/' + data.id;
    this.logService.logInfo('Updating certificate to API');
    this.cache.removeAll(this.CERT_LIST);
    this.cache.removeAll(this.PERSON_LIST);
    return this.httpClient.put(this.baseUrl + path, certToApi(data), this.httpOptions);
  }

  /**
   * Deletes the given certificate
   */
  public deleteCertificate(data: PersonCertificate): Observable<any> {
    const path = '/bander-certifications/' + data.id;
    this.logService.logInfo('Deleting certificate via API');
    this.cache.removeAll(this.CERT_LIST);
    this.cache.removeAll(this.PERSON_LIST);
    return this.httpClient.delete(this.baseUrl + path, this.httpOptions);
  }

  /**
   * Get certifications for a given bander
   */
  public getCertifications(personId): Observable<PersonCertificate[]> {
    return this.httpClient
      .get(`${this.baseUrl}/banders/${personId}/bander-certifications`)
      .pipe(map((apiCertifications: any[]) => apiCertifications.map(apiToCert)));
  }
}

export const apiToCerts = (response: any[]) => {
  // console.log('apiToCerts');
  // console.log(response);
  const certs: PersonCertificate[] = [];
  for (const data of response) {
    certs.push(apiToCert(data));
  }
  return certs;
};

const apiToCert = (data: any) => {
  return {
    id: data.id,
    userId: null,
    banderId: data.bander_id,
    speciesGroupId: data.certification_type === 'SPECIES_GROUP' ? data.certification : -1,
    speciesGroup: null,
    endorsement: data.certification_type === 'ENDORSEMENT' ? data.certification : '',
    certificationType: data.certification_type,
    bandingLevel: data.competency_level,
    validFrom: data.valid_from_timestamp ? parseISO(data.valid_from_timestamp) : null,
    comment: data.certification_comment,
    isInEditMode: false
  };
};

const certToApi = (data: PersonCertificate) => {
  return {
    id: data.id,
    bander_id: data.banderId,
    competency_level: data.bandingLevel,
    certification: data.certificationType === 'SPECIES_GROUP' ? data.speciesGroupId : data.endorsement,
    valid_from_timestamp: data.validFrom,
    certification_comment: data.comment,
    certification_type: data.certificationType
  };
};
