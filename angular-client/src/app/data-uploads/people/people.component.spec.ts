import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeopleComponent } from './people.component';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { PeopleService } from '../../services/people.service';
import { of } from 'rxjs';
import { SharedModule } from '../../common/shared-common-module';
import { AuthenticationService } from '../../authentication/authentication.service';

@Component({
  selector: 'app-test-host',
  template: '<app-people [peopleForm]="peopleForm"  ></app-people>'
})
class TestHostComponent {
  peopleForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.peopleForm = this.fb.group({
      primary: [],
      reporter: [],
      otherName: [],
      otherContact: []
    });
  }
}

describe('PeopleComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PeopleComponent, TestHostComponent],
      imports: [ReactiveFormsModule, TypeaheadModule.forRoot(), SharedModule],
      providers: [
        {
          provide: PeopleService,
          useValue: {
            getPeople: () => of([])
          }
        },
        {
          provide: AuthenticationService,
          useValue: {
            identitySubject: of({
              userId: ''
            })
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
