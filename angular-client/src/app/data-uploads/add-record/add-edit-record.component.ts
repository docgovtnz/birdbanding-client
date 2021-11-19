import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Characteristic, CharacteristicValue, ReferenceDataService, UploadEnums } from '../../services/reference-data.service';
import { DataUploadService } from '../services/data-upload.service';
import { forEach, isEmpty, isNil, not } from 'ramda';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

import { SingleDataRecord, ValidationResponse, ApiDataRecord, Markings } from '../services/data-upload-types';
import {
  addNumberOfBandGroups,
  addUnknownBandsToFormArray,
  MarkingDetail
} from '../../common/banding-description/banding-description.component';

import { API_ERROR_TYPE } from '../services/data-upload-transformer';
import { LoggingService } from '../../services/logging.service';
import { DUPLICATE_PREFERENCES_KEY, DuplicateFields } from '../../view-data/duplicate-modal/duplicate-modal.component';
import { single, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-add-record',
  templateUrl: './add-edit-record.component.html',
  styleUrls: ['./add-edit-record.component.scss']
})
export class AddEditRecordComponent implements OnInit, OnDestroy {
  recordForm: FormGroup;

  uploadEnums: UploadEnums;

  hasPrimaryMarkSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  validationErrors: string[] = [];

  validationWarnings: string[] = [];

  formType = 'ADD';

  eventId: string;

  submitting = false;

  characteristics: Characteristic[];

  characteristicValues: CharacteristicValue[] = Array<CharacteristicValue>();

  statusDetails = new Array<string>();

  statusDetailValues = new Array<string>();

  // keep track of if the form has been submitted yet
  hasPressedSubmit = false;

  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private fb: FormBuilder,
    private referenceDataService: ReferenceDataService,
    private dataUploadService: DataUploadService,
    private router: Router,
    private route: ActivatedRoute,
    private loggingService: LoggingService
  ) { }

  ngOnInit() {
    this.route.data.subscribe(({ isAdd, type }) => {
      this.formType = type;
    });

    this.referenceDataService.dataUploadSubject.pipe(takeUntil(this.destroy$)).subscribe(u => (this.uploadEnums = u));
    this.referenceDataService.characteristicsSubject.subscribe(characteristics => this.characteristics = characteristics);
    this.referenceDataService.dataUploadReplaySubject.subscribe(enums => {
      this.statusDetails = enums.statusDetails.map(sd => sd.id);
    });
    this.recordForm = this.fb.group({
      sightingType: [null, Validators.required],
      additionalInformation: [null, Validators.maxLength(2500)],
      eventId: [null],
      birdId: [null, Validators.pattern(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)],
      bandingEvent: this.fb.group({
        primaryMark: [''],
        bandingScheme: ['NZ_NON_GAMEBIRD'],
        dateOfEvent: [null, Validators.required],
        dateAccuracy: ['D'],
        timeOfEvent: [null, { validators: Validators.pattern('^$|^(([01][0-9])|(2[0-3])):[0-5][0-9]$'), updateOn: 'blur' }],
        registeredProject: [null, Validators.required],
        eventCode: [null, Validators.required],
        captureCode: [null, Validators.required],
        wildOrCaptive: [null, Validators.required],
        statusCode: [],
        condition: []
      }),
      marking: this.fb.group({
        captureMarkings: this.fb.group(
          {
            upperLeftBands: this.fb.array([]),
            lowerLeftBands: this.fb.array([]),
            upperRightBands: this.fb.array([]),
            lowerRightBands: this.fb.array([]),
            unknownBands: this.fb.array([])
          },
          { validators: [this.requiredBandGroupValidator('CAPTURE')] }
        ),
        releaseMarkings: this.fb.group(
          {
            upperLeftBands: this.fb.array([]),
            lowerLeftBands: this.fb.array([]),
            upperRightBands: this.fb.array([]),
            lowerRightBands: this.fb.array([]),
            unknownBands: this.fb.array([])
          },
          { validators: [this.requiredBandGroupValidator('RELEASE'), this.validatePrimaryMarkPlacement()] }
        )
      }),
      birdDetails: this.fb.group({
        species: [null, Validators.required],
        age: [],
        sex: [],
        mass: [null, Validators.pattern('^[-+]?[0-9]*\\.?[0-9]+$')],
        bodyCondition: [],
        billLength: [null, Validators.pattern('^[-+]?[0-9]*\\.?[0-9]+$')],
        wingLength: [null, Validators.pattern('^[-+]?[0-9]*\\.?[0-9]+$')],
        moultScore1: [null, Validators.pattern('^[-+]?[0-9]*\\.?[0-9]+$')],
        moultScore2: [null, Validators.pattern('^[-+]?[0-9]*\\.?[0-9]+$')],
        moultScore3: [null, Validators.pattern('^[-+]?[0-9]*\\.?[0-9]+$')],
        moultScore4: [null, Validators.pattern('^[-+]?[0-9]*\\.?[0-9]+$')],
        moultScore5: [null, Validators.pattern('^[-+]?[0-9]*\\.?[0-9]+$')],
        moultScore6: [null, Validators.pattern('^[-+]?[0-9]*\\.?[0-9]+$')],
        moultScore7: [null, Validators.pattern('^[-+]?[0-9]*\\.?[0-9]+$')],
        moultScore8: [null, Validators.pattern('^[-+]?[0-9]*\\.?[0-9]+$')],
        moultScore9: [null, Validators.pattern('^[-+]?[0-9]*\\.?[0-9]+$')],
        moultScore10: [null, Validators.pattern('^[-+]?[0-9]*\\.?[0-9]+$')],
        moultNotes: []
      }),
      additionalFields: this.fb.group({characteristicValues: this.fb.array([])}), // arrays seem to need to be nested in a group.
      statusDetails: this.fb.group({statusDetailValues: this.fb.array([])}),
      people: this.fb.group({
        primary: [null, Validators.required],
        reporter: [null, Validators.required],
        otherName: [null, Validators.maxLength(200)],
        otherContact: [
          null,
          {
            validators: Validators.compose([
              Validators.maxLength(200),
              Validators.pattern(
                '^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\' +
                  '.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$'
              )
            ]),
            updateOn: 'blur'
          }
        ]
      }),
      location: this.fb.group({
        region: [null, Validators.required],
        locationGeneral: [null, Validators.maxLength(2500)],
        locationDescription: [null, Validators.compose([Validators.maxLength(2500), Validators.required])],
        latitude: [
          null,
          Validators.compose([Validators.required, Validators.max(90), Validators.min(-90), Validators.pattern('-?\\d+\\.?\\d*')])
        ],
        longitude: [
          null,
          Validators.compose([Validators.required, Validators.max(180), Validators.min(-180), Validators.pattern('-?\\d+\\.?\\d*')])
        ],
        coordinateSystem: [{ value: 'WGS84', disabled: true }, Validators.required],
        accuracy: ['100']
      })
    });
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const eventId = params.get('eventId');
      if (not(isNil(eventId))) {
        this.eventId = eventId;
        this.dataUploadService.getSingleRecord(eventId).subscribe(singleRecord => {
          if (this.formType === 'EDIT') {
            this.characteristicValues = singleRecord.additionalFields.characteristicValues;
            this.statusDetailValues = singleRecord.statusDetails.statusDetailValues;
            this.buildEditForm(singleRecord);
          } else if (this.formType === 'DUPLICATE') {
            this.buildDuplicateForm(singleRecord);
          }
        });
      }
    });
    this.sightingType.valueChanges.subscribe(_ => {
      (this.marking.get('captureMarkings') as FormGroup).updateValueAndValidity();
      (this.marking.get('releaseMarkings') as FormGroup).updateValueAndValidity();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  get birdId(): FormControl {
    return this.recordForm.get('birdId') as FormControl;
  }

  get sightingType(): FormControl {
    return this.recordForm.get('sightingType') as FormControl;
  }

  get bandingEvent(): FormGroup {
    return this.recordForm.get('bandingEvent') as FormGroup;
  }

  get people(): FormGroup {
    return this.recordForm.get('people') as FormGroup;
  }

  get marking(): FormGroup {
    return this.recordForm.get('marking') as FormGroup;
  }

  get birdDetails(): FormGroup {
    return this.recordForm.get('birdDetails') as FormGroup;
  }

  get additionalFields(): FormGroup {
    return this.recordForm.get('additionalFields') as FormGroup;
  }

  get statusDetailsForm(): FormGroup {
    return this.recordForm.get('statusDetails') as FormGroup;
  }

  get locationForm(): FormGroup {
    return this.recordForm.get('location') as FormGroup;
  }

  get additionalInformation(): FormControl {
    return this.recordForm.get('additionalInformation') as FormControl;
  }

  get primaryMark(): FormControl {
    return this.bandingEvent.get('primaryMark') as FormControl;
  }

  submitForm(ignoreWarnings: boolean) {
    this.hasPressedSubmit = true;
    if (this.recordForm.invalid) {
      this.recordForm.markAllAsTouched();
    } else {
      this.validationErrors = [];
      this.validationWarnings = [];
      this.submitting = true;
      const recordToAdd: SingleDataRecord = this.recordForm.getRawValue() as SingleDataRecord;
      this.validateForm(recordToAdd)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (v: ValidationResponse) => {
            this.uploadForm(v.data.pop());
          },
          error => {
            if (error.type === API_ERROR_TYPE) {
              const proceedWithCreate = this.processValidationResponse(error, ignoreWarnings);
              if (proceedWithCreate) {
                this.uploadForm(error.data.pop());
              } else {
                this.submitting = false;
              }
            } else {
              this.handleUnexpectedError(error, 'validating create');
            }
          }
        );
    }
  }

  updateForm(ignoreWarnings: boolean) {
    this.hasPressedSubmit = true;
    if (this.recordForm.invalid) {
      this.recordForm.markAllAsTouched();
    } else {
      this.validationErrors = [];
      this.validationWarnings = [];
      this.submitting = true;
      const recordToAdd: SingleDataRecord = this.recordForm.getRawValue() as SingleDataRecord;
      this.dataUploadService.validateUpdateSingleRecord(recordToAdd).subscribe(
        (v: ValidationResponse) => {
          this.uploadUpdateForm(v.data.pop());
        },
        error => {
          if (error.type === API_ERROR_TYPE) {
            const proceedWithUpdate = this.processValidationResponse(error, ignoreWarnings);
            if (proceedWithUpdate) {
              this.uploadUpdateForm(error.data.pop());
            } else {
              this.submitting = false;
            }
          } else {
            this.handleUnexpectedError(error, 'validating update');
          }
        }
      );
    }
  }


  private uploadForm(recordToAdd: ApiDataRecord) {
    this.dataUploadService.createAddRecordSubmission(recordToAdd).subscribe(
      r => {
        this.router
          .navigate(['view-data', 'event', r.event.id], {
            queryParams: {
              status: 'added'
            }
          })
          .then(_ => {
            this.submitting = false;
          });
      },
      error => {
        if (error.type === API_ERROR_TYPE) {
          this.submitting = false;
          this.processValidationResponse(error, false);
        } else {
          this.handleUnexpectedError(error, 'uploading create');
        }
      }
    );
  }

  private uploadUpdateForm(recordToAdd: ApiDataRecord) {
    this.dataUploadService.updateSingleRecord(recordToAdd).subscribe(
      r => {
        this.router
          .navigate(['view-data', 'event', r.event.id], {
            queryParams: {
              status: 'updated'
            }
          })
          .then(_ => {
            this.submitting = false;
          });
      },
      error => {
        if (error.type === API_ERROR_TYPE) {
          this.submitting = false;
          this.processValidationResponse(error, false);
        } else {
          this.handleUnexpectedError(error, 'uploading update');
        }
      }
    );
  }

  private handleUnexpectedError(error, operation: string) {
    this.submitting = false;
    this.validationErrors.push('Unexpected error occurred');
    this.loggingService.logError(`Error ${operation} single record ${JSON.stringify(error)}`);
  }

  // process response, return true if there no errors and submission can continue
  processValidationResponse(v: ValidationResponse, ignoreWarnings): boolean {
    // if the validation response  has no errors pass the enriched payload onto the API
    if (isEmpty(v.errors) && (isEmpty(v.warnings) || ignoreWarnings)) {
      return true;
    } else {
      // otherwise display the errors on the bottom of the screen
      this.validationErrors = v.errors.map(e => e.message);
      if (not(ignoreWarnings)) {
        this.validationWarnings = v.warnings.map(e => e.message);
      }
      return false;
    }
  }

  private validateForm(recordToAdd: SingleDataRecord): Observable<ValidationResponse> {
    return this.dataUploadService.validateSingleRecord(recordToAdd);
  }

  jumpToId(id: string) {
    const el = document.getElementById(id);
    if (not(isNil(id))) {
      el.scrollIntoView();
    }
  }

  populateFieldValue(characteristicValues: CharacteristicValue[], formGroup: AbstractControl, code: string, fieldName: string = code) {
    formGroup.get(fieldName).setValue(characteristicValues.find(v => v.code === code)?.value);
  }

  buildEditForm(singleRecord: SingleDataRecord) {
    this.recordForm.patchValue(singleRecord);
    this.populateFieldValue(singleRecord.additionalFields.characteristicValues, this.recordForm.get('birdDetails'), 'sex');
    this.populateFieldValue(singleRecord.additionalFields.characteristicValues, this.recordForm.get('birdDetails'), 'age');
    this.populateFieldValue(singleRecord.additionalFields.characteristicValues, this.recordForm.get('birdDetails'), 'billlength', 'billLength');
    this.populateFieldValue(singleRecord.additionalFields.characteristicValues, this.recordForm.get('birdDetails'), 'winglength', 'wingLength');
    this.populateFieldValue(singleRecord.additionalFields.characteristicValues, this.recordForm.get('birdDetails'), 'mass', 'mass');
    this.populateFieldValue(singleRecord.additionalFields.characteristicValues, this.recordForm.get('birdDetails'), 'bodycondition', 'bodyCondition');
    this.populateFieldValue(singleRecord.additionalFields.characteristicValues, this.recordForm.get('bandingEvent'), 'outstatuscode', 'statusCode');
    this.populateFieldValue(singleRecord.additionalFields.characteristicValues, this.recordForm.get('bandingEvent'), 'outconditioncode', 'condition');
    const releaseMarkings = this.recordForm.get('marking').get('releaseMarkings') as FormGroup;
    this.buildReleaseMarkings(singleRecord.marking.releaseMarkings, releaseMarkings);
    this.updateUnknownBands(singleRecord.marking.unknownBands);
    this.additionalInformation.markAsTouched();
  }

  buildDuplicateForm(singleRecord: SingleDataRecord) {
    const fieldsToDuplicate: DuplicateFields = JSON.parse(localStorage.getItem(DUPLICATE_PREFERENCES_KEY)) as DuplicateFields;
    if (isNil(fieldsToDuplicate)) {
      return;
    }
    this.sightingType.patchValue(singleRecord.sightingType);
    if (fieldsToDuplicate.date) {
      this.bandingEvent.get('dateOfEvent').patchValue(singleRecord.bandingEvent.dateOfEvent);
      this.bandingEvent.get('dateAccuracy').patchValue(singleRecord.bandingEvent.dateAccuracy);
      this.bandingEvent.get('timeOfEvent').patchValue(singleRecord.bandingEvent.timeOfEvent);
    }
    if (fieldsToDuplicate.captureCode) {
      this.bandingEvent.get('captureCode').patchValue(singleRecord.bandingEvent.captureCode);
      this.bandingEvent.get('eventCode').patchValue(singleRecord.bandingEvent.eventCode);
      this.bandingEvent.get('wildOrCaptive').patchValue(singleRecord.bandingEvent.wildOrCaptive);
    }
    if (fieldsToDuplicate.primaryMark) {
      const nextPrimaryMark = incrementPrimaryMark(singleRecord.bandingEvent.primaryMark);
      this.bandingEvent.get('primaryMark').patchValue(nextPrimaryMark);
    }
    if (fieldsToDuplicate.registeredProject) {
      this.bandingEvent.get('registeredProject').patchValue(singleRecord.bandingEvent.registeredProject);
    }

    if (fieldsToDuplicate.species) {
      this.birdDetails.get('species').patchValue(singleRecord.birdDetails.species);
    }
    if (fieldsToDuplicate.eventLocation) {
      this.locationForm.patchValue(singleRecord.location);
    }
    if (fieldsToDuplicate.peopleInvolved) {
      this.people.patchValue(singleRecord.people);
    }
  }

  // add any unknow markings into the form
  updateUnknownBands(unknownBands: MarkingDetail[]) {
    const unknownBandsFormArray = this.marking.get('releaseMarkings').get('unknownBands') as FormArray;
    unknownBandsFormArray.clear();
    addUnknownBandsToFormArray(this.fb, unknownBandsFormArray, unknownBands);
  }

  // this is required to build the mark configuration back from an API record
  buildReleaseMarkings(markings: Markings, releaseMarkings: FormGroup) {
    const addMarkingsToFormArray = addNumberOfBandGroups(this.fb);
    if (markings.lowerRightBands.length > 0) {
      const lowerRightBands = releaseMarkings.get('lowerRightBands') as FormArray;
      lowerRightBands.clear();
      addMarkingsToFormArray(markings.lowerRightBands, lowerRightBands, {
        side: 'RIGHT',
        legLocation: 'TARSUS',
        displayPrefix: 'Lower right'
      });
    }
    if (markings.lowerLeftBands.length > 0) {
      const lowerLeftBands = releaseMarkings.get('lowerLeftBands') as FormArray;
      lowerLeftBands.clear();
      addMarkingsToFormArray(markings.lowerLeftBands, lowerLeftBands, {
        side: 'LEFT',
        legLocation: 'TARSUS',
        displayPrefix: 'Lower left'
      });
    }
    if (markings.upperLeftBands.length > 0) {
      const upperLeftBands = releaseMarkings.get('upperLeftBands') as FormArray;
      upperLeftBands.clear();
      addMarkingsToFormArray(markings.upperLeftBands, upperLeftBands, {
        side: 'LEFT',
        legLocation: 'TIBIA',
        displayPrefix: 'Upper left'
      });
    }
    if (markings.upperRightBands.length > 0) {
      const upperRightBands = releaseMarkings.get('upperRightBands') as FormArray;
      upperRightBands.clear();
      addMarkingsToFormArray(markings.upperRightBands, upperRightBands, {
        side: 'RIGHT',
        legLocation: 'TIBIA',
        displayPrefix: 'Upper right'
      });
    }
  }

  validatePrimaryMarkPlacement(): ValidatorFn {
    return (group: FormGroup) => {
      if (isNil(this.recordForm)) {
        return null;
      }
      const sightingTypeControl = this.sightingType;
      if (isNil(sightingTypeControl) || sightingTypeControl.value !== 'FIRST_MARKING') {
        return null;
      }
      const upperLeftBands = group.get('upperLeftBands') as FormArray;
      const lowerLeftBands = group.get('lowerLeftBands') as FormArray;
      const upperRightBands = group.get('upperRightBands') as FormArray;
      const lowerRightBands = group.get('lowerRightBands') as FormArray;
      const unknownBands = group.get('unknownBands') as FormArray;
      // if any of the band arrays has a primary mark set
      if (
        bandArrayHasPrimaryMark(upperLeftBands) ||
        bandArrayHasPrimaryMark(lowerLeftBands) ||
        bandArrayHasPrimaryMark(upperRightBands) ||
        bandArrayHasPrimaryMark(lowerRightBands) ||
        bandArrayHasPrimaryMark(unknownBands)
      ) {
        return null;
      }
      return {
        primaryMarkRequired: true
      };
    };
  }

  requiredBandGroupValidator(markingType: string): ValidatorFn {
    return (control: FormGroup): ValidationErrors | null => {
      if (isNil(this.recordForm)) {
        return null;
      }
      if (isNil(this.sightingType)) {
        return null;
      }

      // if it is a remarking only capture markings are mandatory
      if (markingType === 'RELEASE' && this.sightingType.value === 'REMARKING') {
        return null;
      }
      // if it is any other kind of marking only release markings are mandatory
      if (markingType === 'CAPTURE' && this.sightingType.value !== 'REMARKING') {
        return null;
      }
      const upperLeftBands = control.get('upperLeftBands') as FormArray;
      const lowerLeftBands = control.get('lowerLeftBands') as FormArray;
      const upperRightBands = control.get('upperRightBands') as FormArray;
      const lowerRightBands = control.get('lowerRightBands') as FormArray;
      const unknownBands = control.get('unknownBands') as FormArray;
      if (
        upperLeftBands.length === 0 &&
        lowerLeftBands.length === 0 &&
        upperRightBands.length === 0 &&
        lowerRightBands.length === 0 &&
        unknownBands.length === 0
      ) {
        return {
          markingRequired: true
        };
      } else {
        return null;
      }
    };
  }
}

const bandArrayHasPrimaryMark = (bandArray: FormArray): boolean => {
  for (const bandGroup of bandArray.controls) {
    if (!isNil(bandGroup.get('primaryMark')) && bandGroup.get('primaryMark').value) {
      return true;
    }
  }
  return false;
};

const incrementPrimaryMark = (previousPrimaryMark: string): string => {
  if (isNil(previousPrimaryMark)) {
    return '';
  }
  const [prefix, bandNumber] = previousPrimaryMark.split('-');
  const incrementedBandNumber = incrementStringNumber(bandNumber);
  if (isEmpty(incrementedBandNumber)) {
    return previousPrimaryMark;
  }
  return `${prefix}-${incrementedBandNumber}`;
};

const incrementStringNumber = (stringNumbers: string): string => {
  if (isNil(stringNumbers)) {
    return '';
  }
  let newStringNumbers = stringNumbers;
  try {
    const previousNumber = parseInt(stringNumbers, 10);
    const newNumber = previousNumber + 1;
    newStringNumbers = `${newNumber}`;
    // pad the band number with zeros until it is at least 4 characters long
    while (newStringNumbers.length < 4) {
      newStringNumbers = `0${newStringNumbers}`;
    }
  } catch (error) {
    console.error('Could not increment primary mark');
  }
  return newStringNumbers;
};
