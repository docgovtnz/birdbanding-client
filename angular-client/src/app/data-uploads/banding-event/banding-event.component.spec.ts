import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BandingEventComponent } from './banding-event.component';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { ProjectService } from '../../projects/services/project.service';
import { of } from 'rxjs';
import { EMPTY_VIEW_DATA_ENUMS, ReferenceDataService } from '../../services/reference-data.service';
import { SharedModule } from '../../common/shared-common-module';

@Component({
  selector: 'app-test-host',
  template: '<app-banding-event [bandingEventForm]="bandingEventForm" ' + '[sightingType]="sightingType" ></app-banding-event>'
})
class TestHostComponent {
  bandingEventForm: FormGroup;

  sightingType: FormControl;

  constructor(private fb: FormBuilder) {
    this.bandingEventForm = this.fb.group({
      primaryMark: [],
      bandingScheme: [],
      dateOfEvent: [],
      timeOfEvent: [],
      dateAccuracy: [],
      registeredProject: [],
      eventCode: [],
      captureCode: [],
      wildOrCaptive: [],
      statusCode: [],
      condition: []
    });
    this.sightingType = this.fb.control([]);
  }
}

describe('BandingEventComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BandingEventComponent, TestHostComponent],
      imports: [ReactiveFormsModule, BsDatepickerModule.forRoot(), TypeaheadModule.forRoot(), SharedModule, TooltipModule.forRoot()],
      providers: [
        {
          provide: ProjectService,
          useValue: { getProjectsForLoggedInIdentity: () => of([]) }
        },
        {
          provide: ReferenceDataService,
          useValue: {
            dataUploadSubject: of({
              eventTypeBirdDisplay: []
            }),
            viewDataSubject: of(EMPTY_VIEW_DATA_ENUMS)
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
