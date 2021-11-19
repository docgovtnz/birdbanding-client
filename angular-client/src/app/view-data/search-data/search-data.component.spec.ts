import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';

import { SearchDataComponent } from './search-data.component';
import { EMPTY_VIEW_DATA_ENUMS, ReferenceDataService, Species, SpeciesGroup } from '../../services/reference-data.service';
import { FilterOptions } from '../services/event-types';
import { PeopleService } from '../../services/people.service';
import { SearchDataService, buildEmptyFilterOptions } from '../services/search-data.service';
import { TypeaheadMultiSelectComponent } from '../../common/typeahead-multi-select/typeahead-multi-select.component';
import { MultiSelectComponent } from '../../common/multi-select/multi-select.component';

import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { BehaviorSubject, Subject, of } from 'rxjs';
import { ProjectService } from '../../projects/services/project.service';
import { MapDataService } from '../services/map-data.service';

describe('SearchDataComponent', () => {
  let component: SearchDataComponent;
  let fixture: ComponentFixture<SearchDataComponent>;

  let searchDataService: SearchDataService;
  let referenceDataService: ReferenceDataService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, BsDatepickerModule.forRoot(), TypeaheadModule.forRoot(), TooltipModule.forRoot()],
      declarations: [SearchDataComponent, TypeaheadMultiSelectComponent, MultiSelectComponent],
      providers: [
        {
          provide: ReferenceDataService,
          useValue: {
            loadReferenceData: () => {},
            speciesSubject: new Subject<Species[]>(),
            speciesGroupSubject: new Subject<SpeciesGroup[]>(),
            viewDataSubject: of(EMPTY_VIEW_DATA_ENUMS)
          }
        },
        {
          provide: SearchDataService,
          useValue: {
            isLoadingBehaviour: new BehaviorSubject<boolean>(false),
            searchEvents: jasmine.createSpy('searchEvents').and.returnValue(''),
            currentSearchOptions: buildEmptyFilterOptions()
          }
        },
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
        },
        {
          provide: MapDataService,
          useValue: {
            currentSearchOptions: buildEmptyFilterOptions(),
            searchMapEvents: () => {}
          }
        }
      ]
    }).compileComponents();
    searchDataService = TestBed.inject(SearchDataService);
    referenceDataService = TestBed.inject(ReferenceDataService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be loading when loading behaviours is dispatched', () => {
    expect(component.isLoading).toBeFalsy();
    searchDataService.isLoadingBehaviour.next(true);
    expect(component.isLoading).toBeTruthy();
    searchDataService.isLoadingBehaviour.next(false);
    expect(component.isLoading).toBeFalsy();
  });

  it('should call the event service search with the current filter options ', () => {
    const searchFilter: FilterOptions = {
      bandingSchemes: [
        {
          id: ' test banding scheeme',
          display: 'testName'
        }
      ],
      bandCodes: [
        {
          id: 'testBbsCode',
          display: 'testName'
        }
      ],
      eventDates: [new Date(), new Date()],
      projects: [
        {
          name: 'testProject name',
          id: 'testId'
        }
      ],
      locationDescription: 'testRegion',
      showErrors: false,
      showMoratorium: true,
      species: [
        {
          id: 1,
          description: 'testDescription',
          common_name_nznbbs: '',
          is_exotic: false,
          is_gamebird: true,
          scientific_name_nznbbs: 'testName',
          species_code_nznbbs: '',
          valid_band_prefixes: []
        }
      ],
      uploadedBy: [
        {
          display: 'testName',
          id: 'testId',
          banderNumber: '',
          company: '',
          firstName: '',
          hidden: false,
          jointDate: new Date(),
          lastLogin: new Date(),
          lastName: '',
          maxBandingLevel: 'L1',
          personName: '',
          status: 'ALL',
          userName: 'user124'
        }
      ],
      speciesGroups: [
        {
          id: 1,
          name: 'birds'
        }
      ]
    };
    component.filterOptions = searchFilter;
    component.searchEvents();
    expect(searchDataService.searchEvents).toHaveBeenCalledWith(searchFilter);
  });
});
