import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ReferenceDataService, UploadEnums, ViewDataEnums } from '../../services/reference-data.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface MarkingDetail {
  position: string;
  side: string;
  bandType: string;
  markType: string;
  bandForm: string;
  bandColor: string;
  bandId: string;
  textColor: string;
  positionIndex: number;
  primaryMark: boolean;
}

@Component({
  selector: 'app-banding-description',
  templateUrl: './banding-description.component.html',
  styleUrls: ['./banding-description.component.scss']
})
export class BandingDescriptionComponent implements OnInit, OnDestroy {
  @Input()
  bandSide: string;

  @Input()
  isLegBand = true;

  @Input()
  legPart: string;

  legPrefix: string;

  @Input()
  hasPrimaryMarkSet: BehaviorSubject<boolean>;

  @Input()
  primaryMarkControl: FormControl;

  @Input()
  bandInformationName: string;

  @Input()
  parentFromGroup: FormGroup;

  @Input()
  showPrimaryMarkButton = false;

  numberOfBands: FormControl;

  bandNumbers = [0, 1, 2, 3, 4];

  bandType = [
    {
      display: null,
      value: null
    },
    {
      display: 'Metal',
      value: 'METAL'
    },
    {
      display: 'Colour',
      value: 'COLOUR'
    }
  ];

  bandSideValues = [
    {
      id: 'LEFT',
      display: 'Left'
    },
    {
      id: 'RIGHT',
      display: 'Right'
    }
  ];

  bandPosition = [
    {
      id: 'TARSUS',
      display: 'Lower'
    },
    {
      id: 'TIBIA',
      display: 'Upper'
    }
  ];

  uploadEnums: UploadEnums;

  viewDataEnums: ViewDataEnums;

  hasPrimaryMark = false;

  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private fb: FormBuilder, private referenceDataService: ReferenceDataService) {}

  ngOnInit() {
    this.legPrefix = `${this.legPart} ${this.bandSide}`;
    this.numberOfBands = this.fb.control(this.bandInformation.length);
    this.numberOfBands.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((nextValue: number) => {
      // if this description contains a primary mark unset it before it is deleted
      if (this.configurationHasPrimaryMark()) {
        this.hasPrimaryMarkSet.next(false);
      }
      this.bandInformation.clear();
      this.addNumberOfBandGroups(nextValue);
    });
    // set the number of bands if they came from the API, don't emit an event or else it will delete everything
    this.bandInformation.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(c => {
      this.numberOfBands.setValue(c.length, { emitEvent: false });
    });
    this.referenceDataService.dataUploadSubject.pipe(takeUntil(this.destroy$)).subscribe(u => (this.uploadEnums = u));
    this.referenceDataService.viewDataSubject.pipe(takeUntil(this.destroy$)).subscribe(v => (this.viewDataEnums = v));
    // listens the subject to see if any other descriptions have set the primary mark
    this.hasPrimaryMarkSet.pipe(takeUntil(this.destroy$)).subscribe(hasPrimaryMark => {
      this.hasPrimaryMark = hasPrimaryMark;
      // if the primary mark has changed back to false remove any potential primary mark from this description
      if (hasPrimaryMark === false) {
        this.removeAllPrimaryMarks();
      }
    });
    if (this.primaryMarkControl) {
      this.primaryMarkControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(nextValue => {
        if (this.hasPrimaryMark && this.configurationHasPrimaryMark()) {
          this.updatePrimaryMark(nextValue);
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  get bandInformation() {
    return this.parentFromGroup.get(this.bandInformationName) as FormArray;
  }

  configurationHasPrimaryMark() {
    for (const control of this.bandInformation.controls) {
      if (control.get('primaryMark').value) {
        return true;
      }
    }
    return false;
  }

  removeAllPrimaryMarks() {
    for (const control of this.bandInformation.controls) {
      if (control.get('primaryMark').value) {
        control.get('primaryMark').setValue(false);
        control.get('bandId').setValue('');
      }
    }
  }

  updatePrimaryMark(newPrimaryMark) {
    for (const control of this.bandInformation.controls) {
      if (control.get('primaryMark').value) {
        control.get('bandId').setValue(newPrimaryMark);
      }
    }
  }

  // makes the mark at that index primary, there can only be one primary mark
  addPrimaryMark(markIndex) {
    this.hasPrimaryMarkSet.next(true);
    this.bandInformation
      .at(markIndex)
      .get('primaryMark')
      .setValue(true);
    const bandId = this.bandInformation.at(markIndex).get('bandId');
    bandId.setValue(this.primaryMarkControl.value);
    bandId.disable();
  }

  // removes the primary status from the band at that index
  undoPrimaryMark(markIndex) {
    this.hasPrimaryMarkSet.next(false);
    this.bandInformation
      .at(markIndex)
      .get('primaryMark')
      .setValue(false);
    const bandId = this.bandInformation.at(markIndex).get('bandId');

    bandId.setValue('');
    bandId.enable();
  }

  addNumberOfBandGroups(numberToAdd: number) {
    for (let i = 0; i < numberToAdd; i++) {
      this.bandInformation.push(this.addBandFormGroup(i));
    }
    this.bandInformation.markAsDirty();
  }

  addBandFormGroup(locationIndex: number): FormGroup {
    const position = this.isLegBand ? translateLegLocation(this.legPart.toUpperCase()) : null;
    const side = this.isLegBand ? this.bandSide.toUpperCase() : null;
    const markType = this.isLegBand ? 'LEG_BAND' : null;
    return this.fb.group({
      position: [position],
      positionIndex: [locationIndex],
      side: [side],
      bandType: [null],
      bandForm: [null],
      bandColor: [null, Validators.maxLength(200)],
      bandId: [null, Validators.maxLength(200)],
      textColor: [null],
      primaryMark: [false],
      markType: [markType, Validators.required]
    });
  }
}

const translateLegLocation = (location: string) => {
  switch (location.toUpperCase()) {
    case 'LOWER':
      return 'TARSUS';
    case 'UPPER':
      return 'TIBIA';
    default:
      return '';
  }
};

export const addNumberOfBandGroups = (fb: FormBuilder) => (markings: MarkingDetail[], formArray: FormArray, positionDetails) => {
  const createFormGroup = createBandFormGroupFactory(fb);
  markings.forEach((marking, i) => {
    formArray.push(createFormGroup(i, positionDetails, marking));
  });
  formArray.markAsDirty();
};

const createBandFormGroupFactory = (fb: FormBuilder) => (
  locationIndex: number,
  { side, legLocation, displayPrefix },
  marking: MarkingDetail
): FormGroup => {
  return fb.group({
    position: [legLocation],
    positionIndex: [locationIndex],
    side: [side],
    bandType: [marking.bandType],
    bandForm: [marking.bandForm],
    bandColor: [marking.bandColor, Validators.maxLength(200)],
    bandId: [marking.bandId, Validators.maxLength(200)],
    textColor: [marking.textColor],
    primaryMark: [marking.primaryMark],
    markType: [marking.markType, Validators.required]
  });
};

export const addUnknownBandsToFormArray = (fb: FormBuilder, addToArray: FormArray, bands: MarkingDetail[]) => {
  const createBandGroup = markToFormGroup(fb);
  bands.forEach(b => {
    addToArray.push(createBandGroup(b));
  });
};

const markToFormGroup = (fb: FormBuilder) => (unknownBand: MarkingDetail): FormGroup => {
  return fb.group({
    position: [unknownBand.position],
    side: [unknownBand.side],
    bandType: [unknownBand.bandType],
    bandForm: [unknownBand.bandForm],
    bandColor: [unknownBand.bandColor],
    bandId: [unknownBand.bandId],
    textColor: [unknownBand.textColor],
    positionIndex: [unknownBand.positionIndex],
    primaryMark: [unknownBand.primaryMark],
    markType: [unknownBand.markType, Validators.required]
  });
};
