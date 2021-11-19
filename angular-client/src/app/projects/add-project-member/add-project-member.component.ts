import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { PeopleService } from '../../services/people.service';
import { PeopleData } from '../../people/people-data';
import { FormBuilder, FormControl } from '@angular/forms';
import { ProjectService } from '../services/project.service';
import { Subject } from 'rxjs';
import { LoggingService } from '../../services/logging.service';
import { CLIENT_ERROR, isBadRequest, isServerError, NO_ERROR, SERVER_ERROR, SubmissionError } from '../../common/errors/error-utilities';
import { Member, ProjectMembershipUpdateType } from '../services/project-types';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-add-project-member',
  templateUrl: './add-project-member.component.html',
  styleUrls: ['./add-project-member.component.scss'],
})
export class AddProjectMemberComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    public modalRef: BsModalRef,
    private peopleService: PeopleService,
    private fb: FormBuilder,
    private projectService: ProjectService,
    private loggingService: LoggingService
  ) {}

  @Input()
  projectId: string;

  @Input()
  memberIds: string[] = [];

  people: PeopleData[];

  personNameControl: FormControl;

  selectedPersonId: string;

  isPersonSelected = false;

  newMembers = new Subject<Member[]>();

  loading = false;

  submissionError: SubmissionError = NO_ERROR;

  errorMessages: string[] = [];

  ngOnInit() {
    this.peopleService
      .getPeople()
      .pipe(takeUntil(this.destroy$))
      .subscribe((people) => {
        // filter out all people who are already members of the project
        this.people = people.filter((p) => !this.memberIds.includes(p.id));
      });

    this.personNameControl = this.fb.control('');
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  clearSelection() {
    this.selectedPersonId = null;
    this.isPersonSelected = false;
    this.personNameControl.setValue('');
  }

  selectPerson(person) {
    this.selectedPersonId = person.item.id;
    this.isPersonSelected = true;
  }

  addPerson() {
    this.submissionError = NO_ERROR;
    this.errorMessages = [];
    this.loading = true;
    this.projectService.updatedProjectMembership(this.projectId, this.selectedPersonId, ProjectMembershipUpdateType.ADD).subscribe(
      (newMembers) => {
        this.loading = false;
        this.newMembers.next(newMembers);
        this.modalRef.hide();
      },
      (err) => {
        this.loggingService.logError(JSON.stringify(err));
        this.loading = false;
        // status of zero comes back when cors blocks request
        if (isServerError(err.status)) {
          this.submissionError = SERVER_ERROR;
          this.errorMessages.push('Unable to add member, try again later');
        } else {
          if (isBadRequest(err.status)) {
            this.submissionError = CLIENT_ERROR;
            this.errorMessages = err.error.details.map((e) => e.details.message);
          }
        }
      }
    );
  }
}
