/**
 * dev-birdbanding
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 2020-02-11T04:14:35Z
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
/* tslint:disable:no-unused-variable member-ordering */

import { Inject, Injectable, Optional } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse, HttpEvent, HttpParameterCodec } from '@angular/common/http';
import { CustomHttpParameterCodec } from '../encoder';
import { Observable } from 'rxjs';

import { BASE_PATH, COLLECTION_FORMATS } from '../variables';
import { Configuration } from '../configuration';

@Injectable({
  providedIn: 'root'
})
export class MarksService {
  protected basePath = 'https://xxxx.execute-api.ap-southeast-2.amazonaws.com/dev/birdbanding';
  public defaultHeaders = new HttpHeaders();
  public configuration = new Configuration();
  public encoder: HttpParameterCodec;

  constructor(protected httpClient: HttpClient, @Optional() @Inject(BASE_PATH) basePath: string, @Optional() configuration: Configuration) {
    if (configuration) {
      this.configuration = configuration;
    }
    if (typeof this.configuration.basePath !== 'string') {
      if (typeof basePath !== 'string') {
        basePath = this.basePath;
      }
      this.configuration.basePath = basePath;
    }
    this.encoder = this.configuration.encoder || new CustomHttpParameterCodec();
  }

  private addToHttpParams(httpParams: HttpParams, value: any, key?: string): HttpParams {
    if (typeof value === 'object') {
      httpParams = this.addToHttpParamsRecursive(httpParams, value);
    } else {
      httpParams = this.addToHttpParamsRecursive(httpParams, value, key);
    }
    return httpParams;
  }

  private addToHttpParamsRecursive(httpParams: HttpParams, value: any, key?: string): HttpParams {
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        (value as any[]).forEach(elem => (httpParams = this.addToHttpParamsRecursive(httpParams, elem, key)));
      } else if (value instanceof Date) {
        if (key != null) {
          httpParams = httpParams.append(key, (value as Date).toISOString().substr(0, 10));
        } else {
          throw Error('key may not be null if value is Date');
        }
      } else {
        Object.keys(value).forEach(
          k => (httpParams = this.addToHttpParamsRecursive(httpParams, value[k], key != null ? `${key}.${k}` : k))
        );
      }
    } else if (key != null) {
      httpParams = httpParams.append(key, value);
    } else {
      throw Error('key may not be null if value is not object or array');
    }
    return httpParams;
  }

  /**
   * @param limit
   * @param paginationToken
   * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
   * @param reportProgress flag to report request and response progress.
   */
  public marksGet(
    limit?: string,
    paginationToken?: string,
    observe?: 'body',
    reportProgress?: boolean,
    options?: { httpHeaderAccept?: undefined }
  ): Observable<any>;
  public marksGet(
    limit?: string,
    paginationToken?: string,
    observe?: 'response',
    reportProgress?: boolean,
    options?: { httpHeaderAccept?: undefined }
  ): Observable<HttpResponse<any>>;
  public marksGet(
    limit?: string,
    paginationToken?: string,
    observe?: 'events',
    reportProgress?: boolean,
    options?: { httpHeaderAccept?: undefined }
  ): Observable<HttpEvent<any>>;
  public marksGet(
    limit?: string,
    paginationToken?: string,
    observe: any = 'body',
    reportProgress: boolean = false,
    options?: { httpHeaderAccept?: undefined }
  ): Observable<any> {
    let queryParameters = new HttpParams({ encoder: this.encoder });
    if (limit !== undefined && limit !== null) {
      queryParameters = this.addToHttpParams(queryParameters, <any>limit, 'limit');
    }
    if (paginationToken !== undefined && paginationToken !== null) {
      queryParameters = this.addToHttpParams(queryParameters, <any>paginationToken, 'paginationToken');
    }

    let headers = this.defaultHeaders;

    // authentication (2_ekfMXxn4p) required
    if (this.configuration.apiKeys && this.configuration.apiKeys['Authorization']) {
      headers = headers.set('Authorization', this.configuration.apiKeys['Authorization']);
    }

    let httpHeaderAcceptSelected: string | undefined = options && options.httpHeaderAccept;
    if (httpHeaderAcceptSelected === undefined) {
      // to determine the Accept header
      const httpHeaderAccepts: string[] = [];
      httpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
    }
    if (httpHeaderAcceptSelected !== undefined) {
      headers = headers.set('Accept', httpHeaderAcceptSelected);
    }

    let responseType: 'text' | 'json' = 'json';
    if (httpHeaderAcceptSelected && httpHeaderAcceptSelected.startsWith('text')) {
      responseType = 'text';
    }

    return this.httpClient.get<any>(`${this.configuration.basePath}/marks`, {
      params: queryParameters,
      responseType: <any>responseType,
      withCredentials: this.configuration.withCredentials,
      headers: headers,
      observe: observe,
      reportProgress: reportProgress
    });
  }

  /**
   * @param markId
   * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
   * @param reportProgress flag to report request and response progress.
   */
  public marksMarkIdGet(
    markId: string,
    observe?: 'body',
    reportProgress?: boolean,
    options?: { httpHeaderAccept?: undefined }
  ): Observable<any>;
  public marksMarkIdGet(
    markId: string,
    observe?: 'response',
    reportProgress?: boolean,
    options?: { httpHeaderAccept?: undefined }
  ): Observable<HttpResponse<any>>;
  public marksMarkIdGet(
    markId: string,
    observe?: 'events',
    reportProgress?: boolean,
    options?: { httpHeaderAccept?: undefined }
  ): Observable<HttpEvent<any>>;
  public marksMarkIdGet(
    markId: string,
    observe: any = 'body',
    reportProgress: boolean = false,
    options?: { httpHeaderAccept?: undefined }
  ): Observable<any> {
    if (markId === null || markId === undefined) {
      throw new Error('Required parameter markId was null or undefined when calling marksMarkIdGet.');
    }

    let headers = this.defaultHeaders;

    // authentication (2_ekfMXxn4p) required
    if (this.configuration.apiKeys && this.configuration.apiKeys['Authorization']) {
      headers = headers.set('Authorization', this.configuration.apiKeys['Authorization']);
    }

    let httpHeaderAcceptSelected: string | undefined = options && options.httpHeaderAccept;
    if (httpHeaderAcceptSelected === undefined) {
      // to determine the Accept header
      const httpHeaderAccepts: string[] = [];
      httpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
    }
    if (httpHeaderAcceptSelected !== undefined) {
      headers = headers.set('Accept', httpHeaderAcceptSelected);
    }

    let responseType: 'text' | 'json' = 'json';
    if (httpHeaderAcceptSelected && httpHeaderAcceptSelected.startsWith('text')) {
      responseType = 'text';
    }

    return this.httpClient.get<any>(`${this.configuration.basePath}/marks/${encodeURIComponent(String(markId))}`, {
      responseType: <any>responseType,
      withCredentials: this.configuration.withCredentials,
      headers: headers,
      observe: observe,
      reportProgress: reportProgress
    });
  }
}
