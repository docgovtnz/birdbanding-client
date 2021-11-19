import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SightingsComponent } from './sightings.component';

import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Component, Input, OnInit } from '@angular/core';
import { SightingReportService } from './services/sighting-report.service';
import { LoggingService } from '../services/logging.service';
import { of, throwError } from 'rxjs';

import { ErrorType } from '../common/errors/error-utilities';

@Component({
  selector: 'app-bird-details',
  template: '<div></div>'
})
class TestBirdDetailsComponent {
  @Input()
  birdDetailsForm: FormGroup;
}

@Component({
  selector: 'app-bird-location',
  template: '<div></div>'
})
class TestBirdLocationComponent {
  @Input()
  locationForm: FormGroup;
}

@Component({
  selector: 'app-success',
  template: '<div></div>'
})
class TestSuccessComponent {}

@Component({
  selector: 'app-marking-details',
  template: '<div></div>'
})
class TestMarkingDetailsComponent {
  @Input()
  markingFrom: FormGroup;
}

@Component({
  selector: 'app-your-details',
  template: '<div></div>'
})
class TestYourDetailsComponent {
  @Input()
  detailsForm: FormGroup;
}
describe('SightingsComponent', () => {
  let component: SightingsComponent;
  let fixture: ComponentFixture<SightingsComponent>;
  let logError: jasmine.Spy;
  let submitPublicSighting: jasmine.Spy;

  beforeEach(async(() => {
    logError = jasmine.createSpy();
    submitPublicSighting = jasmine.createSpy();
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [
        SightingsComponent,
        TestBirdDetailsComponent,
        TestBirdLocationComponent,
        TestMarkingDetailsComponent,
        TestYourDetailsComponent,
        TestSuccessComponent
      ],
      providers: [
        {
          provide: SightingReportService,
          useValue: {
            submitPublicSighting
          }
        },
        {
          provide: LoggingService,
          useValue: {
            logError
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SightingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('show error is true and error type is Server when submit sighting returns a 500 error code', () => {
    const error = {
      status: 500,
      message: 'internal server error'
    };
    submitPublicSighting.and.returnValue(throwError(error));
    component.submitForm();
    expect(component.submissionError.hasError).toBeTruthy();
    expect(component.submissionError.errorType).toEqual(ErrorType.SERVER);
    expect(logError.calls.first().args[0]).toEqual(JSON.stringify(error));
  });

  it('show error is true and error type is Client when submit sighting returns a 400 error code', () => {
    const error = {
      status: 400,
      message: 'bad request'
    };
    submitPublicSighting.and.returnValue(throwError(error));
    component.submitForm();
    expect(component.submissionError.hasError).toBeTruthy();
    expect(component.submissionError.errorType).toEqual(ErrorType.CLIENT);
    expect(logError.calls.first().args[0]).toEqual(JSON.stringify(error));
  });

  it('moves to the success page when submission succeeds', () => {
    submitPublicSighting.and.returnValue(of({}));
    component.submitForm();
    expect(component.submissionError.hasError).toBeFalsy();
    expect(component.activePage).toEqual(5);
  });
});
