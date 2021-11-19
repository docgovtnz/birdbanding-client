import { Injectable } from '@angular/core';

/**
 * This tiny 'service' is used to store any data when moving between pages. It gets for example used
 * for the Manage People search page to store the current search criteria. When going back the
 * previous search criteria will then be available.
 * TODO: is it acceptable when user doesn't return from view but later finding the search preset?
 */
@Injectable()
export class Data {
  public storage: any;

  public constructor() {}
}
