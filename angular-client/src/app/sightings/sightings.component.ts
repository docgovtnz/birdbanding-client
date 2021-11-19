import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { BirdDetails, LocationDetails, MarkingDetails, ReporterDetails, SightingReportService } from './services/sighting-report.service';
import { LoggingService } from '../services/logging.service';

import { ErrorType, SubmissionError } from '../common/errors/error-utilities';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-sightings',
  templateUrl: './sightings.component.html',
  styleUrls: ['./sightings.component.scss'],
})
export class SightingsComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();

  activePage = 1;

  constructor(private fb: FormBuilder, private sightingReportService: SightingReportService, private loggingService: LoggingService) {}

  birdDetailsForm: FormGroup;

  locationForm: FormGroup;

  detailsForm: FormGroup;

  markingForm: FormGroup;

  isSubmitting = false;

  submissionError: SubmissionError = {
    hasError: false,
    errorType: ErrorType.NONE,
  };

  errorMessages: any[] = [];

  ngOnInit() {
    this.birdDetailsForm = this.fb.group({
      marked: [undefined, Validators.required],
      condition: [undefined, Validators.required],
      recognised: [undefined, Validators.required],
      name: [''],
      speciesId: [null],
    });

    this.locationForm = this.fb.group({
      dateSighted: [undefined, Validators.required],
      timeSighted: [
        '',
        {
          validators: Validators.compose([Validators.required, Validators.pattern('^$|^(([01][0-9])|(2[0-3])):[0-5][0-9]$')]),
          updateOn: 'blur',
        },
      ],
      sightingRegion: [undefined, Validators.required],
      sightingLongitude: [undefined, Validators.compose([Validators.max(180), Validators.min(-180), Validators.pattern('-?\\d+\\.?\\d*')])],
      sightingLatitude: [undefined, Validators.compose([Validators.max(90), Validators.min(-90), Validators.pattern('-?\\d+\\.?\\d*')])],
      sightingDescription: ['', Validators.compose([Validators.maxLength(2500), Validators.required])],
    });
    this.detailsForm = this.fb.group({
      detailName: [undefined, Validators.compose([Validators.required, Validators.maxLength(200)])],
      detailEmail: [
        '',
        {
          validators: Validators.compose([
            Validators.required,
            Validators.maxLength(320),
            Validators.pattern(
              '^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\' +
                '.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$'
            ),
          ]),
          updateOn: 'blur',
        },
      ],
      detailContact: [false ] as Array<NonNullable<boolean>>,
    });
    this.markingForm = this.createMarkingForm();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  setActivePage(pageNumber) {
    if (pageNumber > 0 && pageNumber <= 5) {
      this.activePage = pageNumber;
      window.scrollTo(0, 0);
    }
  }

  submitForm() {
    this.isSubmitting = true;
    this.submissionError.hasError = false;
    this.submissionError.errorType = ErrorType.NONE;
    this.errorMessages = [];
    const birdDetails = this.birdDetailsForm.value as BirdDetails;
    const locationDetails = this.locationForm.value as LocationDetails;
    const markingDetails = this.markingForm.value as MarkingDetails;
    const reporterDetails = this.detailsForm.value as ReporterDetails;
    this.sightingReportService
      .submitPublicSighting(birdDetails, locationDetails, markingDetails, reporterDetails)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => {
          this.isSubmitting = false;
          this.setActivePage(5);
        },
        (error) => {
          this.isSubmitting = false;
          this.submissionError.hasError = true;
          this.loggingService.logError(JSON.stringify(error));
          if (error.status >= 500) {
            this.submissionError.errorType = ErrorType.SERVER;
          } else {
            if (error.error && error.error.details) {
              this.errorMessages = error.error.details.map((detail) => {
                const field = detail.data.path ? detail.data.path.split('/').pop() : 'unknown';
                return `property  \`${field}\`: ${detail.message}`;
              });
            }

            this.submissionError.errorType = ErrorType.CLIENT;
          }
        }
      );
  }

  createMarkingForm() {
    return this.fb.group({
      additionalInformation: ['', Validators.maxLength(2500)],
      upperLeftBands: this.fb.array([]),
      lowerLeftBands: this.fb.array([]),
      upperRightBands: this.fb.array([]),
      lowerRightBands: this.fb.array([]),
      unknownBands: this.fb.array([]),
    });
  }

  reset() {
    this.birdDetailsForm.reset();
    this.locationForm.reset();
    this.detailsForm.reset();
    this.markingForm.reset();
    this.markingForm = this.createMarkingForm();
    this.setActivePage(1);
  }
}
