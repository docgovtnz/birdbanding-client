import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthenticationService, PersonIdentity } from './authentication.service';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  person: PersonIdentity;

  constructor(private authenticationService: AuthenticationService, private router: Router) {
    authenticationService.identitySubject.subscribe(person => (this.person = person));
  }

  canActivate(): Observable<boolean | UrlTree> {
    if (this.person.isAdmin) {
      return of(true);
    } else {
      return of(this.router.createUrlTree(['/dashboard']));
    }
  }
}
