import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchLandingComponent } from './search-landing.component';
import { EMPTY_VIEW_DATA_ENUMS, ReferenceDataService, Species, SpeciesGroup } from '../../services/reference-data.service';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { buildEmptyFilterOptions, SearchDataService } from '../services/search-data.service';
import { PeopleService } from '../../services/people.service';
import { ProjectService } from '../../projects/services/project.service';
import { MapDataService } from '../services/map-data.service';

describe('SearchLandingComponent', () => {
  let component: SearchLandingComponent;
  let fixture: ComponentFixture<SearchLandingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SearchLandingComponent],
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
            clear: () => {}
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
