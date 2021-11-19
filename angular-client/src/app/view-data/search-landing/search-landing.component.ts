import { Component, OnDestroy, OnInit } from '@angular/core';
import { Project } from '../../projects/services/project-types';
import { ReferenceDataService, Species, SpeciesGroup, ViewDataEnums } from '../../services/reference-data.service';
import { ProjectService } from '../../projects/services/project.service';
import { SearchDataService } from '../services/search-data.service';
import { PeopleService } from '../../services/people.service';
import { Subject } from 'rxjs';
import { PeopleData } from '../../people/people-data';
import { takeUntil } from 'rxjs/operators';
import { MapDataService } from '../services/map-data.service';

@Component({
  selector: 'app-search-landing',
  templateUrl: './search-landing.component.html',
  styleUrls: ['./search-landing.component.scss']
})
export class SearchLandingComponent implements OnInit, OnDestroy {
  constructor(
    private projectService: ProjectService,
    private referenceDataService: ReferenceDataService,
    private searchDataService: SearchDataService,
    private peopleService: PeopleService,
    private mapDataService: MapDataService
  ) {}

  destroy$: Subject<boolean> = new Subject<boolean>();

  searchVisible = true;

  advanceSearch = false;

  projects: Project[];

  species: Species[];

  speciesGroups: SpeciesGroup[];

  viewDataEnums: ViewDataEnums;

  people: PeopleData[];

  ngOnInit(): void {
    this.advanceSearch = this.searchDataService.isAdvancedSearch;
    this.projectService
      .getProjects()
      .pipe(takeUntil(this.destroy$))
      .subscribe((projectList: Project[]) => (this.projects = projectList));
    this.referenceDataService.speciesSubject
      .pipe(takeUntil(this.destroy$))
      .subscribe((speciesList: Species[]) => (this.species = speciesList));
    this.referenceDataService.speciesGroupSubject
      .pipe(takeUntil(this.destroy$))
      .subscribe(speciesGroups => (this.speciesGroups = speciesGroups));
    this.referenceDataService.viewDataSubject.pipe(takeUntil(this.destroy$)).subscribe(dataEnums => (this.viewDataEnums = dataEnums));

    this.peopleService
      .getPeople()
      .pipe(takeUntil(this.destroy$))
      .subscribe(people => (this.people = people));
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  // used for hiding the search screen
  hideSearch() {
    this.searchVisible = false;
  }
  // used for showing the search screen
  showSearch() {
    this.searchVisible = true;
  }

  toggleAdvancedSearch(advanced: boolean) {
    this.advanceSearch = advanced;
    this.searchDataService.clearResults();
    this.mapDataService.clear();
  }
}
