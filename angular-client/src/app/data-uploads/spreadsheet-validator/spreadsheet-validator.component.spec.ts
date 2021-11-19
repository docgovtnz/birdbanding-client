import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpreadsheetValidatorComponent } from './spreadsheet-validator.component';
import { PeopleService } from '../../services/people.service';
import { of } from 'rxjs';
import { ProjectService } from '../../projects/services/project.service';
import { FileUploadModule } from 'ng2-file-upload';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../common/shared-common-module';
import { ModalModule } from 'ngx-bootstrap/modal';

describe('SpreadsheetValidatorComponent', () => {
  let component: SpreadsheetValidatorComponent;
  let fixture: ComponentFixture<SpreadsheetValidatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FileUploadModule, RouterTestingModule, ReactiveFormsModule, SharedModule, ModalModule.forRoot()],
      declarations: [SpreadsheetValidatorComponent],
      providers: [
        {
          provide: PeopleService,
          useValue: {
            getPeople: () => of([])
          }
        },
        {
          provide: ProjectService,
          useValue: {
            getProjects: () => of([])
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpreadsheetValidatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
