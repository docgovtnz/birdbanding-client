import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { parseISO } from 'date-fns';

import { ConfigurationService } from '../../services/configuration.service';
import { ApiBird, ApiEvent, Band, Bird, BirdAge, BirdEvent, BirdSex, ListEventDataResponse, Mark } from './event-types';
import { pathOr, isEmpty, not, isNil, is, ap } from 'ramda';
import {
  markConfigurationToBandConfiguration,
  splitOrPlaceholder,
  transformApiEventResponseToListEventDataResponse
} from './utility/api-event-transformer';

export const apiBirdToBird = (apiBird: ApiBird): Bird => {
  const firstEvent: BirdEvent = apiEventDataToEventData(apiBird.earliest_event);
  const lastEvent: BirdEvent = apiEventDataToEventData(apiBird.latest_event);
  const latestBands: Band[] = apiEventToBandConfiguration(apiBird.latest_event);
  const earliestBands: Band[] = apiEventToBandConfiguration(apiBird.earliest_event);
  const birdDisplayName = deriveDisplayName(earliestBands);
  const age = getBirdAge(apiBird.earliest_event);
  const sex = getBirdSex(apiBird.earliest_event);
  return {
    id: apiBird.bird.id,
    commonName: apiBird.species.common_name_nznbbs,
    speciesCode: apiBird.species.species_code_nznbbs,
    speciesGroup: apiBird.species.species_group_membership.species_group.name,
    species: apiBird.species.species,
    scientificName: apiBird.species.scientific_name_nznbbs,
    lastSeenAt: lastEvent.region,
    firstSeenAt: firstEvent.region,
    firstRecorded: firstEvent.dateOfEvent,
    lastRecorded: lastEvent.dateOfEvent,
    friendlyName: apiBird.bird.friendly_name,
    birdDisplayName,
    bands: latestBands,
    age,
    sex,
    longevity: apiBird.bird.longevity,
    inferredBirdStatus: capitaliseFirstCharacter(apiBird.bird.inferred_bird_status),
    dispersalDistanceKm: apiBird.bird.dispersal_distance_km,
    deltaMostRecentSightingKm: apiBird.bird.delta_most_recent_sighting_km,
    deltaFirstLastSightingKm: apiBird.bird.delta_first_and_last_sighting_km,
    cumulativeDistanceKm: apiBird.bird.cumulative_distance_km,
    earliestEvent: {
      eventOwnerId: apiBird.earliest_event.event_owner_id,
      eventProviderId: apiBird.earliest_event.event_provider_id,
      eventReporterId: apiBird.earliest_event.event_reporter_id,
      projectId: apiBird.earliest_event.project_id
    }
  };
};

const capitaliseFirstCharacter = (value: string): string => {
  if (isNil(value) || isEmpty(value)) {
    return '-';
  }
  if (value.length === 1) {
    return value.toUpperCase();
  }
  return value.substring(0, 1).toUpperCase() + value.substring(1, value.length).toLowerCase();
};

const UNKNOWN_BIRD_AGE: BirdAge = {
  description: 'Unknown',
  code: 'U'
};

const getBirdAge = (event: ApiEvent): BirdAge => {
  if (isNil(event) || isNil(event.characteristic_measurement)) {
    return UNKNOWN_BIRD_AGE;
  }
  const ageCharacteristic = event.characteristic_measurement.find(c => c.characteristic.name === 'age');
  if (isNil(ageCharacteristic)) {
    return UNKNOWN_BIRD_AGE;
  }
  return apiAgeToBirdAge(ageCharacteristic.value);
};

const apiAgeToBirdAge = (apiAge: string): BirdAge => {
  if (isNil(apiAge) || not(is(String, apiAge))) {
    return UNKNOWN_BIRD_AGE;
  }
  const age = apiAge.toUpperCase();
  switch (age) {
    case 'U':
      return UNKNOWN_BIRD_AGE;
    case 'P':
      return {
        description: 'Pullus (cannot fly)',
        code: age
      };
    case 'J':
      return {
        description: 'Juvenile',
        code: age
      };
    case 'A':
      return {
        description: 'adult',
        code: age
      };
    case '1 ':
      return {
        code: age,
        description: 'Immature / 1st year'
      };
    case '1+':
      return {
        code: age,
        description: 'a bird within its first year of life or older'
      };
    case '2-':
      return {
        code: age,
        description: 'a bird within its second year of life or younger  - excluding Pullus and Juvenile'
      };
    case '2+':
      return {
        code: age,
        description: 'a bird within its second year of life or older'
      };
    default:
      return UNKNOWN_BIRD_AGE;
  }
};

const UNKNOWN_BIRD_SEX: BirdSex = {
  description: 'Unknown',
  code: 'U'
};

const getBirdSex = (event: ApiEvent): BirdSex => {
  if (isNil(event) || isNil(event.characteristic_measurement)) {
    return UNKNOWN_BIRD_SEX;
  }
  const sexCharacteristic = event.characteristic_measurement.find(c => c.characteristic.name === 'sex');
  if (isNil(sexCharacteristic)) {
    return UNKNOWN_BIRD_SEX;
  }
  return apiSexToBirdSex(sexCharacteristic.value);
};

const apiSexToBirdSex = (apiBirdSex: string): BirdSex => {
  if (isNil(apiBirdSex) || not(is(String, apiBirdSex))) {
    return UNKNOWN_BIRD_SEX;
  }
  const birdSex = apiBirdSex.toUpperCase();
  switch (birdSex) {
    case 'M':
      return {
        code: birdSex,
        description: 'Male'
      };
    case 'F':
      return {
        code: birdSex,
        description: 'Female'
      };
    case 'U':
      return UNKNOWN_BIRD_SEX;
    case 'MU':
      return {
        description: 'Probably Male',
        code: birdSex
      };
    case 'FU':
      return {
        description: 'Probably Female',
        code: birdSex
      };
    default:
      return UNKNOWN_BIRD_SEX;
  }
};

const deriveDisplayName = (bands: Band[]): string => {
  // if there are no bands, the display name is `NONE`
  if (isEmpty(bands)) {
    return 'NONE';
  } else {
    // otherwise find the first band in the birds latest bands to have a band id
    for (const band of bands) {
      if (!(band.bandId === '-')) {
        return band.bandId;
      }
    }
    // if none of the bands have an ID return `NONE`
    return 'NONE';
  }
};

const apiEventDataToEventData = (eventData: ApiEvent): BirdEvent => {
  return {
    birdId: splitOrPlaceholder(eventData.bird_id),
    dateOfEvent: parseISO(pathOr('', ['event_timestamp'], eventData)),
    region: splitOrPlaceholder(eventData.location_description),
    dateUploaded: parseISO(pathOr('', ['row_creation_timestamp_'], eventData))
  };
};

const apiEventToBandConfiguration = (event: ApiEvent): Band[] => {
  return markConfigurationToBandConfiguration(event.mark_configuration ? event.mark_configuration : []);
};

@Injectable({
  providedIn: 'root'
})
export class BirdService {
  readonly baseUri: string;

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient, config: ConfigurationService) {
    this.baseUri = config.getConfig().apiUrl;
  }

  getBirds(): Observable<Bird[]> {
    const uri = `${this.baseUri}/birds`;
    return this.http.get(uri, this.httpOptions).pipe(
      map((response: any) => {
        return response.data.map(apiBirdToBird);
      })
    );
  }

  getBirdById(birdId: string): Observable<Bird> {
    const uri = `${this.baseUri}/birds/${birdId}`;
    return this.http.get(uri, this.httpOptions).pipe(map(apiBirdToBird));
  }

  getEventsForBirdId(limit: number, birdId: string, paginationToken: string): Observable<ListEventDataResponse> {
    let uri = `${this.baseUri}/birds/${birdId}/events?limit=${limit}`;
    if (not(isNil(paginationToken))) {
      uri = uri + `&paginationToken=${paginationToken}`;
    }
    return this.http.get(uri, this.httpOptions).pipe(map(transformApiEventResponseToListEventDataResponse));
  }

  putBirdName(birdId: string, friendlyName: string, nznbbsCode: number): Observable<any> {
    const uri = `${this.baseUri}/birds/${birdId}/`;
    return this.http.put(uri, { friendly_name: friendlyName, species_code_nznbbs: nznbbsCode }).pipe(map((resp: any) => {
      return { friendlyName: resp.data.friendly_name };
    }));
  }
}
