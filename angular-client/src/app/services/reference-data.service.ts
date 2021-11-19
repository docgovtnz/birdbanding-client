import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { BehaviorSubject, forkJoin, ObservableInput, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNil, not } from 'ramda';

import { ConfigurationService } from './configuration.service';
import { BirdSex, EventCode } from '../view-data/services/event-types';

import { parseISO, format } from 'date-fns';

export interface ApiCharacteristic {
  characteristic_id: number;
  id: number;
  name: string;
  display: string;
  unit: string;
  unit_descriptor;
  datatype: 'TEXT' | 'NUMERIC' | 'DATETIME' | 'ARRAY';
}

export interface ApiCharacteristicValue extends ApiCharacteristic {
  value: string | [];
}

export interface Characteristic {
  id: number;
  name: string;
  code: string;
  display: string;
  unit: string;
  unitDescriptor: string;
  dataType: 'TEXT' | 'NUMERIC' | 'DATETIME' | 'ARRAY';
}

export interface CharacteristicValue extends Characteristic {
  characteristicId: number;
  value?: string | number | Date | [];
  displayValue?: string;
}

export interface ApiCharacteristicValueSaveRec {
  characteristic_id: number;
  value: string;
}

export interface Species {
  id: number;
  species_code_nznbbs: string;
  is_exotic: boolean;
  is_gamebird: boolean;
  valid_band_prefixes: string[];
  scientific_name_nznbbs: string;
  common_name_nznbbs: string;
  description: string;
}

export interface IdDisplay {
  id: string;
  display: string;
}

export interface IdDisplayValue extends IdDisplay {
  value: string;
}

export interface SpeciesGroup {
  id: number;
  name: string;
}

export interface StockEnums {
  PREFIX_NUMBERS: string[];
  MARK_STATUS_SEARCH: string[];
  MARK_STATUS_CAN_TRANSFER: string[];
  MARK_STATUS_FROM_NEW: string[];
  MARK_STATUS_FROM_ALLOCATED: string[];
  MARK_STATUS_FROM_RETURNED: string[];
  MARK_STATUS_FROM_LOST: string[];
  MARK_STATUS_FROM_ATTACHED: string[];
  MARK_STATUS_FROM_DETACHED: string[];
  MARK_STATUS_FROM_PRACTICE: string[];
  MARK_STATUS_FROM_RETURNED_USED: string[];
  MARK_STATUS_FROM_OTHER: string[];
  MARK_STATUS_CAN_DELETE: string[];
}


export const DATE_ACCURACY: IdDisplay[] = [
  {
    id: 'D',
    display: 'Day'
  },
  {
    id: 'M',
    display: 'Month'
  },
  {
    id: 'Y',
    display: 'Year'
  },
  {
    id: 'U',
    display: 'Unknown'
  }
];

export const CONDITIONS: IdDisplayValue[] = [
  {
    id: 'alive',
    display: 'Alive',
    value: 'ALIVE'
  },
  {
    id: 'injured',
    display: 'Injured',
    value: 'INJURED'
  },
  {
    id: 'dead-recent',
    display: 'Freshly dead',
    value: 'DEAD_RECENT'
  },
  {
    id: 'long-dead',
    display: 'Long dead',
    value: 'DEAD_NOT_RECENT'
  }
];

export const BIRD_SEXES: BirdSex[] = [
  {
    code: 'M',
    description: 'Male'
  },
  {
    code: 'F',
    description: 'Female'
  },
  {
    description: 'Probably Male',
    code: 'MU'
  },
  {
    description: 'Probably Female',
    code: 'FU'
  },
  {
    description: 'Unknown',
    code: 'U'
  }
];

export const EVENT_CODES: EventCode[] = [
  {
    code: '1',
    description: 'First marking',
    label: 'firstMarking',
    icon: 'red_hollow_circle.png'
  },
  {
    code: 'Z',
    description: 'Foreign Scheme band/mark',
    label: 'foreign',
    icon: 'purple_triangle.png'
  },
  {
    code: '2A',
    description: 'Resighted without being caught',
    label: 'resighted',
    icon: 'yellow_triangle.png'
  },
  {
    code: '2B',
    description: 'Recaptured (but not re-marked)',
    label: 'recaptured',
    icon: 'red_circle.png'
  },
  {
    code: '2C',
    description: 'Technology assisted retrap',
    label: 'retrap',
    icon: 'lightblue_rec.png'
  },
  {
    code: '2D',
    description: 'Translocation release',
    label: 'transloc',
    icon: 'green_rec.png'
  },
  {
    code: '3',
    description: 'Add/Change/Remove mark',
    label: 'change',
    icon: 'purple_circle.png'
  },
  {
    code: 'C',
    description: 'Captive/rehab history',
    label: 'Captive',
    icon: 'green_rec_outline.png'
  },
{
    code: 'X',
    description: 'Dead: Recovery',
    label: 'dead',
    icon: 'grey_circle.png'
  }
];

export interface UploadEnums {
  eventTypeBirdDisplay: IdDisplay[];
  eventTypeBird: IdDisplay[];
  firstMarkingEvents: IdDisplay[];
  reMarkingEvents: IdDisplay[];
  reSightingEvents: IdDisplay[];
  eventType: IdDisplay[];
  wildOrCaptive: IdDisplay[];
  captureCode: IdDisplay[];
  statusCode: IdDisplay[];
  statusDetails: IdDisplay[];
  conditionCode: IdDisplay[];
  coordinateSystem: string[];
  birdAge: string[];
  bandColours: IdDisplay[];
  bandForms: IdDisplay[];
  regions: IdDisplay[];
}

export const EMPTY_UPLOAD_ENUMS: UploadEnums = {
  wildOrCaptive: [],
  eventTypeBird: [],
  statusCode: [],
  statusDetails: [],
  eventTypeBirdDisplay: [],
  eventType: [],
  conditionCode: [],
  captureCode: [],
  coordinateSystem: [],
  reMarkingEvents: [],
  reSightingEvents: [],
  firstMarkingEvents: [],
  birdAge: [],
  bandColours: [],
  bandForms: [],
  regions: []
};

interface ApiUploadEnums {
  EVENT_TYPE_BIRD_DISPLAY: string[];
  EVENT_TYPE_BIRD_FIRST_MARKING: string[];
  EVENT_TYPE_BIRD_REMARKING: string[];
  EVENT_TYPE_BIRD_RESIGHTING_RECOVERY: string[];
  EVENT_TYPE_BIRD: string[];
  EVENT_TYPE: string[];
  WILD_CAPTIVE: string[];
  CAPTURE_CODE: string[];
  STATUS_CODE: string[];
  STATUS_DETAILS: string[];
  CONDITION_CODE: string[];
  COORDINATE_SYSTEM: string[];
  BIRD_AGE: string[];
  MARK_CONFIGURATION_COLOUR: string[];
  MARK_CONFIGURATION_FORM: IdDisplay[];
  REGION: string[];
}


export const apiCharToChar = (char: ApiCharacteristic): Characteristic => {
    return {
      display: char.display,
      id: char.id,
      name: char.name,
      code: char.name.toLowerCase().replace(/ /g, ''),
      unit: char.unit,
      dataType: char.datatype
    } as Characteristic;
};

export const makeEventChar = (char: ApiCharacteristicValue, allChars: Characteristic[]): CharacteristicValue => {
  const charType = allChars.find(c => c.id === char.characteristic_id);
  let value;
  let displayValue;
  if (charType.dataType === 'DATETIME') {
    value = parseISO(char.value.toString());
    displayValue = format(value, 'dd/MM/yyyy');
  }
  else if (charType.dataType === 'ARRAY') {
    value = char.value.toString().split(',');
    displayValue = char.value.toString();
  }
  else if (charType.dataType === 'TEXT') {
    const strVal = char.value.toString().replace(/_/g, ' ');
    displayValue = strVal[0].toUpperCase() + strVal.slice(1).toLowerCase();
    value = char.value;
  }
  else {
    value = char.value;
    displayValue = char.value;
  }

  return {
    displayValue,
    characteristicId: char.characteristic_id,
    display: char.display,
    dataType: charType.dataType,
    id: char.id,
    name: char.name,
    code: charType.code,
    unit: char.unit,
    unitDescriptor: char.unit_descriptor,
    value
  } as CharacteristicValue;
};

const apiUploadEnumsToUploadEnums = (apiUploadEnums: ApiUploadEnums): UploadEnums => {
  return {
    captureCode: mapIdDisplayOrEmptyList(apiUploadEnums.CAPTURE_CODE),
    conditionCode: mapIdDisplayOrEmptyList(apiUploadEnums.CONDITION_CODE),
    eventType: mapIdDisplayOrEmptyList(apiUploadEnums.EVENT_TYPE),
    eventTypeBirdDisplay: mapIdDisplayOrEmptyList(apiUploadEnums.EVENT_TYPE_BIRD_DISPLAY),
    statusCode: mapIdDisplayOrEmptyList(apiUploadEnums.STATUS_CODE),
    statusDetails: mapIdDisplayOrEmptyList(apiUploadEnums.STATUS_DETAILS),
    wildOrCaptive: mapIdDisplayOrEmptyList(apiUploadEnums.WILD_CAPTIVE),
    coordinateSystem: apiUploadEnums.COORDINATE_SYSTEM,
    reMarkingEvents: mapIdDisplayOrEmptyList(apiUploadEnums.EVENT_TYPE_BIRD_REMARKING),
    firstMarkingEvents: mapIdDisplayOrEmptyList(apiUploadEnums.EVENT_TYPE_BIRD_FIRST_MARKING),
    reSightingEvents: mapIdDisplayOrEmptyList(apiUploadEnums.EVENT_TYPE_BIRD_RESIGHTING_RECOVERY),
    birdAge: apiUploadEnums.BIRD_AGE,
    bandColours: mapIdDisplayOrEmptyList(apiUploadEnums.MARK_CONFIGURATION_COLOUR),
    bandForms: apiUploadEnums.MARK_CONFIGURATION_FORM,
    regions: mapIdDisplayOrEmptyList(apiUploadEnums.REGION),
    eventTypeBird: mapIdDisplayOrEmptyList(apiUploadEnums.EVENT_TYPE_BIRD)
  };
};

const apiViewProjectsEnumsToViewProjectsEnums = (vewProjectsEnums: ApiViewProjectsEnums): ViewProjectsEnums => {
  return {
    projectState: mapIdDisplayOrEmptyList(vewProjectsEnums.PROJECT_STATE)
  };
};

interface ApiViewProjectsEnums {
  PROJECT_STATE: string[];
}

export interface ViewProjectsEnums {
  projectState: IdDisplay[];
}

const EMPTY_VIEW_PROJECT_ENUMS: ViewProjectsEnums = {
  projectState: []
};

export interface ViewDataEnums {
  birdEventCodes: IdDisplay[];
  bandingSchemes: IdDisplay[];
  markTypes: IdDisplay[];
}

interface ApiViewDataEnums {
  EVENT_CODE_BIRD: IdDisplay[];
  EVENT_BANDING_SCHEME: string[];
  MARK_TYPE: string[];
}

const apiViewDataEnumsToViewDataEnums = (apiViewData: ApiViewDataEnums): ViewDataEnums => {
  return {
    birdEventCodes: apiViewData.EVENT_CODE_BIRD,
    bandingSchemes: mapIdDisplayOrEmptyList(apiViewData.EVENT_BANDING_SCHEME, true),
    markTypes: mapIdDisplayOrEmptyList(apiViewData.MARK_TYPE, true)
  };
};

export const EMPTY_VIEW_DATA_ENUMS: ViewDataEnums = {
  birdEventCodes: [],
  bandingSchemes: [],
  markTypes: []
};

const mapIdDisplayOrEmptyList = (listToMap: any[], upperCase: boolean = false): IdDisplay[] => {
  if (isNil(listToMap)) {
    return [];
  }
  return listToMap.map(stringToIdDisplay(upperCase));
};

export const stringToIdDisplay = (upperCase: boolean) => (s: string): IdDisplay => {
  if (isNil(s)) {
    return null;
  }
  const splitString = s.split('_').join(' ');
  if (upperCase) {
    return {
      display: splitString.toUpperCase(),
      id: s
    };
  } else {
    const lowerSplitString = splitString.toLowerCase();
    return {
      display: lowerSplitString.substr(0, 1).toUpperCase() + lowerSplitString.substr(1),
      id: s
    };
  }
};

@Injectable({
  providedIn: 'root'
})
export class ReferenceDataService {
  public speciesSubject: BehaviorSubject<Species[]> = new BehaviorSubject<Species[]>([]);
  public speciesGroupSubject: ReplaySubject<SpeciesGroup[]> = new ReplaySubject<SpeciesGroup[]>();
  public regionSubject: BehaviorSubject<IdDisplay[]> = new BehaviorSubject<IdDisplay[]>([]);
  public stockSubject: ReplaySubject<StockEnums> = new ReplaySubject<StockEnums>();
  public characteristicsSubject: ReplaySubject<Characteristic[]> = new ReplaySubject<Characteristic[]>();
  public characteristicNameToIdSubject: ReplaySubject<(s: string) => number> = new ReplaySubject<(s: string) => number>();
  public dataUploadSubject: BehaviorSubject<UploadEnums> = new BehaviorSubject<UploadEnums>(EMPTY_UPLOAD_ENUMS);
  public dataUploadReplaySubject: ReplaySubject<UploadEnums> = new ReplaySubject<UploadEnums>();
  public viewProjectSubject: BehaviorSubject<ViewProjectsEnums> = new BehaviorSubject<ViewProjectsEnums>(EMPTY_VIEW_PROJECT_ENUMS);
  public viewDataSubject: BehaviorSubject<ViewDataEnums> = new BehaviorSubject<ViewDataEnums>(EMPTY_VIEW_DATA_ENUMS);
  private hasLoaded = false;

  private readonly baseApiUri;

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient, configurationService: ConfigurationService) {
    const config = configurationService.getConfig();
    this.baseApiUri = config.apiUrl;
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'X-Api-Key': config.apiKey
      })
    };
    this.loadReferenceData();
  }

  loadReferenceData() {
    if (not(this.hasLoaded)) {
      this.hasLoaded = true;
      forkJoin([this.getSpecies(), this.getSpeciesGroups(), this.getCharacteristics()]).subscribe(
        ([species, speciesGroups, characteristics]) => {
          this.speciesSubject.next(species);
          this.speciesGroupSubject.next(speciesGroups);
          this.characteristicsSubject.next(characteristics);
          const charNameToId = (chars => {
            return (name) => chars.find(c => c.name === name).id;
          })(characteristics);
          this.characteristicNameToIdSubject.next(charNameToId);
        }
      );
      forkJoin([this.getStockEnums(), this.getDataUploadEnums(), this.getViewProjectsEnums(), this.getViewDataEnums()]).subscribe(
        ([stockEnums, dataUploadEnums, viewProjectEnums, viewDataEnums]) => {
          this.stockSubject.next(stockEnums);
          this.dataUploadSubject.next(dataUploadEnums);
          this.dataUploadReplaySubject.next(dataUploadEnums);
          this.viewProjectSubject.next(viewProjectEnums);
          this.viewDataSubject.next(viewDataEnums);
          this.regionSubject.next(dataUploadEnums.regions);
        }
      );
    }
  }

  private getSpecies(): ObservableInput<Species[]> {
    return this.http.get(`${this.baseApiUri}/species`, this.httpOptions).pipe(
      map((species: Species[]) => {
        return species.map((s: Species) => {
          return {
            ...s,
            description: s.species_code_nznbbs + ' - ' + s.common_name_nznbbs + ' - ' + s.scientific_name_nznbbs
          };
        });
      })
    );
  }

  private getSpeciesGroups(): ObservableInput<SpeciesGroup[]> {
    return this.http.get(`${this.baseApiUri}/species-groups`, this.httpOptions);
  }

  private getStockEnums(): ObservableInput<StockEnums> {
    return this.http.get(`${this.baseApiUri}/enums/manageStock`, this.httpOptions);
  }

  private getCharacteristics(): ObservableInput<Characteristic[]> {
    return this.http.get(`${this.baseApiUri}/characteristics`, this.httpOptions).pipe(map(
      (apiChars: ApiCharacteristic[]) => apiChars.map(apiCharToChar)));
  }

  private getDataUploadEnums(): ObservableInput<UploadEnums> {
    return this.http.get(`${this.baseApiUri}/enums/dataUpload`, this.httpOptions).pipe(map(apiUploadEnumsToUploadEnums));
  }

  private getViewProjectsEnums(): ObservableInput<ViewProjectsEnums> {
    return this.http.get(`${this.baseApiUri}/enums/viewProjects`, this.httpOptions).pipe(map(apiViewProjectsEnumsToViewProjectsEnums));
  }

  private getViewDataEnums(): ObservableInput<ViewDataEnums> {
    return this.http.get(`${this.baseApiUri}/enums/viewData`, this.httpOptions).pipe(map(apiViewDataEnumsToViewDataEnums));
  }
}
