import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkSearchComponent } from './mark-search.component';
import { ReactiveFormsModule } from '@angular/forms';
import {
  EMPTY_UPLOAD_ENUMS,
  EMPTY_VIEW_DATA_ENUMS,
  ReferenceDataService,
  Species,
  SpeciesGroup
} from '../../services/reference-data.service';
import { of, Subject } from 'rxjs';

describe('MarkSearchComponent', () => {
  let component: MarkSearchComponent;
  let fixture: ComponentFixture<MarkSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [MarkSearchComponent],
      providers: [
        {
          provide: ReferenceDataService,
          useValue: {
            loadReferenceData: () => {},
            speciesSubject: new Subject<Species[]>(),
            speciesGroupSubject: new Subject<SpeciesGroup[]>(),
            viewDataSubject: of(EMPTY_VIEW_DATA_ENUMS),
            dataUploadSubject: of(EMPTY_UPLOAD_ENUMS)
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
