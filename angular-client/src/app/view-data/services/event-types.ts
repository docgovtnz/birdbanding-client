import { IdDisplay, Species, SpeciesGroup, ApiCharacteristicValue, CharacteristicValue, Characteristic } from '../../services/reference-data.service';
import { PeopleData } from '../../people/people-data';

// empty object to be used before the real one arrives
export const EMPTY_EVENT_DETAILS: EventDetails = {
  eventId: '',
  projectName: '',
  projectId: '',
  captureType: '',
  birdSituation: '',
  bandScheme: '',
  scientificName: '',
  bandNumber: '',
  bandPrefix: '',
  dateOfEvent: null,
  eventType: '',
  banderName: '',
  banderNumber: '',
  bbsCode: '',
  birdId: '',
  colourBand: '',
  commonName: '',
  dateUploaded: null,
  dateUpdated: null,
  hasBird: false,
  isBird: false,
  region: '',
  speciesCode: '',
  bandConfiguration: [],
  provider: {
    banderId: '',
    banderDisplay: '',
    banderNumber: '',
    banderName: ''
  },
  reporter: {
    banderId: '',
    banderDisplay: '',
    banderNumber: '',
    banderName: ''
  },
  longitude: '',
  latitude: '',
  lat: null,
  lng: null,
  coordinateSystem: '',
  locationAccuracy: '',
  comments: '',
  birdDisplayName: '',
  otherContact: '',
  otherName: '',
  characteristicValues: new Array<CharacteristicValue>(),
  statusDetailValues: new Array<string>()

};

export interface ListEventDataResponse {
  listData: EventData[];
  nextPaginationToken: string;
  prevPaginationToken: string;
  isLastPage: boolean;
  isFirstPage: boolean;
  selfPaginationToken: string;
}

export interface EventData {
  eventId: string;
  isBird: boolean;
  birdId: string;
  hasBird: boolean;
  bandPrefix: string;
  bandNumber: string;
  colourBand: string;
  dateOfEvent: Date;
  projectName: string;
  bbsCode: string;
  banderNumber: string;
  banderName: string;
  speciesCode: string;
  commonName: string;
  scientificName: string;
  region: string;
  dateUploaded: Date;
  dateUpdated: Date;
  lat: number;
  lng: number;
}

export interface Bander {
  banderNumber: string;
  banderName: string;
  banderDisplay: string;
  banderId: string;
}

export interface EventDetails extends EventData {
  eventType: string;
  bandScheme: string;
  captureType: string;
  birdSituation: string;
  bandConfiguration: Band[];
  reporter: Bander;
  provider: Bander;
  locationAccuracy: string;
  coordinateSystem: string;
  latitude: string;
  longitude: string;
  projectId: string;
  comments: string;
  birdDisplayName: string;
  otherName: string;
  otherContact: string;
  characteristicValues: CharacteristicValue[];
  statusDetailValues: string[];
}

export interface Link {
  href: string;
}

export interface FilterOptions {
  projects: Project[];
  species: Species[];
  showErrors: boolean;
  showMoratorium: boolean;
  locationDescription: string;
  bandingSchemes: IdDisplay[];
  bandCodes: IdDisplay[];
  uploadedBy: PeopleData[];
  speciesGroups: SpeciesGroup[];
  eventDates: Date[];
}

export interface AdvancedFilterOption {
  type: OptionType;
  value: any;
}

export type OptionType =
  | 'PROJECT'
  | 'EVENT_CODE'
  | 'SPECIES'
  | 'SPECIES_GROUP'
  | 'PERSON'
  | 'BANDING_SCHEME'
  | 'LOCATION_DESCRIPTION'
  | 'EVENT_DATE'
  | 'EVENT_DATE_RANGE'
  | 'BAND_NUMBER'
  | 'MARK'
  | 'ALPHA_TEXT'
  | 'COMMENTS'
  | 'COORDINATES'
  | 'FRIENDLY_NAME';

// begin api interfaces

export interface ApiAdvancedSearchBody {
  projectId: string[];
  speciesId: number[];
  speciesGroup: number[];
  bandingScheme: string[];
  reporterId: string[];
  providerId: string[];
  ownerId: string[];
  userId: string[];
  eventDate: string[];
  eventDateLte: string[];
  eventDateGte: string[];
  nznbbsCode: string[];
  latitudeLte: number[];
  latitudeGte: number[];
  longitudeLte: number[];
  longitudeGte: number[];
  locationDescription: string[];
  comments: string[];
  bandNumber: string[];
  otherAlphanumeric: string[];
  friendlyName: string[];
  markConfiguration: Mark[];
}

export interface ApiEventDataFlat {
  id: string;
  bird_id: string;
  event_type: string;
  row_creation_timestamp_: string;
  row_update_timestamp_: string,
  event_timestamp: string;
  event_reporter_id: string;
  event_provider_id: string;
  event_owner_id: string;
  event_banding_scheme: string;
  event_bird_situation: string;
  latitude: string;
  longitude: string;
  location_description: string;
  project_id: string;
  project_name: string;
  default_moratorium_expiry: string;
  common_name_nznbbs: string;
  scientific_name_nznbbs: string;
  species_code_nznbbs: number;
  species_group_name: string;
  reporter_nznbbs_certification_number: string;
  provider_nznbbs_certification_number: string;
  owner_nznbbs_certification_number: string;
  pagination_idx: number;
  prefix_number: string;
  short_number: string;
  historic_nznbbs_code: string;
  other_bands: boolean;
}

export interface EventResponseFlat {
  data: ApiEventDataFlat[];
  links: {
    self: Link;
    next: Link;
    prev: Link;
    count: number;
    isLastPage: boolean;
  };
}

export interface EventResponse {
  data: ApiEventData[];
  links: {
    self: Link;
    next: Link;
    prev: Link;
    count: number;
    isLastPage: boolean;
  };
}

export interface ApiEventData {
  event: ApiEvent;
  project: Project;
  mark_state: MarkState[];
  event_reporter: EventPerson;
  event_provider: EventPerson;
  calculated_fields: CalculatedFields;
  mark_configuration: Mark[];
  characteristic_measurement: ApiCharacteristicValue[];
  bird: {
    species_id: number;
  };
}

export interface ApiEvent {
  id: string;
  bird_id: string;
  event_type: string;
  event_timestamp: string;
  location_comment: string;
  location_description: string;
  row_creation_timestamp: string;
  row_creation_timestamp_: string;
  row_update_timestamp_: string;
  mark_configuration: Mark[];
  mark_state: MarkState[];
  characteristic_measurement: Chr[];
  event_bird_situation: string;
  event_capture_type: string;
  locality_accuracy: string;
  user_coordinate_system: string;
  latitude: string;
  longitude: string;
  event_banding_scheme: string;
  comments: string;
  event_timestamp_accuracy: string;
  event_other_person_name: string;
  event_other_contact: string;
  event_owner_id: string;
  event_reporter_id: string;
  event_provider_id: string;
  project_id: string;
  locality_general: string;
}

interface Chr {
  value: string;
  characteristic: {
    name: string;
  };
}

export interface MarkState {
  mark: Mark;
}

export interface Mark {
  prefix_number: string;
  short_number: string;
  alphanumeric_text: string;
  mark_material: string;
  position: string;
  mark_type: string;
  side: string;
  colour: string;
  mark_fixing: string;
  mark_form: string;
  location_idx: number;
  text_colour: string;
}

export interface Project {
  name: string;
  id: string;
}

interface CalculatedFields {
  historic_nznbbs_code: string;
  colour_bands: string;
}

export interface EventPerson {
  nznbbs_certification_number: string;
  full_name: string;
  person_name: string;
  id: string;
}

// bird types

export interface Bird {
  id: string;
  friendlyName: string;
  speciesCode: number;
  speciesGroup: string;
  scientificName: string;
  commonName: string;
  species: string;
  firstRecorded: Date;
  lastSeenAt: string;
  firstSeenAt: string;
  lastRecorded: Date;
  bands: Band[];
  birdDisplayName: string;
  age: BirdAge;
  sex: BirdSex;
  longevity: number;
  inferredBirdStatus: string;
  deltaFirstLastSightingKm: number;
  deltaMostRecentSightingKm: number;
  cumulativeDistanceKm: number;
  dispersalDistanceKm: number;
  earliestEvent: {
    eventOwnerId: string;
    eventProviderId: string;
    eventReporterId: string;
    projectId: string;
  }
}

export interface BirdAge {
  code: string;
  description: string;
}

export interface BirdSex {
  code: string;
  description: string;
}

export interface BirdEvent {
  birdId: string;
  dateOfEvent: Date;
  region: string;
  dateUploaded: Date;
}

export interface Band {
  leg: string;
  bandingPosition: string;
  colour: string;
  bandId: string;
  bandType: string;
  locationIndex: number;
  markForm: string;
  markFixing: string;
  textColour: string;
}

export interface ApiBird {
  bird: {
    id: string;
    row_creation_timestamp_: string;
    row_update_timestamp_: string;
    friendly_name: string;
    species_id: string;
    longevity: number;
    inferred_bird_status: string;
    delta_first_and_last_sighting_km: number;
    delta_most_recent_sighting_km: number;
    cumulative_distance_km: number;
    dispersal_distance_km: number;
  };
  species: BirdSpecies;
  earliest_event: ApiEvent;
  latest_event: ApiEvent;
}

export interface BirdSpecies {
  id: number;
  common_name_nznbbs: string;
  scientific_name_nznbbs: string;
  species_code_nznbbs: number;
  is_exotic: boolean;
  is_gamebird: boolean;
  valid_band_prefixes: string;
  bio_status: string;
  species: string;
  species_group_membership: SpeciesGroupMembership;
}

export interface SpeciesGroupMembership {
  species_group: {
    name: string;
  };
}

// intermediate datatypes
export interface DataEvent {
  birdId: string;
  dateOfEvent: Date;
  region: string;
  dateUploaded: Date;
  dateUpdated: Date;
}

export interface BandDetails {
  bandPrefix: string;
  bandNumber: string;
}

export interface EventCode {
  code: string;
  description: string;
  label: string;
  icon: string;
}

export interface SearchSort {
  sortField: string;
  order: SortOrder;
}

export type SortOrder = 'ASC' | 'DESC';
