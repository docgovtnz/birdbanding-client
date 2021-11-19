import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkingDetailsComponent } from './marking-details.component';
import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-banding-description',
  template: '<div></div>'
})
class TestBandingDescriptionComponent {
  @Input()
  bandSide: string;

  @Input()
  legPart: string;

  @Input()
  bandInformationName: string;

  @Input()
  hasPrimaryMarkSet: BehaviorSubject<boolean>;


  @Input()
  parentFromGroup;
}

@Component({
  selector: 'app-test-host',
  template: '<app-marking-details [markingFrom]="markingForm" ></app-marking-details>'
})
class TestHostComponent {
  markingForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.markingForm = this.fb.group({
      markingType: [],
      additionalInformation: ['']
    });
  }
}

describe('MarkingDetailsComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [MarkingDetailsComponent, TestHostComponent, TestBandingDescriptionComponent]
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
