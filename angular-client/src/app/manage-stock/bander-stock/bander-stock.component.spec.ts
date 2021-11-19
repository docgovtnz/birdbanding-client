import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BanderStockComponent } from './bander-stock.component';
import { FormsModule } from '@angular/forms';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { AuthenticationService } from '../../authentication/authentication.service';
import { of } from 'rxjs';
import { PeopleService } from '../../services/people.service';
import { ReferenceDataService } from '../../services/reference-data.service';
import { BandsService } from '../services/bands.service';
import { ModalModule } from 'ngx-bootstrap/modal';

describe('BanderStockComponent', () => {
  let component: BanderStockComponent;
  let fixture: ComponentFixture<BanderStockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, TypeaheadModule.forRoot(), PaginationModule.forRoot(), ModalModule.forRoot()],
      declarations: [BanderStockComponent],
      providers: [
        {
          provide: AuthenticationService,
          useValue: {
            identitySubject: of({
              isAdmin: false,
              userId: '',
              setTokensAndExpiry: () => {}
            })
          }
        },
        {
          provide: PeopleService,
          useValue: {
            getPeople: () => of([])
          }
        },
        {
          provide: ReferenceDataService,
          useValue: {
            stockSubject: of({
              MARK_STATUS_SEARCH: [],
              PREFIX_NUMBERS: []
            })
          }
        },
        {
          provide: BandsService,
          useValue: {
            searchBands: () =>
              of({
                bands: [],
                pagination: {
                  self: '',
                  prev: '',
                  next: '',
                  pageCount: 1,
                  count: 1,
                  countFromPageToEnd: false,
                  isLastPage: true
                }
              }),
            getBands: () => of([])
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BanderStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
