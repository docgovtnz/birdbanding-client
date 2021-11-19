import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedSearchComponent } from './advanced-search.component';
import { ReactiveFormsModule } from '@angular/forms';
import { EMPTY_VIEW_DATA_ENUMS, ReferenceDataService, Species, SpeciesGroup } from '../../services/reference-data.service';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { buildEmptyFilterOptions, SearchDataService } from '../services/search-data.service';
import { PeopleService } from '../../services/people.service';
import { ProjectService } from '../../projects/services/project.service';
import { MapDataService } from '../services/map-data.service';
import { FullApiError } from '../../common/errors/error-utilities';

describe('AdvancedSearchComponent', () => {
  let component: AdvancedSearchComponent;
  let fixture: ComponentFixture<AdvancedSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [AdvancedSearchComponent],
      providers: [
        {
          provide: ReferenceDataService,
          useValue: {
            loadReferenceData: () => {},
            speciesSubject: new Subject<Species[]>(),
            speciesGroupSubject: new Subject<SpeciesGroup[]>(),
            viewDataSubject: of(EMPTY_VIEW_DATA_ENUMS),
          },
        },
        {
          provide: SearchDataService,
          useValue: {
            isLoadingBehaviour: new BehaviorSubject<boolean>(false),
            searchEvents: jasmine.createSpy('searchEvents').and.returnValue(''),
            currentSearchOptions: buildEmptyFilterOptions(),
            searchErrors: new BehaviorSubject<FullApiError[]>([]),
          },
        },
        {
          provide: PeopleService,
          useValue: {
            getPeople: () => of([]),
          },
        },
        {
          provide: ProjectService,
          useValue: {
            getProjects: () => of([]),
          },
        },
        {
          provide: MapDataService,
          useValue: {
            clear: () => {},
            searchMapAdvanced: () => {},
          },
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvancedSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
