import { Injectable } from '@angular/core';
import { add, format, startOfDay } from 'date-fns';
import { ConfigurationService } from '../../services/configuration.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isNil } from 'ramda';
import { MarkingDetail } from '../../common/banding-description/banding-description.component';

export interface BirdDetails {
  marked: boolean;
  condition: string;
  name: string;
  speciesId: number;
  recognised: boolean;
}

export interface LocationDetails {
  dateSighted: Date;
  timeSighted: string;
  sightingLatitude: string;
  sightingLongitude: string;
  sightingRegion: string;
  sightingDescription: string;
}

export interface MarkingDetails {
  upperLeftBands: MarkingDetail[];
  lowerLeftBands: MarkingDetail[];
  upperRightBands: MarkingDetail[];
  lowerRightBands: MarkingDetail[];
  unknownBands: MarkingDetail[];
  additionalInformation: string;
}

interface ApiSightingDetails {
  public_event: {
    event_type: string;
    out_status_code: string;
    out_condition_code: string;
    event_timestamp: string;
    species_id: number;
    latitude: number;
    longitude: number;
    location_comment: string;
    location_description: string;
    other_mark_comments: string;
    contact_person_name: string;
    contact_email: string;
    follow_up_requested: boolean;
    comments: string;
    count_event_media_requested: number;
  };
  mark_configuration: ApiMarkConfiguration[];
}

interface ApiMarkConfiguration {
  side: string | null;
  position: string | null; // TIBIA ||TARSUS
  location_idx: number;
  mark_type: string; // LEG_BAND || OTHER
  mark_material: string | null;
  colour: string | null;
  alphanumeric_text: string | null;
}

export interface ReporterDetails {
  detailName: string;
  detailEmail: string;
  detailContact: boolean;
}

const bandDetailsToApiMarkConfiguration = (bandDetail: MarkingDetail, index: number): ApiMarkConfiguration => {
  return {
    colour: bandDetail.bandColor, // only colour bands can have a color
    location_idx: index,
    mark_material: bandDetail.bandType === 'METAL' ? bandDetail.bandType : null, // the only material can be metal
    mark_type: 'LEG_BAND',
    position: bandDetail.position,
    side: bandDetail.side,
    alphanumeric_text: bandDetail.bandId
  };
};

const dateTimeFromDateAndTime = (date: Date, time: string): Date => {
  const stateOfEventDay = startOfDay(date);
  const [eventHours, eventMinutes] = time.split(':');
  return add(stateOfEventDay, {
    hours: parseInt(eventHours, 10),
    minutes: parseInt(eventMinutes, 10)
  });
};

const markingDetailsToMarkConfiguration = (markings: MarkingDetails) => {
  const markConfiguration: ApiMarkConfiguration[] = [];
  markConfiguration.push(...markings.lowerLeftBands.map(bandDetailsToApiMarkConfiguration));
  markConfiguration.push(...markings.lowerRightBands.map(bandDetailsToApiMarkConfiguration));
  markConfiguration.push(...markings.upperLeftBands.map(bandDetailsToApiMarkConfiguration));
  markConfiguration.push(...markings.upperRightBands.map(bandDetailsToApiMarkConfiguration));
  markConfiguration.push(...markings.unknownBands.map(bandDetailsToApiMarkConfiguration));
  return markConfiguration;
};

const formDetailsToApiSightingDetails = (
  bird: BirdDetails,
  location: LocationDetails,
  markings: MarkingDetails,
  reporter: ReporterDetails
): ApiSightingDetails => {
  const eventDateTime = dateTimeFromDateAndTime(location.dateSighted, location.timeSighted);
  const markConfiguration: ApiMarkConfiguration[] = markingDetailsToMarkConfiguration(markings);
  return {
    public_event: {
      comments: null,
      contact_email: reporter.detailEmail,
      contact_person_name: reporter.detailName,
      event_type: 'SIGHTING_BY_PERSON',
      out_status_code: bird.condition !== 'INJURED' ? bird.condition : 'ALIVE', // injured birds are alive
      out_condition_code: bird.condition === 'INJURED' ? '2' : null,
      follow_up_requested: reporter.detailContact,
      latitude: parseFloat(location.sightingLatitude),
      longitude: parseFloat(location.sightingLongitude),
      location_comment: location.sightingRegion,
      location_description: isNil(location.sightingDescription) ? '' : location.sightingDescription,
      other_mark_comments: markings.additionalInformation,
      species_id: bird.speciesId,
      event_timestamp: format(eventDateTime, `yyyy-MM-dd'T'HH:mm:ss.SSSxxx`),
      count_event_media_requested: 0
    },
    mark_configuration: markConfiguration
  };
};

@Injectable({
  providedIn: 'root'
})
export class SightingReportService {
  readonly baseUri: string;

  private readonly httpOptions;

  constructor(private configurationService: ConfigurationService, private http: HttpClient) {
    const config = configurationService.getConfig();
    this.baseUri = config.apiUrl;
    const apiKey = config.apiKey;
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey
      })
    };
  }

  submitPublicSighting(bird: BirdDetails, location: LocationDetails, markings: MarkingDetails, reporter: ReporterDetails): Observable<any> {
    const apiRequest = formDetailsToApiSightingDetails(bird, location, markings, reporter);
    const uri = `${this.baseUri}/public-events`;
    return this.http.post(uri, apiRequest, this.httpOptions);
  }
}
