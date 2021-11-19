import { Component, Input, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ProjectService } from '../../projects/services/project.service';
import { Subject } from 'rxjs';
import { Project } from '../../projects/services/project-types';
import { takeUntil } from 'rxjs/operators';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { EventData } from '../services/event-types';
import { isEmpty, isNil } from 'ramda';
import { FullApiError } from '../../common/errors/error-utilities';

export interface UpdateEvent {
  eventData: EventData[];
  projectName: string;
}

@Component({
  selector: 'app-event-project-modal',
  templateUrl: './event-project-modal.component.html',
  styleUrls: ['./event-project-modal.component.scss'],
})
export class EventProjectModalComponent implements OnInit {
  destroy$: Subject<boolean> = new Subject<boolean>();

  @Input()
  eventIds: string[];

  projects: Project[] = [];

  selectedProject: FormControl;

  updatedEvents: Subject<UpdateEvent> = new Subject<UpdateEvent>();

  errors: FullApiError[] = [];

  loading = false;

  constructor(public modalRef: BsModalRef, private projectService: ProjectService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.selectedProject = this.fb.control(null, Validators.required);
    this.projectService
      .getProjects()
      .pipe(takeUntil(this.destroy$))
      .subscribe((projects) => (this.projects = projects));
  }

  linkToProject() {
    if (this.selectedProject.invalid) {
      this.selectedProject.markAllAsTouched();
    } else {
      this.loading = true;
      const { id, name } = this.selectedProject.value;
      this.projectService.linkEventsToProject(this.eventIds, id).subscribe(
        (updatedEvents) => {
          this.loading = false;
          this.updatedEvents.next({ eventData: updatedEvents, projectName: name });
          this.modalRef.hide();
        },
        (e) => {
          this.loading = false;
          if (!isNil(e.error) && !isNil(e.error.errors) && !isEmpty(e.error.errors)) {
            this.errors = e.error.errors;
          } else {
            this.errors = [
              {
                property: '',
                message: 'Unexpected error',
                code: 0,
                keyword: '',
                severity: '',
                type: '',
                value: '',
              },
            ];
          }
        }
      );
    }
  }
}
