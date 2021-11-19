import { Injectable } from '@angular/core';
import { Router, RoutesRecognized } from '@angular/router';
import { filter, pairwise } from 'rxjs/operators';
import { isNil } from 'ramda';

@Injectable({
  providedIn: 'root'
})
export class PreviousRouteService {
  private previousRoute;

  constructor(router: Router) {
    // listen to router events, subscribe to the pairwise observable of the previous and current route
    router.events
      .pipe(
        filter((evt: any) => evt instanceof RoutesRecognized),
        pairwise()
      )
      .subscribe((events: RoutesRecognized[]) => {
        this.previousRoute = events[0].urlAfterRedirects;
      });
  }
  // return the last route before the current route, return fallback if that route is not defined
  getPreviousRoute(fallbackUri: string): string {
    if (isNil(this.previousRoute)) {
      return fallbackUri;
    } else {
      return this.previousRoute;
    }
  }
}
