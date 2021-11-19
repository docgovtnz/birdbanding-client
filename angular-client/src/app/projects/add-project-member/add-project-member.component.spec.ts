import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddProjectMemberComponent } from './add-project-member.component';
import { BsModalRef, ModalModule } from 'ngx-bootstrap/modal';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { PeopleService } from '../../services/people.service';
import { of } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProjectService } from '../services/project.service';
import { LoggingService } from '../../services/logging.service';
import { BandingCertificateComponent } from '../banding-certificate/banding-certificate.component';

describe('AddProjectMemberComponent', () => {
  let component: AddProjectMemberComponent;
  let fixture: ComponentFixture<AddProjectMemberComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), TypeaheadModule.forRoot(), ReactiveFormsModule, FormsModule, PopoverModule.forRoot()],
      declarations: [AddProjectMemberComponent, BandingCertificateComponent],
      providers: [
        {
          provide: PeopleService,
          useValue: {
            getPeople: () => of([])
          }
        },
        { provide: BsModalRef, useValue: {} },
        {
          provide: ProjectService,
          useValue: {
            addMember: of([])
          }
        },
        {
          provide: LoggingService,
          useValue: {
            logError: () => {}
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddProjectMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
