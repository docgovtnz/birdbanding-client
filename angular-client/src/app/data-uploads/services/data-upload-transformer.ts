import {
  ApiDataRecord,
  ApiDataRecordBase,
  ApiDataUpdateRecord,
  ApiValidationResponse,
  Markings,
  SingleDataRecord,
  ValidationResponse,
} from './data-upload-types';
import { equals, isEmpty, isNil, not } from 'ramda';
import { MarkingDetail } from '../../common/banding-description/banding-description.component';
import { format, formatISO, parseISO, set } from 'date-fns';
import { ReferenceDataService, ApiCharacteristicValueSaveRec, Characteristic,
  CharacteristicValue, makeEventChar, Species, stringToIdDisplay } from '../../services/reference-data.service';
import { ApiEventData, Mark } from '../../view-data/services/event-types';
import { Project } from '../../projects/services/project-types';
import { PeopleData } from '../../people/people-data';

export const API_ERROR_TYPE = 'API_ERROR';

export const apiValidationResponseToValidationResponse = (
  apiValidationResponse: ApiValidationResponse,
  status: number
): ValidationResponse => {
  if (isNil(apiValidationResponse.errors) || status >= 500) {
    return {
      type: API_ERROR_TYPE,
      data: null,
      errors: [
        {
          severity: 'CRITICAL',
          message: 'An uxepected error occured ',
          code: 500,
          keyword: '',
          property: '',
          type: '',
          value: '',
        },
      ],
      warnings: [],
    };
  }
  return {
    type: API_ERROR_TYPE,
    data: apiValidationResponse.data,
    errors: apiValidationResponse.errors.filter((e) => e.severity === 'CRITICAL'),
    warnings: apiValidationResponse.errors.filter((e) => e.severity === 'WARNING'),
  };
};

export const singleDataRecordToCreateRecord = (record: SingleDataRecord, charNameToId: (s: string) => number): ApiDataRecord => {
  return {
    ...mapCommonApiFields(record, charNameToId),
    mark_configuration_capture: equals(record.sightingType, 'REMARKING')
      ? markingDetailsToMarkConfiguration(record.marking.captureMarkings)
      : [],
    mark_configuration_release: markingDetailsToMarkConfiguration(record.marking.releaseMarkings),
  };
};

export const singleDataRecordToUpdateRecord = (record: SingleDataRecord, charNameToId: (s: string) => number): ApiDataUpdateRecord => {
  const updateRecord = {
    ...mapCommonApiFields(record, charNameToId),
    mark_configuration: markingDetailsToMarkConfiguration(record.marking.releaseMarkings),
  };
  updateRecord.event.id = record.eventId;
  updateRecord.event.bird_id = record.birdId;
  updateRecord.bird.id = record.birdId;
  return updateRecord;
};

const mapCommonApiFields = (record: SingleDataRecord, chrNameToId: (s: string) => number): ApiDataRecordBase => {
  return {
    event: {
      comments: record.additionalInformation,
      event_banding_scheme: record.bandingEvent.bandingScheme,
      event_bird_situation: record.bandingEvent.wildOrCaptive,
      event_capture_type: record.bandingEvent.captureCode,
      event_provider_id: record.people.primary ? record.people.primary.id : null,
      event_reporter_id: record.people.reporter ? record.people.reporter.id : null,
      event_other_person_name: record.people.otherName,
      event_other_contact: isEmpty(record.people.otherContact) ? null : record.people.otherContact,
      event_state: 'AWAITING_REVIEW', // Banding Office to review records
      event_timestamp: calculateEventDateTime(
        record.bandingEvent.dateOfEvent,
        record.bandingEvent.timeOfEvent,
        record.bandingEvent.dateAccuracy
      ),
      event_timestamp_accuracy: record.bandingEvent.dateAccuracy,
      event_type: record.bandingEvent.eventCode,
      latitude: parseFloat(record.location.latitude),
      locality_accuracy: parseInt(record.location.accuracy, 10),
      locality_general: record.location.locationGeneral,
      location_comment: record.location.region.id,
      location_description: record.location.locationDescription,
      longitude: parseFloat(record.location.longitude),
      project_id: record.bandingEvent.registeredProject ? record.bandingEvent.registeredProject.id : null,
      user_coordinate_system: record.location.coordinateSystem,
      user_easting: null,
      user_northing: null,
    },
    event_media: 0,
    bird: {
      id: null,
      species_id: record.birdDetails.species.id
    },
    characteristic_measurement: reconstituteCharValues(record, chrNameToId)
  };
};

function reconstituteCharValues(record: SingleDataRecord, chrNameToId: (s: string) => number): ApiCharacteristicValueSaveRec[] {
  const serialisedRecs = record.additionalFields.characteristicValues.map(c => {
    let val: string;
    if (c.dataType === 'DATETIME') {
      val = (c.value as Date).toISOString();
    }
    else {
      val = c.value.toString();
    }
    return { characteristic_id: c.characteristicId, value: val };
  });

  const charMapping = new Map<string, string | number | Date>([
    ['sex', record.birdDetails.sex],
    ['age', record.birdDetails.age],
    ['bill length', record.birdDetails.billLength],
    ['wing length', record.birdDetails.wingLength],
    ['mass', record.birdDetails.mass],
    ['body condition', record.birdDetails.bodyCondition],
    ['out status code', record.bandingEvent.statusCode],
    ['out condition code', record.bandingEvent.condition],
    ['moult score', getMoultScoreValue(record)],
    ['status details', getStatusDetailValue(record)],
    ['moult notes', record.birdDetails.moultNotes]
    ]);

  charMapping.forEach((val, code) => {
    if (val !== null && val !== '' && val !== undefined) {
      const charId = chrNameToId(code);
      serialisedRecs.push( { value: val, characteristic_id: charId } as ApiCharacteristicValueSaveRec);
    }
  });
  return serialisedRecs;
}

const getMoultScoreValue = (record: SingleDataRecord): string => {
  const d = record.birdDetails;
  const moultScores = [d.moultScore1, d.moultScore2, d.moultScore3, d.moultScore4, d.moultScore5,
    d.moultScore6, d.moultScore7, d.moultScore8, d.moultScore9, d.moultScore10];
  if (moultScores.findIndex(ms => !!ms) !== -1) {
    return moultScores.join(',');
  }
  else {
    return null;
  }
};

const getStatusDetailValue = (record: SingleDataRecord): string => {
  if (record.statusDetails.statusDetailValues.length >= 1) {
    return record.statusDetails.statusDetailValues.join(',');
  }
  else {
    return null;
  }
};

export const markingDetailsToMarkConfiguration = ({
  upperLeftBands,
  lowerLeftBands,
  upperRightBands,
  lowerRightBands,
  unknownBands,
}: Markings): any[] => {
  const legMarkings = [
    ...upperLeftBands.map(markDetailToMark),
    ...lowerLeftBands.map(markDetailToMark),
    ...upperRightBands.map(markDetailToMark),
    ...lowerRightBands.map(markDetailToMark),
  ];
  if (isNil(unknownBands)) {
    return legMarkings;
  } else {
    const repositionedBands = fixLocationIndexOfUnknownBands(unknownBands, {
      upperLeftLength: upperLeftBands.length,
      lowerLeftLength: lowerLeftBands.length,
      upperRightLength: upperRightBands.length,
      lowerRightLength: lowerRightBands.length,
    });
    return [...legMarkings, ...repositionedBands.map(unknownBandToMark)];
  }
};
// if unknown bands have moved onto a leg we need to adjust their positionIndex
const fixLocationIndexOfUnknownBands = (unknownBands: MarkingDetail[], legDetailLengths) => {
  let { upperLeftLength, lowerLeftLength, upperRightLength, lowerRightLength } = legDetailLengths;
  unknownBands.forEach((m) => {
    if (m.side === 'LEFT' && m.position === 'TIBIA' && m.markType === 'LEG_BAND') {
      m.positionIndex = upperLeftLength;
      upperLeftLength = upperLeftLength + 1;
    } else if (m.side === 'LEFT' && m.position === 'TARSUS' && m.markType === 'LEG_BAND') {
      m.positionIndex = lowerLeftLength;
      lowerLeftLength = lowerLeftLength + 1;
    } else if (m.side === 'RIGHT' && m.position === 'TIBIA' && m.markType === 'LEG_BAND') {
      m.positionIndex = upperRightLength;
      upperRightLength = upperRightLength + 1;
    } else if (m.side === 'RIGHT' && m.position === 'TARSUS' && m.markType === 'LEG_BAND') {
      m.positionIndex = lowerRightLength;
      lowerRightLength = lowerRightLength + 1;
    }
  });

  return unknownBands;
};

const unknownBandToMark = (u: MarkingDetail): any => {
  return {
    location_idx: u.positionIndex,
    position: u.position,
    side: u.side,
    mark_material: bandTypeToMarkMaterial(u.bandType),
    mark_form: u.bandForm,
    alphanumeric_text: u.bandId,
    colour: u.bandColor,
    text_colour: u.textColor,
    mark_type: u.markType,
    mark_fixing: null,
  };
};

export const markConfigurationToMarkingDetails = (marks: Mark[]): Markings => {
  return {
    upperLeftBands: marks
      .filter(
        (m) => upperIfDefined(m.side) === 'LEFT' && upperIfDefined(m.position) === 'TIBIA' && upperIfDefined(m.mark_type) === 'LEG_BAND'
      )
      .map(markToMarkDetail),
    lowerLeftBands: marks
      .filter(
        (m) => upperIfDefined(m.side) === 'LEFT' && upperIfDefined(m.position) === 'TARSUS' && upperIfDefined(m.mark_type) === 'LEG_BAND'
      )
      .map(markToMarkDetail),
    upperRightBands: marks
      .filter(
        (m) => upperIfDefined(m.side) === 'RIGHT' && upperIfDefined(m.position) === 'TIBIA' && upperIfDefined(m.mark_type) === 'LEG_BAND'
      )
      .map(markToMarkDetail),
    lowerRightBands: marks
      .filter(
        (m) => upperIfDefined(m.side) === 'RIGHT' && upperIfDefined(m.position) === 'TARSUS' && upperIfDefined(m.mark_type) === 'LEG_BAND'
      )
      .map(markToMarkDetail),
  };
};

export const marksToUnknownBands = (marks: Mark[]): MarkingDetail[] => {
  if (isNil(marks)) {
    return [];
  }
  return marks
    .filter((m) => m.side === null || m.position === null || upperIfDefined(m.mark_type) !== 'LEG_BAND')
    .map((mark) => {
      return {
        positionIndex: mark.location_idx,
        position: mark.position,
        side: mark.side,
        bandType: markMaterialToBandType(mark.mark_material),
        bandForm: mark.mark_form,
        bandId: mark.alphanumeric_text,
        bandColor: mark.colour,
        textColor: mark.text_colour,
        primaryMark: false,
        markType: mark.mark_type,
      };
    });
};

const upperIfDefined = (s: string): string => {
  if (isNil(s)) {
    return s;
  } else {
    return s.toUpperCase();
  }
};

export const markDetailToMark = (markingDetail: MarkingDetail): any => {
  return {
    alphanumeric_text: markingDetail.bandId ? markingDetail.bandId : null,
    colour: markingDetail.bandColor ? markingDetail.bandColor : null,
    location_idx: markingDetail.positionIndex,
    mark_fixing: null,
    mark_form: markingDetail.bandForm,
    mark_id: null,
    mark_material: bandTypeToMarkMaterial(markingDetail.bandType), // METAL or PLASTIC_UNSPECIFIED IF COLOUR
    mark_type: markingDetail.markType ? markingDetail.markType : 'LEG_BAND',
    other_description: null, // roadmap - support other mark types
    position: markingDetail.position,
    side: markingDetail.side,
    text_colour: markingDetail.textColor ? markingDetail.textColor : null,
  };
};

const markToMarkDetail = (mark: Mark): MarkingDetail => {
  return {
    position: mark.position,
    side: mark.side,
    primaryMark: false,
    positionIndex: mark.location_idx,
    bandType: markMaterialToBandType(mark.mark_material),
    bandForm: mark.mark_form,
    bandColor: mark.colour,
    bandId: mark.alphanumeric_text,
    textColor: mark.text_colour,
    markType: mark.mark_type,
  };
};

export const bandTypeToMarkMaterial = (bandType: string): string => {
  if (bandType === 'COLOUR') {
    return 'PLASTIC_UNSPECIFIED';
  } else if (isNil(bandType)) {
    return null;
  } else {
    return bandType;
  }
};

export const markMaterialToBandType = (markMaterial: string): string => {
  if (markMaterial === 'PLASTIC_UNSPECIFIED') {
    return 'COLOUR';
  } else if (isNil(markMaterial)) {
    return null;
  } else {
    return markMaterial;
  }
};

export const calculateEventDateTime = (eventDate: Date, eventTime: string, dateAccuracy: string): string => {
  if (isNil(eventDate)) {
    return null;
  }
  const dateOnly = formatISO(
    set(eventDate, {
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    })
  );
  // if the date accuracy isn't to the day, the time doesn't matter
  if (not(equals(dateAccuracy, 'D')) || isNil(eventTime) || isEmpty(eventTime)) {
    return dateOnly;
  }
  const [hours, minutes] = eventTime.split(':');
  if (isNil(hours) || isNil(minutes)) {
    return dateOnly;
  }
  return formatISO(
    set(eventDate, {
      hours: parseInt(hours, 10),
      minutes: parseInt(minutes, 10),
      seconds: 0,
      milliseconds: 0,
    })
  );
};

export const mapCharacteristicNameToId = (characteristics: Characteristic[]) => (characteristicName: string): number => {
  const characteristic = characteristics.find((c) => c.name === characteristicName);
  if (isNil(characteristic)) {
    throw new Error(`Can't find characteristic name for ${characteristicName}`);
  }
  return characteristic.id;
};
// this had to be defined up her because linters started fighting when it was defined inline
export const characteristicsNotReady = (s: string): number => {
  throw new Error('characteristics not ready yet');
  return 0;
};

const eventTypeToSightingType = (sightingType: string) => {
  switch (sightingType) {
    case 'FIRST_MARKING_IN_HAND':
      return 'FIRST_MARKING';
    case 'IN_HAND_PRE_CHANGE':
      return 'PRE_CHANGE';
    case 'IN_HAND_POST_CHANGE':
      return 'POST_CHANGE';
    case 'NEW_MARK':
      return 'REMARKING';
    case 'SIGHTING_BY_PERSON':
    case 'IN_HAND':
    case 'RECORDED_BY_TECHNOLOGY':
      return 'RESIGHTING';
    default:
      return 'RESIGHTING';
  }
};

const markConfigurationToPrimaryMark = (markConfig: Mark[]): string => {
  // find the first mark with text, check it has a - in it so we have something to split on
  // they all should have a -
  for (const mark of markConfig) {
    if (not(isNil(mark.alphanumeric_text))) {
      return mark.alphanumeric_text;
    }
  }
  return '';
};

export const eventDetailsToSingleRecord = ([eventDetails, projects, people, speciesList, characteristics]): SingleDataRecord => {
  const event: ApiEventData = eventDetails as ApiEventData;
  const characteristicValues = event.characteristic_measurement.map(c => makeEventChar(c, characteristics));
  const sex = (event.characteristic_measurement.find(cm => cm.name === 'sex')?.value as string);
  const age = (event.characteristic_measurement.find(cm => cm.name === 'age')?.value as string);
  const billLength = parseFloat(event.characteristic_measurement.find(cm => cm.name === 'billlength')?.value.toString());
  const wingLength = parseFloat(event.characteristic_measurement.find(cm => cm.name === 'winglength')?.value.toString());
  const bodyCondition = (event.characteristic_measurement.find(cm => cm.name === 'bodycondition')?.value as string);
  const mass = parseFloat(event.characteristic_measurement.find(cm => cm.name === 'mass')?.value.toString());
  const condition = (event.characteristic_measurement.find(cm => cm.name === 'outconditioncode')?.value as string);
  const statusCode = (event.characteristic_measurement.find(cm => cm.name === 'outstatuscode')?.value as string);
  const statusDetailValue = (event.characteristic_measurement.find(cm => cm.name === 'status details')?.value as string);
  const moultNotes = (event.characteristic_measurement.find(cm => cm.name === 'moult notes')?.value as string);
  const statusDetailValues = statusDetailValue ? statusDetailValue.split(',') : new Array<string>();
  const species = (speciesList as Species[]).find((s) => s.id === event.bird.species_id);
  const project = (projects as Project[]).find((p) => p.id === event.project.id);
  const reporter = (people as PeopleData[]).find((p) => p.id === event.event_reporter.id);
  const primary = (people as PeopleData[]).find((p) => p.id === event.event_provider.id);
  const primaryMark = markConfigurationToPrimaryMark(event.mark_configuration);
  const markings = markConfigurationToMarkingDetails(event.mark_configuration);
  const region = stringToIdDisplay(false)(event.event.location_comment);
  const moultScoreValue = characteristicValues.find(cm => cm.name === 'moult score');
  const moultScores = getMoultScores(moultScoreValue);
  return {
    additionalFields: {
      characteristicValues
    },
    statusDetails: {
      statusDetailValues
    },
    sightingType: eventTypeToSightingType(event.event.event_type),
    additionalInformation: event.event.comments,
    eventId: event.event.id,
    birdId: event.event.bird_id,
    bandingEvent: {
      primaryMark,
      bandingScheme: event.event.event_banding_scheme,
      dateOfEvent: parseISO(event.event.event_timestamp),
      dateAccuracy: event.event.event_timestamp_accuracy,
      timeOfEvent: event.event.event_timestamp_accuracy === 'D' ? format(parseISO(event.event.event_timestamp), 'HH:mm') : null,
      registeredProject: project,
      eventCode: event.event.event_type,
      captureCode: event.event.event_capture_type,
      wildOrCaptive: event.event.event_bird_situation,
      condition,
      statusCode
    },
    marking: {
      captureMarkings: {
        upperRightBands: [],
        upperLeftBands: [],
        lowerLeftBands: [],
        lowerRightBands: [],
        unknownBands: [],
      },
      releaseMarkings: markings,
      unknownBands: marksToUnknownBands(event.mark_configuration),
    },
    birdDetails: {
      age,
      sex,
      billLength,
      wingLength,
      bodyCondition,
      mass,
      species,
      moultScore1: moultScores[0],
      moultScore2: moultScores[1],
      moultScore3: moultScores[2],
      moultScore4: moultScores[3],
      moultScore5: moultScores[4],
      moultScore6: moultScores[5],
      moultScore7: moultScores[6],
      moultScore8: moultScores[7],
      moultScore9: moultScores[8],
      moultScore10: moultScores[9],
      moultNotes,
    },
    people: {
      primary,
      reporter,
      otherName: event.event.event_other_person_name,
      otherContact: event.event.event_other_contact,
    },
    location: {
      region,
      locationGeneral: event.event.locality_general,
      locationDescription: event.event.location_description,
      latitude: event.event.latitude,
      longitude: event.event.longitude,
      coordinateSystem: event.event.user_coordinate_system,
      accuracy: `${event.event.locality_accuracy}`,
    },
  };
};

export const getMoultScores = (moultScoreValue: CharacteristicValue): number[] => {
  if (!moultScoreValue) {
    return new Array<number>(10);
  }
  return moultScoreValue.value.toString().split(',').map(Number);
};


