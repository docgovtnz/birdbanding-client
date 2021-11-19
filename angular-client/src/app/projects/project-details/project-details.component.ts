import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProjectService } from '../services/project.service';
import { ActivatedRoute, Router } from '@angular/router';
import { statusEnumToFormattedString } from '../utils/helpers';
import { PreviousRouteService } from '../../services/previous-route.service';
import { SearchDataService, buildEmptyFilterOptions } from '../../view-data/services/search-data.service';
import { AddProjectMemberComponent } from '../add-project-member/add-project-member.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { LoggingService } from '../../services/logging.service';
import { ProjectDetails, ProjectMembershipUpdateType, ProjectStatus } from '../services/project-types';
import { AuthenticationService, PersonIdentity } from '../../authentication/authentication.service';
import { isEmpty } from 'ramda';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';



@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.scss'],
})
export class ProjectDetailsComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();

  projectDetails: ProjectDetails = {
    projectMembers: [],
    state: '',
    permitId: '',
    isDocProject: null,
    permitExpiry: null,
    organisation: '',
    numberOfMembers: null,
    moratorium: false,
    status: ProjectStatus.ALL,
    numberOfRecords: null,
    dateCreated: null,
    projectManager: {
      name: '',
      id: '',
    },
    id: '',
    name: '',
    location: '',
    description: '',
    moratoriumExpiry: null,
  };

  private projectId: string;

  person: PersonIdentity;

  isProjectManager = false;

  isProjectMember = false;

  addProjectMemberModalRef: BsModalRef;

  alerts: any[] = [];
  dismissible = true;

  constructor(
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private router: Router,
    private previousRouteService: PreviousRouteService,
    private modalService: BsModalService,
    private loggingService: LoggingService,
    private authenticationService: AuthenticationService,
    private searchDataService: SearchDataService
  ) {}

  ngOnInit() {
    this.authenticationService.identitySubject.pipe(takeUntil(this.destroy$)).subscribe((person) => (this.person = person));
    this.route.paramMap.subscribe((params) => {
      this.projectId = params.get('projectId');

      this.projectService
        .getProjectDetails(this.projectId)
        .pipe(takeUntil(this.destroy$))
        .subscribe((details) => {
          this.projectDetails = details;
          if (!isEmpty(this.person)) {
            this.isProjectManager = this.person.userId === details.projectManager.id;
            this.isProjectMember = this.getMemberIds().includes(this.person.userId);
          }
        });
    });
    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const status = params.get('status');
      switch (status) {
        case 'created':
          this.alerts.push({
            type: 'success',
            msg: 'Project added',
            timeout: 3000,
          });
          break;
        case 'updated':
          this.alerts.push({
            type: 'success',
            msg: 'Project updated',
            timeout: 3000,
          });
          break;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  /**
   * Closes an alert
   */
  onClosed(dismissedAlert: any): void {
    this.alerts = this.alerts.filter((alert) => alert !== dismissedAlert);
  }

  // translate from a status enum value to formatted name string
  toStatusName(projectStatus: ProjectStatus): string {
    return statusEnumToFormattedString(projectStatus);
  }

  // take the person back to where they came from
  goBack() {
    const previousRoute = this.previousRouteService.getPreviousRoute('/projects');
    this.router.navigate([previousRoute]);
  }

  removePerson(personId) {
    this.projectService.updatedProjectMembership(this.projectId, personId, ProjectMembershipUpdateType.REMOVE).subscribe((newMembers) => {
      this.projectDetails.projectMembers = newMembers;
      this.alerts.push({
        type: 'success',
        msg: 'Project member removed',
        timeout: 3000,
      });
    });
  }

  // returns a list of all the ids of all members of the project and project manager
  getMemberIds() {
    const memberIds: string[] = this.projectDetails.projectMembers.map((m) => m.id);
    memberIds.push(this.projectDetails.projectManager.id);
    return memberIds;
  }

  addProjectMember(): void {
    const config = {
      backdrop: true,
      ignoreBackdropClick: true,
      class: 'add-member-modal',
      initialState: {
        projectId: this.projectId,
        memberIds: this.getMemberIds(),
      },
    };
    this.addProjectMemberModalRef = this.modalService.show(AddProjectMemberComponent, config);
    this.addProjectMemberModalRef.content.newMembers.subscribe(
      (newMembers) => {
        this.projectDetails.projectMembers = newMembers;
        this.alerts.push({
          type: 'success',
          msg: 'Project member added',
          timeout: 3000,
        });
      },
      (error) => this.loggingService.logError(JSON.stringify(error))
    );
  }

  goToProject(project) {
    const emptyFilterOptions = buildEmptyFilterOptions();
    emptyFilterOptions.projects.push(project);
    this.searchDataService.searchEvents(emptyFilterOptions);
    this.router.navigate(['/view-data']);
  }

}
