import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { YourDetailsComponent } from './your-details.component';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-test-host',
  template: '<app-your-details [detailsForm]="detailsForm"></app-your-details>'
})
class TestHostComponent {
  detailsForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.detailsForm = this.fb.group({
      detailName: [],
      detailEmail: [],
      detailContact: [false]
    });
  }
}

describe('YourDetailsComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [TestHostComponent, YourDetailsComponent]
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
