import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';

import { Properties } from 'src/static-properties';

/**
 * The properties this service provides, see environment.properties
 */
export class Config {
  // map static properties to get all config from one place
  public appName = Properties.appName;
  public bandingLevel = Properties.bandingLevel;

  // environment specific properties
  public authBaseUrl: string;
  public loginBaseUrl: string;
  public loginTokenPath: string;
  public loginResponseType: string;
  public loginClientId: string;
  public loginDefaultRedirectUri: string;
  public apiUrl: string;
  public buildEnv = 'undefined';
  public buildVersion = 'undefined';
  public apiKey: string;
  public logoutUrl: string;
  public logoutRedirect: string;
  public mapBoxApiKey: string;
}

/**
 * This service will load the environments/environment.properties file, parses it and provides
 * the properties.
 * Not yet implemented (5.00$ version): Group variables by property key part (like return one object for all
 *                                      login. keys)
 *                                      Add array capability: propertyKeyGroup.propertyKey[0]
 */
@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {
  private config: Config;
  public configSubject: Subject<any> = new Subject<any>();

  constructor(private http: HttpClient) {}

  /**
   * Read the environment file and parse it
   */
  public load() {
    this.config = new Config();
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');

    return this.http
      .get('environment.properties', { headers, responseType: 'text' })
      .toPromise()
      .then((config: string) => {
        const array = config.split('\n');
        for (const line of array) {
          if (line.startsWith('#') || line.trim().length === 0) {
            continue;
          }
          this.assignKeyValue(line.trim().split('='));
        }
        this.configSubject.next(config);
      })
      .catch((err: any) => {
        console.error('ERROR:');
        console.error(err);
      });
  }

  public getConfig(): Config {
    return this.config;
  }

  /**
   * Little helper to assign the values from the properties file to the correct internal values. Will
   * also take care of any conversions.
   */
  private assignKeyValue(keyValue: string[]): void {
    switch (keyValue[0].trim()) {
      case 'auth.base_url':
        this.config.authBaseUrl = keyValue[1].trim();
        break;
      case 'login.path':
        this.config.loginBaseUrl = keyValue[1].trim();
        break;
      case 'login.token_path':
        this.config.loginTokenPath = keyValue[1].trim();
        break;
      case 'login.response_type':
        this.config.loginResponseType = keyValue[1].trim();
        break;
      case 'login.client_id':
        this.config.loginClientId = keyValue[1].trim();
        break;
      case 'login.default_redirect_uri':
        this.config.loginDefaultRedirectUri = keyValue[1].trim();
        break;
      case 'logout.path':
        this.config.logoutUrl = keyValue[1].trim();
        break;
      case 'logout.default_redirect_uri':
        this.config.logoutRedirect = keyValue[1].trim();
        break;
      case 'api.key':
        this.config.apiKey = keyValue[1].trim();
        break;
      case 'build.env':
        this.config.buildEnv = keyValue[1].trim();
        break;
      case 'build.version':
        this.config.buildVersion = keyValue[1].trim();
        break;
      case 'api.url':
        this.config.apiUrl = keyValue[1].trim();
        break;
      case 'map.api_key':
        this.config.mapBoxApiKey = keyValue[1].trim();
        break;
      default:
        console.warn('Unknown environment variable key: ' + keyValue[0]);
    }
  }
}
