// this represents the UI data model
import { MarkingDetail } from '../../common/banding-description/banding-description.component';
import { ApiCharacteristicValue, ApiCharacteristicValueSaveRec, CharacteristicValue } from '../../services/reference-data.service';

export interface SingleDataRecord {
  additionalFields: {
    characteristicValues: CharacteristicValue[];
  };
  statusDetails: {
    statusDetailValues: string[];
  };
  sightingType: string;
  additionalInformation: string;
  eventId: string;
  birdId: string;
  bandingEvent: {
    primaryMark: string;
    bandingScheme: string;
    dateOfEvent: Date;
    dateAccuracy: string;
    timeOfEvent: string;
    registeredProject: {
      name: string;
      id: string;
    };
    statusCode: string;
    condition: string;
    eventCode: string;
    captureCode: string;
    wildOrCaptive: string;
  };
  marking: {
    captureMarkings: Markings;
    releaseMarkings: Markings;
    unknownBands: MarkingDetail[];
  };
  birdDetails: {
    age: string;
    sex: string;
    mass: number;
    bodyCondition: string;
    billLength: number;
    wingLength: number;
    moultScore1: number;
    moultScore2: number;
    moultScore3: number;
    moultScore4: number;
    moultScore5: number;
    moultScore6: number;
    moultScore7: number;
    moultScore8: number;
    moultScore9: number;
    moultScore10: number;
    moultNotes: string;
    species: {
      id: number;
    };
  };
  people: {
    primary: {
      id: string;
    };
    reporter: {
      id: string;
    };
    otherName: string;
    otherContact: string;
  };
  location: {
    region: {
      display: string;
      id: string;
    };
    locationGeneral: string;
    locationDescription: string;
    latitude: string;
    longitude: string;
    coordinateSystem: string;
    accuracy: string;
  };
}

export interface Markings {
  upperLeftBands: MarkingDetail[];
  lowerLeftBands: MarkingDetail[];
  upperRightBands: MarkingDetail[];
  lowerRightBands: MarkingDetail[];
  unknownBands?: MarkingDetail[];
}

// represents the format the API expects a Single record
export interface ApiDataRecordBase {
  event: {
    id?: string;
    bird_id?: string;
    comments: string;
    event_banding_scheme: string;
    event_bird_situation: string;
    event_capture_type: string;
    event_provider_id: string;
    event_reporter_id: string;
    event_other_person_name: string;
    event_other_contact: string;
    event_state: string;
    event_timestamp: string;
    event_timestamp_accuracy: string;
    event_type: string;
    latitude: number;
    locality_accuracy: number;
    locality_general: string;
    location_comment: string;
    location_description: string;
    longitude: number;
    project_id: string;
    user_coordinate_system: string;
    user_easting: string;
    user_northing: string;
  };
  event_media: number;
  bird: {
    id: string;
    species_id: number;
  };
  characteristic_measurement: ApiCharacteristicValueSaveRec[];
}

export interface ApiDataRecord extends ApiDataRecordBase {
  mark_configuration_capture: any[];
  mark_configuration_release: any[];
}

export interface ApiDataUpdateRecord extends ApiDataRecordBase {
  mark_configuration: any[];
}

export interface ApiError {
  code: number;
  type: string;
  severity: string;
  message: string;
  keyword: string;
  property: string;
  value: string;
}

export interface ValidationResponse {
  type: string;
  data: ApiDataRecord[];
  errors: ApiError[];
  warnings: ApiError[];
}

export interface ApiValidationResponse {
  data: ApiDataRecord[];
  errors: ApiError[];
  warnings: ApiError[];
}
export interface PresignedUrlResponse {
  presignedUrl: string;
}

export interface ApiSpreadsheetRecord {
  object_path?: string;
  bander_id: string;
  project_id: string;
  file_size_in_bytes: number;
  object_version?: string;
  upload_status: UPLOAD_STATUS;
}

export interface ApiSpreadsheetList {
  data: ApiSpreadsheetDetail[];
  count_last_period: number;
}

export interface ApiSpreadsheetDetail extends ApiSpreadsheetRecord {
  bander_name: string;
  project_name: string;
  status_display?: string;
  no_of_rows: number;
  id: string;
  storage_host: string;
  changing?: boolean;
  errors?: SpreadsheetError[];
  warnings_count?: number;
  criticals_count?: number;
  url?: string;
  created_datetime?: string;
  byline?: string;
}

export interface Message {
  msg: string;
  type: string;
  timeout: number;
}

export type SpreadsheetError = {
  code: number;
  type: 'SCHEMA' | 'BUSINESS' | 'TYPE' | 'SYSTEM';
  severity: 'CRITICAL' | 'WARNING';
  message: string;
  keyword: string;
  property: string;
  lineNumber?: number;
  field?: string;
  value?: string;
};


export type UPLOAD_STATUS = 'PENDING_RESULT' | 'CRITICAL_FILE_FORMAT' | 'PASS_FILE_FORMAT' | 'WARNINGS'
  | 'CRITICALS' | 'WARNINGS_AND_CRITICALS' | 'PASS' | 'PUSHED_TO_DATABASE'
  | 'DEFUNCT' | 'PROCESS_ERROR' | 'REQUEST_FOR_APPROVAL' | 'ADMIN_REJECTED' | 'ADMIN_APPROVED';
