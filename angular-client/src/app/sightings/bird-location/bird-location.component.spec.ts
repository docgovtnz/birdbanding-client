import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BirdLocationComponent } from './bird-location.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { Component } from '@angular/core';
import { ReferenceDataService } from '../../services/reference-data.service';
import { of } from 'rxjs';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';

@Component({
  selector: 'app-test-host',
  template: '<app-bird-location [locationForm]="birdLocationForm"></app-bird-location>'
})
class TestHostComponent {
  birdLocationForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.birdLocationForm = this.fb.group({
      dateSighted: [],
      timeSighted: [],
      sightingRegion: [],
      sightingLongitude: [],
      sightingLatitude: [],
      sightingDescription: [],
      sightingRegionDisplay: []
    });
  }
}

describe('BirdLocationComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, BsDatepickerModule.forRoot(), TimepickerModule.forRoot(), TypeaheadModule.forRoot()],
      declarations: [TestHostComponent, BirdLocationComponent],
      providers: [
        {
          provide: ReferenceDataService,
          useValue: {
            regionSubject: of([])
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
