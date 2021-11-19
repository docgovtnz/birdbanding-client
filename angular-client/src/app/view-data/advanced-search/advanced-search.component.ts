import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { IdDisplay, Species, SpeciesGroup, ViewDataEnums } from '../../services/reference-data.service';
import { Project } from '../../projects/services/project-types';
import { PeopleData } from '../../people/people-data';
import { takeUntil } from 'rxjs/operators';
import { SearchDataService } from '../services/search-data.service';
import { Subject } from 'rxjs';
import { isEmpty, isNil } from 'ramda';
import { AdvancedFilterOption } from '../services/event-types';
import { MapDataService } from '../services/map-data.service';
import { FullApiError } from '../../common/errors/error-utilities';

@Component({
  selector: 'app-advanced-search',
  templateUrl: './advanced-search.component.html',
  styleUrls: ['./advanced-search.component.scss'],
})
export class AdvancedSearchComponent implements OnInit, OnDestroy {
  advancedSearchForm: FormGroup;

  criteria: IdDisplay[] = [
    {
      id: 'PROJECT',
      display: 'Project name',
    },
    {
      id: 'EVENT_CODE',
      display: 'Event code',
    },
    {
      id: 'SPECIES',
      display: 'Species',
    },
    {
      id: 'SPECIES_GROUP',
      display: 'Species group',
    },
    {
      id: 'PERSON',
      display: 'Person',
    },
    {
      id: 'BANDING_SCHEME',
      display: 'Banding scheme',
    },
    {
      id: 'LOCATION_DESCRIPTION',
      display: 'Location description',
    },
    {
      id: 'EVENT_DATE',
      display: 'Date of event',
    },
    {
      id: 'EVENT_DATE_RANGE',
      display: 'Date range of event',
    },
    {
      id: 'BAND_NUMBER',
      display: 'Band prefix and number',
    },
    {
      id: 'MARK',
      display: 'Mark',
    },
    {
      id: 'ALPHA_TEXT',
      display: 'Alphanumeric text',
    },
    {
      id: 'COMMENTS',
      display: 'Comments',
    },
    {
      id: 'COORDINATES',
      display: 'Location coordinates',
    },
    {
      id: 'FRIENDLY_NAME',
      display: 'Friendly name'
    }
  ];
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

  isLoading = false;

  hasError = false;

  searchErrors: FullApiError[] = [];

  constructor(private fb: FormBuilder, private searchDataService: SearchDataService, private mapDataService: MapDataService) {}

  get criteriaList(): FormArray {
    return this.advancedSearchForm.get('criteriaList') as FormArray;
  }

  ngOnInit(): void {
    const currentCriteria = this.searchDataService.currentAdvancedOptions;
    if (isEmpty(currentCriteria) || isNil(currentCriteria)) {
      this.advancedSearchForm = this.fb.group({
        criteriaList: this.fb.array(this.initialiseBlankForm()),
      });
    } else {
      this.advancedSearchForm = this.fb.group({
        criteriaList: this.fb.array([]),
      });
      this.addCurrentCriteria(currentCriteria);
    }
    this.searchDataService.isLoadingBehaviour.pipe(takeUntil(this.destroy$)).subscribe((loading) => (this.isLoading = loading));
    this.searchDataService.searchErrors.pipe(takeUntil(this.destroy$)).subscribe((errors) => (this.searchErrors = errors));
  }

  ngOnDestroy(): void {
    this.searchDataService.currentAdvancedOptions = this.criteriaList.value;
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  initialiseBlankForm(): FormGroup[] {
    const formArray = [];
    for (let i = 0; i < 3; i++) {
      formArray.push(this.createEmptyCriteriaGroup());
    }
    return formArray;
  }

  addCurrentCriteria(criteria: AdvancedFilterOption[]) {
    criteria.forEach((c) => {
      const newFormGroup = this.fb.group({
        type: [c.type],
        value: [c.value],
      });

      this.deleteValueOnTypeChange(newFormGroup);

      this.criteriaList.push(newFormGroup);
    });
  }

  deleteValueOnTypeChange(group: FormGroup) {
    group
      .get('type')
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((_) => {
        group.get('value').setValue(null);
      });
  }

  createEmptyCriteriaGroup(): FormGroup {
    const emptyFormGroup = this.fb.group({
      type: [''],
      value: [],
    });
    this.deleteValueOnTypeChange(emptyFormGroup);
    return emptyFormGroup;
  }

  addEmptyCriteriaGroup() {
    this.criteriaList.push(this.createEmptyCriteriaGroup());
  }

  removeCriteria(i: number) {
    this.criteriaList.removeAt(i);
    this.advancedSearchForm.updateValueAndValidity();
  }

  hideSearch() {
    this.hideSearchOutput.emit();
  }

  clearSearch() {
    this.criteriaList.clear();
    this.initialiseBlankForm().forEach((group) => {
      this.criteriaList.push(group);
    });
    this.searchDataService.clear();
  }

  search() {
    this.hasError = false;
    if (this.advancedSearchForm.valid) {
      this.searchDataService.advancedSearch(this.criteriaList.value);
      this.mapDataService.searchMapAdvanced(this.criteriaList.value);
    } else {
      this.advancedSearchForm.markAllAsTouched();
      this.hasError = true;
    }
  }
}
