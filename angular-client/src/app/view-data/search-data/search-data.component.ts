import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ReferenceDataService, Species, SpeciesGroup, ViewDataEnums } from 'src/app/services/reference-data.service';
import { FilterOptions } from '../services/event-types';
import { PeopleService } from '../../services/people.service';
import { SearchDataService } from '../services/search-data.service';
import { PeopleData } from '../../people/people-data';
import { ProjectService } from '../../projects/services/project.service';
import { Project } from '../../projects/services/project-types';
import { MapDataService } from '../services/map-data.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-search-data',
  templateUrl: './search-data.component.html',
  styleUrls: ['./search-data.component.scss'],
})
export class SearchDataComponent implements OnInit, OnDestroy {
  constructor(
    private referenceDataService: ReferenceDataService,
    private searchDataService: SearchDataService,
    private peopleService: PeopleService,
    private projectService: ProjectService,
    private mapDataService: MapDataService
  ) {}

  destroy$: Subject<boolean> = new Subject<boolean>();

  @Output()
  hideSearchOutput: EventEmitter<any> = new EventEmitter<any>();

  @Input()
  projects: Project[];
  @Input()
  species: Species[];
  @Input()
  speciesGroups: SpeciesGroup[];
  @Input()
  viewDataEnums: ViewDataEnums;
  @Input()
  people: PeopleData[];

  isLoading: boolean;

  filterOptions: FilterOptions;

  clearTypeahead$: Subject<boolean> = new Subject<boolean>();

  ngOnInit() {
    this.filterOptions = this.searchDataService.currentSearchOptions;
    this.searchDataService.isLoadingBehaviour.pipe(takeUntil(this.destroy$)).subscribe((loading) => (this.isLoading = loading));
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  clearSearch() {
    this.filterOptions = this.searchDataService.clear();
    this.mapDataService.clear();
    this.clearTypeahead$.next(true);
  }

  searchEvents() {
    this.searchDataService.searchEvents(this.filterOptions);
    this.mapDataService.searchMapEvents(this.filterOptions);
  }

  hideSearch() {
    this.hideSearchOutput.emit();
  }
}
