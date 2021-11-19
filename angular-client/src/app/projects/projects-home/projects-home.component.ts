import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProjectService } from '../services/project.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { is } from 'ramda';
import { compareAsc } from 'date-fns';
import { statusEnumToFormattedString } from '../utils/helpers';
import { AuthenticationService, PersonIdentity } from '../../authentication/authentication.service';
import { SearchDataService, buildEmptyFilterOptions } from '../../view-data/services/search-data.service';
import { Project, ProjectStatus } from '../services/project-types';
import { Subject, concat, merge } from 'rxjs';
import { takeUntil, debounce, debounceTime, distinctUntilChanged } from 'rxjs/operators';


type ProjectColumn =
  'NONE' |
  'PROJECT_NAME' |
  'PROJECT_MANAGER' |
  'DATE_CREATED' |
  'NUMBER_RECORDS' |
  'NUMBER_MEMBERS' |
  'STATUS' |
  'MORATORIUM';


type IsDOCProject = 'DOC' | 'NON_DOC' | 'ALL';

// comparison function for sorting lists of numbers
const compareNumbers = (a: number, b: number): number => (a - b) / Math.abs(a - b);
const compareBoolean = (a, b): number => (0 + a) + - (0 + b);


@Component({
  selector: 'app-projects-home',
  templateUrl: './projects-home.component.html',
  styleUrls: ['./projects-home.component.scss'],
})
export class ProjectsHomeComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();

  // search controls
  projectFilter: FormControl;
  projectSearch: FormControl;
  projectSearchTerms: FormControl;
  isDOCProjectFilter: FormControl;

  // sorting controls
  sortedColumn: ProjectColumn = 'PROJECT_NAME';
  sortDirection: (-1 | 1) = 1;

  // pagination controls
  limitPerPage = 20;
  selectedPageNumber = 1;
  fromResult = 1;
  toResult: number;
  desiredPageNumber: string;

  currentPage: Project[];
  // project lists
  selectedProjects: Project[] = [];
  allProjects: Project[] = [];
  activeProjects: Project[] = [];
  pendingProjects: Project[] = [];
  inactiveProjects: Project[] = [];

  activeProjectCount = 0;
  pendingProjectCount = 0;
  inactiveProjectCount = 0;

  // identity
  person: PersonIdentity;

  constructor(
    private projectService: ProjectService,
    private fb: FormBuilder,
    private router: Router,
    private authenticationService: AuthenticationService,
    private searchDataService: SearchDataService
  ) {}

  ngOnInit() {
    this.projectFilter = this.fb.control('ALL');
    this.projectSearch = this.fb.control('');
    this.isDOCProjectFilter = this.fb.control('ALL');
    this.projectSearchTerms = this.fb.control('');

    merge(
      this.isDOCProjectFilter.valueChanges,
      this.projectFilter.valueChanges,
      this.projectSearchTerms.valueChanges.pipe(debounceTime(500))
    ).subscribe(_ => {
      this.selectedPageNumber = 1;
      this.selectedProjects = this.sortListBySelectedColumn(this.searchProjects(
        this.allProjects, this.projectSearchTerms.value, this.isDOCProjectFilter.value, this.projectFilter.value as ProjectStatus
      ));
      // this.selectedProjects.map(p => p.status).forEach(this.countStatus, this);
      this.calculateCurrentPage(this.selectedPageNumber, this.limitPerPage);
    });

    this.projectService
      .getProjects()
      .pipe(takeUntil(this.destroy$))
      .subscribe((projects) => {
        this.selectedProjects = projects;
        this.allProjects = projects.slice();
        projects.map(p => p.status).forEach(this.countStatus, this);
        this.calculateCurrentPage(this.selectedPageNumber, this.limitPerPage);
      });
    this.authenticationService.identitySubject.pipe(takeUntil(this.destroy$)).subscribe((person) => (this.person = person));
  }

  normalize(s: string): string {
    return s.toLocaleUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  searchProjects(projects: Project[], searchTerms: string[], isDOCProject: IsDOCProject, status: ProjectStatus) {
    const docProj = isDOCProject === 'DOC';
    const selectedProjects = [];
    this.activeProjectCount = this.pendingProjectCount = this.inactiveProjectCount = 0;
    projLoop:
    for (const project of projects) {
      if (isDOCProject !== 'ALL' && project.isDocProject !== docProj) {
          continue;
      }
      for (const searchTerm of searchTerms) {
        const term = this.normalize(searchTerm);
        if (!((project.location && this.normalize(project.location).includes(term))
          || (project.organisation && this.normalize(project.organisation).includes(term))
          || (project.description && this.normalize(project.description).includes(term)))) {
          continue projLoop;
        }
      }


      // Because enumerations are a bit whacky in typescript
      if (status.toString() !== ProjectStatus[ProjectStatus.ALL] && status.toString() !== ProjectStatus[project.status]) {
        continue;
      }

      this.countStatus(project.status);
      selectedProjects.push(project);
    }
    return selectedProjects;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  // used to sort a list of projects by the currently selected sort
  sortListBySelectedColumn(projectList: Project[]): Project[] {
    switch (this.sortedColumn) {
      case 'NONE':
        return projectList;
      case 'PROJECT_NAME':
        return projectList.sort((a, b) => this.sortDirection * a.name.localeCompare(b.name));
      case 'PROJECT_MANAGER':
        return projectList.sort((a, b) => this.sortDirection * a.projectManager.name.localeCompare(b.projectManager.name));
      case 'DATE_CREATED':
        return projectList.sort((a, b) => this.sortDirection * compareAsc(a.dateCreated, b.dateCreated));
      case 'NUMBER_RECORDS':
        return projectList.sort((a, b) => this.sortDirection * compareNumbers(a.numberOfRecords, b.numberOfRecords));
      case 'NUMBER_MEMBERS':
        return projectList.sort((a, b) => this.sortDirection * compareNumbers(a.numberOfMembers, b.numberOfMembers));
      case 'STATUS':
        return projectList.sort((a, b) => this.sortDirection * (a.status - b.status));
      case 'MORATORIUM':
        return projectList.sort((a, b) => this.sortDirection * compareBoolean(a.moratorium, b.moratorium));
      default:
        return projectList;
    }
  }

  // change the currently selected filter and recalculate pages
  setSelectedSort(projectColumnValue: ProjectColumn) {
    if (this.sortedColumn === projectColumnValue) {
      this.sortDirection *= -1;
    }
    else {
      this.sortedColumn = projectColumnValue;
      this.sortDirection = 1;
    }
    this.selectedProjects = this.sortListBySelectedColumn(this.selectedProjects);
    this.calculateCurrentPage(this.selectedPageNumber, this.limitPerPage);
  }

  // translate from a status enum value to formatted name string
  toStatusName(projectStatus: ProjectStatus): string {
    return statusEnumToFormattedString(projectStatus);
  }

  calculateCurrentPage(page, itemsPerPage) {
    const firstElementIndex = (page - 1) * itemsPerPage;
    const lastElementIndex = page * itemsPerPage;
    const lastIndexOfList = this.selectedProjects.length;
    if (lastElementIndex < lastIndexOfList) {
      this.currentPage = this.selectedProjects.slice(firstElementIndex, lastElementIndex);
      this.fromResult = firstElementIndex + 1;
      this.toResult = lastElementIndex;
    } else {
      this.currentPage = this.selectedProjects.slice(firstElementIndex, lastIndexOfList);
      this.fromResult = firstElementIndex + 1;
      this.toResult = lastIndexOfList;
    }
  }

  pageChanged({ page, itemsPerPage }) {
    this.calculateCurrentPage(page, itemsPerPage);
  }

  limitChanged() {
    this.calculateCurrentPage(this.selectedPageNumber, this.limitPerPage);
  }

  jumpToPage() {
    const nextPage = Number(this.desiredPageNumber);
    if (is(Number, nextPage)) {
      this.selectedPageNumber = nextPage;
    }
  }

  navigateToProject(project) {
    this.projectSearch.patchValue('');
    this.router.navigate(['./projects/details', project.id]);
  }

  goToProject(project) {
    const emptyFilterOptions = buildEmptyFilterOptions();
    emptyFilterOptions.projects.push(project);
    this.searchDataService.searchEvents(emptyFilterOptions);
    this.router.navigate(['/view-data']);
  }

  countStatus(status: ProjectStatus) {
    switch (status) {
      case ProjectStatus.ACTIVE:
        this.activeProjectCount++;
        break;
      case ProjectStatus.AWAITING_APPROVAL:
        this.pendingProjectCount++;
        break;
      case ProjectStatus.INACTIVE:
        this.inactiveProjectCount++;
        break;
    }
  }

  searchTermChange(searchTerms: Array<string>) {
    console.dir(searchTerms);
    this.projectSearchTerms.setValue(searchTerms);
  }

}
