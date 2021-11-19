import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigurationService } from '../../services/configuration.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import {
  ApiCreateProject,
  ApiMember,
  ApiProject,
  CreateUpdateProject,
  Member,
  Project,
  ProjectDetails,
  ProjectMembershipUpdateType
} from './project-types';
import {
  apiMemberToMember,
  apiProjectDetailsToProjectDetails,
  apiProjectToProject,
  createProjectToApiCreateProject,
  projectDetailsToCreateUpdateProject
} from './project-transformer';
import { AuthenticationService, PersonIdentity } from '../../authentication/authentication.service';
import { ApiEventDataFlat, EventData, EventDetails } from '../../view-data/services/event-types';
import { apiEventDataFlatToEventData } from '../../view-data/services/utility/api-event-transformer';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  readonly baseUri: string;

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  loggedInIdentity: PersonIdentity;

  constructor(private http: HttpClient, config: ConfigurationService, authenticationService: AuthenticationService) {
    this.baseUri = config.getConfig().apiUrl;
    authenticationService.identitySubject.subscribe(identity => (this.loggedInIdentity = identity));
  }

  getProjects(): Observable<Project[]> {
    return this.http
      .get(`${this.baseUri}/projects`, this.httpOptions)
      .pipe(map((apiProject: ApiProject[]) => apiProject.map(apiProjectToProject)));
  }

  getProjectsForLoggedInIdentity(): Observable<Project[]> {
    return this.http
      .get(`${this.baseUri}/banders/${this.loggedInIdentity.userId}/projects`, this.httpOptions)
      .pipe(map((apiProject: ApiProject[]) => apiProject.map(apiProjectToProject)));
  }

  getProjectDetails(projectId: string): Observable<ProjectDetails> {
    return this.http.get(`${this.baseUri}/projects/${projectId}`, this.httpOptions).pipe(map(apiProjectDetailsToProjectDetails));
  }

  getProjectUpdateFormDetails(projectId: string): Observable<CreateUpdateProject> {
    return this.getProjectDetails(projectId).pipe(map(projectDetailsToCreateUpdateProject));
  }

  createProject(project: CreateUpdateProject): Observable<any> {
    const newProject: ApiCreateProject = createProjectToApiCreateProject(project);
    return this.http.post(`${this.baseUri}/projects`, newProject, this.httpOptions);
  }

  updateProject(project: CreateUpdateProject, projectId: string): Observable<any> {
    const projectToUpdate: ApiCreateProject = createProjectToApiCreateProject(project);

    return this.http.put(`${this.baseUri}/projects/${projectId}`, projectToUpdate, this.httpOptions);
  }

  updatedProjectMembership(projectId: string, personId: string, updateType: ProjectMembershipUpdateType): Observable<Member[]> {
    const patchBody = [
      {
        bander_id: personId,
        action: updateType
      }
    ];
    return this.http
      .patch(`${this.baseUri}/projects/${projectId}/banders`, patchBody, this.httpOptions)
      .pipe(map((projectMembers: ApiMember[]) => projectMembers.map(apiMemberToMember)));
  }

  linkEventsToProject(eventIds: string[], projectId): Observable<EventData[]> {
    const updateBody = {
      events: eventIds
    };
    return this.http
      .put(`${this.baseUri}/projects/${projectId}/events`, updateBody)
      .pipe(map((apiProject: ApiEventDataFlat[]) => apiProject.map(apiEventDataFlatToEventData)));
  }
}
