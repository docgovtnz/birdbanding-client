import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { AuthenticationService } from '../authentication/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class SpeciesService {
  constructor(private http: HttpClient, private authenticationService: AuthenticationService) {}

  getSpeciesList() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.get('https://xxxx.execute-api.ap-southeast-2.amazonaws.com/dev/birdbanding/species', httpOptions);
  }
}
