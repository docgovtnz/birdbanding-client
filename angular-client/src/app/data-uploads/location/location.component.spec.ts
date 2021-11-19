import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationComponent } from './location.component';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EMPTY_UPLOAD_ENUMS, ReferenceDataService, UploadEnums } from '../../services/reference-data.service';
import { of } from 'rxjs';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { SharedModule } from '../../common/shared-common-module';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-test-host',
  template: '<app-location [locationForm]="locationForm"  [uploadEnums]="uploadEnums" ></app-location>'
})
class TestHostComponent {
  locationForm: FormGroup;

  uploadEnums: UploadEnums = EMPTY_UPLOAD_ENUMS;

  constructor(private fb: FormBuilder) {
    this.locationForm = this.fb.group({
      region: [],
      locationGeneral: [],
      locationDescription: [],
      latitude: [],
      longitude: [],
      coordinateSystem: [],
      accuracy: []
    });
  }
}

describe('LocationComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LocationComponent, TestHostComponent],
      imports: [ReactiveFormsModule, TypeaheadModule.forRoot(), SharedModule],
      providers: [
        {
          provide: ReferenceDataService,
          useValue: {
            regionSubject: of([])
          }
        },
        {
          provide: BsModalService,
          useValue: {}
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
