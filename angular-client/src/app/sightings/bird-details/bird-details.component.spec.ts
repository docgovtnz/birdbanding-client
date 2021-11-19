import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BirdDetailsComponent } from './bird-details.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { ReferenceDataService } from '../../services/reference-data.service';
import { of } from 'rxjs';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';

@Component({
  selector: 'app-test-host',
  template: '<app-bird-details [birdDetailsForm]="birdDetailsFrom"></app-bird-details>'
})
class TestHostComponent {
  birdDetailsFrom: FormGroup;

  constructor(private fb: FormBuilder) {
    this.birdDetailsFrom = this.fb.group({
      marked: [],
      condition: [],
      recognised: [],
      name: ['']
    });
  }
}

describe('BirdDetailsComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, TypeaheadModule.forRoot()],
      declarations: [TestHostComponent, BirdDetailsComponent],
      providers: [
        {
          provide: ReferenceDataService,
          useValue: {
            speciesSubject: of([])
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
