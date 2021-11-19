import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ProjectService } from '../../projects/services/project.service';
import { DATE_ACCURACY, IdDisplay, ReferenceDataService, UploadEnums, ViewDataEnums } from '../../services/reference-data.service';
import { Project } from '../../projects/services/project-types';
import { setHours, setMinutes, setSeconds } from 'date-fns';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-banding-event',
  templateUrl: './banding-event.component.html',
  styleUrls: ['./banding-event.component.scss']
})
export class BandingEventComponent implements OnInit, OnDestroy {
  @Input()
  bandingEventForm: FormGroup;

  @Input()
  sightingType: FormControl;

  projects: Project[];

  viewDataEnums: ViewDataEnums;

  dateAccuracies: IdDisplay[] = DATE_ACCURACY;

  eventTypeDisplay: IdDisplay[] = [];

  isFirstMarking: boolean;

  uploadEnums: UploadEnums;

  captureCodeRequired = true;

  remarkingSightingTypes: string[] = ['PRE_CHANGE', 'POST_CHANGE', 'REMARKING'];

  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private projectService: ProjectService, private referenceDataService: ReferenceDataService) {}

  ngOnInit() {
    // all events need to be associated with an active project
    this.projectService
      .getProjectsForLoggedInIdentity()
      .pipe(takeUntil(this.destroy$))
      .subscribe(projects => (this.projects = projects));
    this.referenceDataService.dataUploadSubject.pipe(takeUntil(this.destroy$)).subscribe(uploadEnums => {
      this.uploadEnums = uploadEnums;
      this.updateOnSightingTypeChange();
    });
    this.referenceDataService.viewDataSubject.pipe(takeUntil(this.destroy$)).subscribe(v => (this.viewDataEnums = v));
    this.f.dateAccuracy.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(newValue => {
      if (newValue !== 'D') {
        this.f.timeOfEvent.setValue(undefined);
      }
    });
    this.sightingType.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateOnSightingTypeChange();
    });
    // condition is initially disabled, it is only enabled when status code is `ALIVE
    this.bandingEventForm.controls.condition.disable();
    this.bandingEventForm.controls.statusCode.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(newStatus => {
      if (newStatus === 'ALIVE') {
        this.bandingEventForm.controls.condition.enable();
      } else {
        this.bandingEventForm.controls.condition.disable();
        this.bandingEventForm.controls.condition.setValue(null);
      }
    });
    this.bandingEventForm
      .get('eventCode')
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(newEvent => {
        if (this.sightingType.value === 'RESIGHTING') {
          this.updateOnEventChange(newEvent);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  get f() {
    return this.bandingEventForm.controls;
  }

  get wildOrCaptive(): FormControl {
    return this.bandingEventForm.get('wildOrCaptive') as FormControl;
  }

  get captureCode(): FormControl {
    return this.bandingEventForm.get('captureCode') as FormControl;
  }

  updateOnSightingTypeChange() {
    const isFirstMarking = this.sightingType.value === 'FIRST_MARKING';
    const isRemarking = this.remarkingSightingTypes.includes(this.sightingType.value);
    const isResighting = this.sightingType.value === 'RESIGHTING';
    this.isFirstMarking = isFirstMarking;

    if (isFirstMarking) {
      this.eventTypeDisplay = this.uploadEnums.firstMarkingEvents;
      this.bandingEventForm.controls.eventCode.setValue('FIRST_MARKING_IN_HAND');
      this.bandingEventForm.controls.eventCode.disable();
      this.bandingEventForm.controls.primaryMark.setValidators([Validators.required, Validators.maxLength(200)]);
      this.bandingEventForm.controls.primaryMark.updateValueAndValidity();
    } else if (isRemarking) {
      this.eventTypeDisplay = this.uploadEnums.eventTypeBird;
      this.bandingEventForm.controls.eventCode.disable();
      this.bandingEventForm.controls.eventCode.setValue('IN_HAND');
      this.removeFirstMarkingValidations();
    } else if (isResighting) {
      this.bandingEventForm.controls.eventCode.setValue(null);
      this.eventTypeDisplay = this.uploadEnums.reSightingEvents;
      this.bandingEventForm.controls.eventCode.enable();
      this.removeFirstMarkingValidations();
    }
  }

  updateOnEventChange(event: string) {
    if (event === 'IN_HAND') {
      this.toggleCaptureCode(true);
    } else if (event === 'RECORDED_BY_TECHNOLOGY' || event === 'SIGHTING_BY_PERSON') {
      this.toggleCaptureCode(false);
      this.wildOrCaptive.setValue('WILD');
    } else {
      this.toggleCaptureCode(true);
    }
  }

  removeFirstMarkingValidations() {
    this.bandingEventForm.controls.primaryMark.setValidators([Validators.maxLength(200)]);
    this.bandingEventForm.controls.primaryMark.updateValueAndValidity();
  }

  toggleCaptureCode(required: boolean) {
    if (required) {
      this.captureCode.setValidators([Validators.required]);
    } else {
      this.captureCode.clearValidators();
    }
    this.captureCodeRequired = required;
    this.captureCode.updateValueAndValidity();
  }
}
