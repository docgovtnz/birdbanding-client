import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditRecordComponent } from './add-edit-record.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Component, Input } from '@angular/core';
import { ReferenceDataService } from '../../services/reference-data.service';
import { BehaviorSubject, of } from 'rxjs';
import { SharedModule } from '../../common/shared-common-module';
import { DataUploadService } from '../services/data-upload.service';
import { RouterTestingModule } from '@angular/router/testing';
import { LoggingService } from '../../services/logging.service';

@Component({
  selector: 'app-banding-event',
  template: '<div></div>'
})
class TestEventComponent {
  @Input()
  bandingEventForm: FormGroup;

  @Input()
  sightingType: FormControl;

  @Input()
  uploadEnums;
}

@Component({
  selector: 'app-bird-details',
  template: '<div></div>'
})
class TestBirdDetailsComponent {
  @Input()
  birdForm: FormGroup;

  @Input()
  uploadEnums;
}

@Component({
  selector: 'app-people',
  template: '<div></div>'
})
class TestPeopleFormComponent {
  @Input()
  peopleForm: FormGroup;
}

@Component({
  selector: 'app-location',
  template: '<div></div>'
})
class TestLocationComponent {
  @Input()
  locationForm: FormGroup;
  @Input()
  uploadEnums;
}

@Component({
  selector: 'app-marking-configurations',
  template: '<div></div>'
})
class TestMarkingComponent {
  @Input()
  markingForm: FormGroup;

  @Input()
  markingType: string;

  @Input()
  hasPrimaryMarkSet: BehaviorSubject<boolean>;

}

describe('AddRecordComponent', () => {
  let component: AddEditRecordComponent;
  let fixture: ComponentFixture<AddEditRecordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AddEditRecordComponent,
        TestEventComponent,
        TestMarkingComponent,
        TestBirdDetailsComponent,
        TestPeopleFormComponent,
        TestLocationComponent,
        TestLocationComponent
      ],
      imports: [ReactiveFormsModule, SharedModule, RouterTestingModule],
      providers: [
        {
          provide: ReferenceDataService,
          useValue: {
            dataUploadSubject: of({})
          }
        },
        {
          provide: DataUploadService,
          useValue: {}
        },
        {
          provide: LoggingService,
          useValue: {
            logError: () => {}
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
