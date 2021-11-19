import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigurationService } from '../../services/configuration.service';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private baseUrl: string;
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient, config: ConfigurationService) {
    this.baseUrl = config.getConfig().apiUrl;
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'X-Api-Key': config.getConfig().apiKey
      })
    };
  }

  get(name: string): Observable<ContentData> {
    // find by name, if not found then create a default/empty one, save and return it
    return this.http.get(`${this.baseUrl}/cms-content?contentName=${name}`, this.httpOptions).pipe(
      switchMap((response: any[]) => {
        if (response) {
          if (response.length === 1) {
            return of(response[0]);
          } else {
            throw new Error('Found more than one content model for ' + name);
          }
        } else {
          // this content doesn't exist yet, so create it...
          const content = new ContentData();
          content.name = name;
          content.html = '<p>No content yet.</p>';
          content.link_label = 'Label';
          content.visibility = 'visible';
          return this.add(content);
        }
      })
    );
  }

  add(content: ContentData): Observable<ContentData> {
    // only called from get if find content by name is not found
    return this.http.post<ContentData>(`${this.baseUrl}/cms-content`, content, this.httpOptions);
  }

  update(content: ContentData): Observable<ContentData> {
    // called when the user is updating content from the content editor component
    const updateRequest = new ContentData();
    updateRequest.id = '' + content.id;
    updateRequest.name = content.name;
    updateRequest.link_label = content.link_label;
    updateRequest.html = content.html;
    updateRequest.visibility = content.visibility;

    return this.http.put<ContentData>(`${this.baseUrl}/cms-content/${content.id}`, updateRequest, this.httpOptions);
    // return this.http.put<ContentData>(`${this.baseUrl}/cms-content`, updateRequest, this.httpOptions);
  }
}

/* tslint:disable */
export class ContentData {
  id: string;
  link_label: string;
  visibility: string;
  name: string;
  html: string;
  row_update_timestamp_: string;
  row_update_user_: string;
}
/* tslint:enable */
