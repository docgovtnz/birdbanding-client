import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUpdateProjectComponent } from './create--update-project.component';
import { RouterTestingModule } from '@angular/router/testing';
import { PreviousRouteService } from '../../services/previous-route.service';
import { ReactiveFormsModule } from '@angular/forms';
import { ProjectService } from '../services/project.service';
import { of } from 'rxjs';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { PeopleService } from '../../services/people.service';
import { LoggingService } from '../../services/logging.service';
import { ReferenceDataService } from '../../services/reference-data.service';

describe('CreateProjectComponent', () => {
  let component: CreateUpdateProjectComponent;
  let fixture: ComponentFixture<CreateUpdateProjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, ReactiveFormsModule, BsDatepickerModule.forRoot(), TypeaheadModule.forRoot()],
      declarations: [CreateUpdateProjectComponent],
      providers: [
        PreviousRouteService,
        {
          provide: ProjectService,
          useValue: {
            createProject: () => of({}),
            getProjects: () => of([])
          }
        },
        {
          provide: PeopleService,
          useValue: {
            getPeople: () => of([])
          }
        },
        {
          provide: LoggingService,
          useValue: {
            logError: () => {}
          }
        },
        {
          provide: ReferenceDataService,
          useValue: {
            viewProjectSubject: of({})
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateUpdateProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
