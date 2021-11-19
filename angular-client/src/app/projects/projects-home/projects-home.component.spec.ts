import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsHomeComponent } from './projects-home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProjectService } from '../services/project.service';
import { of } from 'rxjs';
import { RouterModule } from '@angular/router';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { AuthenticationService } from '../../authentication/authentication.service';
import { SearchDataService } from '../../view-data/services/search-data.service';

describe('ProjectsHomeComponent', () => {
  let component: ProjectsHomeComponent;
  let fixture: ComponentFixture<ProjectsHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterModule.forRoot([]),
        TypeaheadModule.forRoot(),
        FormsModule,
        PaginationModule.forRoot(),
        TooltipModule.forRoot()
      ],
      declarations: [ProjectsHomeComponent],
      providers: [
        {
          provide: ProjectService,
          useValue: {
            getProjects: () => of([])
          }
        },
        {
          provide: AuthenticationService,
          useValue: {
            identitySubject: of({})
          }
        },
        {
          provide: SearchDataService,
          useValue: {
            searchEvents: () => {}
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectsHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
