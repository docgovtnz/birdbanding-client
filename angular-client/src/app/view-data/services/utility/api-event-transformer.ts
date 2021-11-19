import {
  ApiEvent,
  ApiEventData,
  BandDetails,
  DataEvent,
  EventResponse,
  EventData,
  MarkState,
  EventDetails,
  EventPerson,
  Bander,
  Band,
  Mark,
  ApiEventDataFlat,
  EventResponseFlat,
  AdvancedFilterOption,
  ApiAdvancedSearchBody,
  Project
} from '../event-types';
import { isEmpty, isNil, map as rMap, map as ramdaMap, not, pathOr, toUpper } from 'ramda';
import { format, parseISO } from 'date-fns';
import { Characteristic, Species, SpeciesGroup, makeEventChar } from '../../../services/reference-data.service';
import { MarkSearchCriteria } from '../../mark-search/mark-search.component';
import { PeopleData } from '../../../people/people-data';
import { CoordinateRange } from '../../coordinate-search/coordinate-search.component';
import { isValidLatitude, isValidLongitude } from '../../../common/map-picker/map-picker.component';

export const transformApiEventResponseToListEventDataResponse = (res: EventResponse) => {
  return {
    listData: transformApiEventListToEventList(res.data),
    nextPaginationToken: paginationTokenFromPath(res.links.next.href),
    prevPaginationToken: paginationTokenFromPath(res.links.prev.href),
    selfPaginationToken: paginationTokenFromPath(res.links.self.href),
    isLastPage: res.links.isLastPage,
    // if this page includes a pagination token it can not be the first page
    isFirstPage: not(res.links.self.href.includes('paginationToken'))
  };
};

export const transformApiEventResponseFlatToListEventDataResponseFlat = (res: EventResponseFlat) => {
  return {
    listData: ramdaMap(apiEventDataFlatToEventData, res.data),
    nextPaginationToken: paginationTokenFromPath(res.links.next.href),
    prevPaginationToken: paginationTokenFromPath(res.links.prev.href),
    selfPaginationToken: paginationTokenFromPath(res.links.self.href),
    isLastPage: res.links.isLastPage,
    // if this page includes a pagination token it can not be the first page
    isFirstPage: not(res.links.self.href.includes('paginationToken'))
  };
};

export const apiEventToEventDetails = (apiEvent: ApiEventData, characteristics: Characteristic[]): EventDetails => {

  const statusDetailValue: string = (apiEvent.characteristic_measurement.find(cv => cv.name === 'status details')?.value as string);
  const statusDetailValues: Array<string> = statusDetailValue ? statusDetailValue.split(',') : new Array<string>();
  return {
    ...apiEventDataToEventData(apiEvent),
    eventType: splitOrPlaceholder(apiEvent.event.event_type),
    scientificName: pathOr('', ['bird', 'species', 'scientific_name_nznbbs'], apiEvent),
    bandScheme: splitOrPlaceholder(apiEvent.event.event_banding_scheme),
    birdSituation: splitOrPlaceholder(apiEvent.event.event_bird_situation),
    captureType: splitOrPlaceholder(apiEvent.event.event_capture_type),
    bandConfiguration: markConfigurationToBandConfiguration(apiEvent.mark_configuration),
    reporter: eventPersonToBander(apiEvent.event_reporter),
    provider: eventPersonToBander(apiEvent.event_provider),
    locationAccuracy: apiEvent.event.locality_accuracy ? `${apiEvent.event.locality_accuracy}m` : '-',
    coordinateSystem: splitOrPlaceholder(apiEvent.event.user_coordinate_system),
    latitude: apiEvent.event.latitude,
    longitude: apiEvent.event.longitude,
    projectId: apiEvent.project.id,
    comments: apiEvent.event.comments,
    birdDisplayName: pathOr('-', ['bird', 'friendly_name'], apiEvent),
    otherName: apiEvent.event.event_other_person_name,
    otherContact: apiEvent.event.event_other_contact,

    characteristicValues: apiEvent.characteristic_measurement.map(c => {
      return makeEventChar(c, characteristics);
    }),
    statusDetailValues
  };
};


export const splitOrPlaceholder = (databaseName: string): string => {
  if (isNil(databaseName) || isNil(databaseName)) {
    return '-';
  } else {
    const splitString = databaseName
      .toLowerCase()
      .split('_')
      .join(' ');
    return splitString.substr(0, 1).toUpperCase() + splitString.substr(1);
  }
};

// extract pagination token from URL return null if no token
const paginationTokenFromPath = (path: string) => {
  const paginationFragment = path.split('&').find(value => value.includes('paginationToken'));
  if (isNil(paginationFragment)) {
    return null;
  } else {
    return paginationFragment.split('=')[1];
  }
};

const transformApiEventListToEventList = (apiEventList: ApiEventData[]): EventData[] => {
  return ramdaMap(apiEventDataToEventData, apiEventList);
};

const bandPrefixMapper = markState => {
  return pathOr('', ['mark', 'prefix_number'], markState);
};

const bandNumberMapper = markState => {
  return pathOr('', ['mark', 'short_number'], markState);
};

const markStateToBandDetails = (markState: MarkState[]): BandDetails => {
  const bandNumbers = ramdaMap(bandNumberMapper, markState).filter(p => p !== '');
  const bandPrefixs = ramdaMap(toUpper, ramdaMap(bandPrefixMapper, markState)).filter(p => p !== '');
  // only display the first band prefix/number if one exists
  return {
    bandNumber: isEmpty(bandNumbers) ? '' : bandNumbers[0],
    bandPrefix: isEmpty(bandPrefixs) ? '' : bandPrefixs[0]
  };
};

const apiEventToDataEvent = (apiEvent: ApiEvent): DataEvent => {
  console.log(apiEvent.row_update_timestamp_);
  console.log(apiEvent.row_creation_timestamp_)
  return {
    birdId: valueOrString(apiEvent.bird_id),
    region: valueOrString(apiEvent.location_description),
    dateOfEvent: parseISO(apiEvent.event_timestamp),
    dateUploaded: parseISO(apiEvent.row_creation_timestamp_),
    dateUpdated: apiEvent.row_update_timestamp_? parseISO(apiEvent.row_update_timestamp_) : null,
  };
};

const valueOrString = value => (value ? value : '');

const isBirdEvent = (eventType: string) => {
  // all the event types that could relate to a bird
  const birdEvents = [
    'first_marking_in_hand',
    'sighting_by_person',
    'in_hand',
    'recorded_by_technology',
    'in_hand_pre_change',
    'in_hand_post_change'
  ];
  if (isNil(eventType)) {
    return false;
  } else {
    return birdEvents.includes(eventType.toLowerCase());
  }
};

const apiEventDataToEventData = (eventData: ApiEventData): EventData => {
  const event: DataEvent = apiEventToDataEvent(eventData.event);
  const bandDetails: BandDetails = markStateToBandDetails(eventData.mark_state);

  return {
    eventId: eventData.event.id,
    isBird: isBirdEvent(eventData.event.event_type),
    birdId: event.birdId,
    hasBird: not(isEmpty(event.birdId)),
    bandPrefix: bandDetails.bandPrefix,
    bandNumber: bandDetails.bandNumber,
    colourBand: pathOr(false, ['calculated_fields', 'colour_bands'], eventData) ? 'Y' : 'N',
    dateOfEvent: event.dateOfEvent,
    projectName: pathOr('', ['project', 'name'], eventData),
    banderNumber: pathOr('', ['event_reporter', 'nznbbs_certification_number'], eventData),
    banderName: pathOr('', ['event_reporter', 'full_name'], eventData),
    bbsCode: pathOr('', ['calculated_fields', 'historic_nznbbs_code'], eventData),
    speciesCode: pathOr('', ['bird', 'species', 'species_code_nznbbs'], eventData),
    region: event.region,
    dateUploaded: event.dateUploaded,
    dateUpdated: event.dateUpdated,
    scientificName: pathOr('', ['bird', 'species', 'scientific_name_nznbbs'], eventData),
    commonName: pathOr('', ['bird', 'species', 'common_name_nznbbs'], eventData),
    lat: Number(eventData.event.latitude),
    lng: Number(eventData.event.longitude)
  };
};

const eventPersonToBander = (person: EventPerson): Bander => {
  return {
    banderDisplay: isNil(person.nznbbs_certification_number)
      ? `${person.person_name} `
      : `${person.nznbbs_certification_number} - ${person.person_name} `,
    banderId: person.id,
    banderName: person.person_name,
    banderNumber: person.nznbbs_certification_number
  };
};

export const markConfigurationToBandConfiguration = markConfiguration => {
  return rMap(markToBand, markConfiguration).sort(legSort);
};
export const legSort = (b1: Band, b2: Band): number => {
  // first sort by band leg, left or right, if equal fall back to band position
  if (b1.leg.toUpperCase() === b2.leg.toUpperCase()) {
    return positionSort(b1, b2);
  } else if (b1.leg.toUpperCase() === 'LEFT' && b2.leg.toUpperCase() === 'RIGHT') {
    return -1;
  } else if (b1.leg.toUpperCase() === 'RIGHT' && b2.leg.toUpperCase() === 'LEFT') {
    return 1;
  } else {
    // should be unreachable
    return 0;
  }
};

const positionSort = (b1: Band, b2: Band): number => {
  // sort by position  TIBIA || TARSUS, if the same fall back to band index
  if (b1.bandingPosition.toUpperCase() === b2.bandingPosition.toUpperCase()) {
    return indexSort(b1, b2);
  } else if (b1.bandingPosition.toUpperCase() === 'TIBIA' && b2.bandingPosition.toUpperCase() === 'TARSUS') {
    return -1;
  } else if (b1.bandingPosition.toUpperCase() === 'TARSUS' && b2.bandingPosition.toUpperCase() === 'TIBIA') {
    return 1;
  } else {
    // should be unreachable
    return 0;
  }
};

const indexSort = (b1: Band, b2: Band): number => {
  const locationIndex1 = b1.locationIndex;
  const locationIndex2 = b2.locationIndex;
  if (isNil(locationIndex1) && isNil(locationIndex2)) {
    return 0;
  } else if (isNil(locationIndex1) && not(isNil(locationIndex2))) {
    return 1;
  } else if (not(isNil(locationIndex1)) && isNil(locationIndex2)) {
    return -1;
  } else {
    return locationIndex1 - locationIndex2;
  }
};

const markToBand = (mark: Mark): Band => {
  return {
    bandId: splitOrPlaceholder(mark.alphanumeric_text),
    bandType: splitOrPlaceholder(mark.mark_type),
    bandingPosition: splitOrPlaceholder(mark.position),
    colour: splitOrPlaceholder(mark.colour),
    leg: splitOrPlaceholder(mark.side),
    locationIndex: mark.location_idx,
    markForm: splitOrPlaceholder(mark.mark_form),
    markFixing: splitOrPlaceholder(mark.mark_fixing),
    textColour: splitOrPlaceholder(mark.text_colour)
  };
};

export const apiEventDataFlatToEventData = (data: ApiEventDataFlat): EventData => {
  const lat = data.latitude ? Number(data.latitude) : null;
  const lng = data.longitude ? Number(data.longitude) : null;
  const dateOfEvent = data.event_timestamp ? parseISO(data.event_timestamp) : null;
  const dateUploaded = data.row_creation_timestamp_ ? parseISO(data.row_creation_timestamp_) : null;
  const dateUpdated = data.row_update_timestamp_ ? parseISO(data.row_update_timestamp_) : null;
  return {
    scientificName: data.scientific_name_nznbbs,
    birdId: data.bird_id,
    colourBand: data.other_bands ? 'Y' : 'N',
    speciesCode: `${data.species_code_nznbbs}`,
    bbsCode: data.historic_nznbbs_code,
    eventId: data.id,
    banderName: '',
    banderNumber: data.reporter_nznbbs_certification_number,
    bandNumber: data.short_number,
    bandPrefix: data.prefix_number,
    commonName: data.common_name_nznbbs,
    dateOfEvent,
    dateUploaded,
    dateUpdated,
    projectName: data.project_name,
    region: data.location_description,
    hasBird: !isNil(data.species_code_nznbbs),
    isBird: !isNil(data.species_code_nznbbs),
    lat,
    lng
  };
};

export const advancedFilterOptionsToApiAdvancedSearch = (advancedSearchOptions: AdvancedFilterOption[]): ApiAdvancedSearchBody => {
  const apiAdvancedSearchBody: ApiAdvancedSearchBody = emptyApiAdvancedSearchBody();
  advancedSearchOptions.forEach(o => {
    if (!isNil(o) && !isNil(o.value)) {
      switch (o.type) {
        case 'BAND_NUMBER':
          apiAdvancedSearchBody.bandNumber.push(o.value);
          break;
        case 'ALPHA_TEXT':
          apiAdvancedSearchBody.otherAlphanumeric.push(o.value);
          break;
        case 'FRIENDLY_NAME':
          apiAdvancedSearchBody.friendlyName.push(o.value);
          break;
        case 'SPECIES_GROUP':
          const speciesGroup: SpeciesGroup = o.value as SpeciesGroup;
          apiAdvancedSearchBody.speciesGroup.push(speciesGroup.id);
          break;
        case 'BANDING_SCHEME':
          apiAdvancedSearchBody.bandingScheme.push(o.value.id);
          break;
        case 'PERSON':
          const peopleData = o.value as PeopleData;
          apiAdvancedSearchBody.userId.push(peopleData.id);
          break;
        case 'LOCATION_DESCRIPTION':
          apiAdvancedSearchBody.locationDescription.push(o.value);
          break;
        case 'PROJECT':
          const project = o.value as Project;
          apiAdvancedSearchBody.projectId.push(project.id);
          break;
        case 'SPECIES':
          const species = o.value as Species;
          apiAdvancedSearchBody.speciesId.push(species.id);
          break;
        case 'EVENT_CODE':
          apiAdvancedSearchBody.nznbbsCode.push(o.value.id);
          break;
        case 'COMMENTS':
          apiAdvancedSearchBody.comments.push(o.value);
          break;
        case 'EVENT_DATE':
          const eventDate = o.value;
          if (!isNil(eventDate)) {
            const eventDateString = format(eventDate, 'yyyy-MM-dd');
            apiAdvancedSearchBody.eventDate.push(eventDateString);
          }
          break;
        case 'EVENT_DATE_RANGE':
          const [eventDateStart, eventDateEnd] = o.value;
          if (!isNil(eventDateStart) && !isNil(eventDateEnd)) {
            const startDateString = format(eventDateStart, 'yyyy-MM-dd');
            apiAdvancedSearchBody.eventDateGte.push(startDateString);
            const endDateString = format(eventDateEnd, 'yyyy-MM-dd');
            apiAdvancedSearchBody.eventDateLte.push(endDateString);
          }
          break;
        case 'MARK':
          const markSearch: MarkSearchCriteria = o.value as MarkSearchCriteria;
          apiAdvancedSearchBody.markConfiguration.push({
            mark_type: markSearch.type,
            text_colour: null,
            colour: markSearch.bandColour,
            alphanumeric_text: markSearch.alphaNumericText,
            mark_form: markSearch.form,
            side: markSearch.leg,
            position: markSearch.position,
            location_idx: null,
            mark_material: null,
            mark_fixing: null,
            prefix_number: null,
            short_number: null
          });
          break;
        case 'COORDINATES':
          const { maxLat, maxLng, minLat, minLng } = o.value as CoordinateRange;
          if (!isNil(maxLat) && isValidLatitude(maxLat)) {
            apiAdvancedSearchBody.latitudeLte.push(parseFloat(maxLat));
          }
          if (!isNil(minLat) && isValidLatitude(minLat)) {
            apiAdvancedSearchBody.latitudeGte.push(parseFloat(minLat));
          }
          if (!isNil(maxLng) && isValidLongitude(maxLng)) {
            apiAdvancedSearchBody.longitudeLte.push(parseFloat(maxLng));
          }
          if (!isNil(minLng) && isValidLongitude(minLng)) {
            apiAdvancedSearchBody.longitudeGte.push(parseFloat(minLng));
          }
      }
    }
  });
  return apiAdvancedSearchBody;
};

export const emptyApiAdvancedSearchBody = (): ApiAdvancedSearchBody => ({
  bandingScheme: [],
  bandNumber: [],
  comments: [],
  eventDate: [],
  eventDateGte: [],
  eventDateLte: [],
  latitudeGte: [],
  latitudeLte: [],
  locationDescription: [],
  longitudeGte: [],
  longitudeLte: [],
  markConfiguration: [],
  nznbbsCode: [],
  otherAlphanumeric: [],
  ownerId: [],
  projectId: [],
  providerId: [],
  reporterId: [],
  speciesGroup: [],
  speciesId: [],
  userId: [],
  friendlyName: []
});
