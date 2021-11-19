import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BirdDetailsComponent } from './bird-details.component';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { EMPTY_UPLOAD_ENUMS, ReferenceDataService, UploadEnums } from '../../services/reference-data.service';
import { of } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { SharedModule } from '../../common/shared-common-module';
import { AuthenticationService } from '../../authentication/authentication.service';

@Component({
  selector: 'app-test-host',
  template: '<app-bird-details [birdForm]="birdForm" [uploadEnums]="uploadEnums" formType="ADD" [birdId]="birdId" ></app-bird-details>'
})
class TestHostComponent {
  birdForm: FormGroup;

  birdId: FormControl;

  uploadEnums: UploadEnums = EMPTY_UPLOAD_ENUMS;

  constructor(private fb: FormBuilder) {
    this.birdForm = this.fb.group({
      species: [],
      age: [],
      sex: []
    });
  }
}

describe('BirdDetailsComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BirdDetailsComponent, TestHostComponent],
      imports: [TypeaheadModule.forRoot(), ReactiveFormsModule, SharedModule],
      providers: [
        {
          provide: ReferenceDataService,
          useValue: {
            speciesSubject: of([])
          }
        },
        {
          provide: AuthenticationService,
          useValue: {
            identitySubject: of({})
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
