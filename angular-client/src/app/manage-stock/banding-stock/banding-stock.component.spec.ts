import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BandingStockComponent } from './banding-stock.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { PeopleService } from '../../services/people.service';
import { of } from 'rxjs';
import { BandTransferService } from '../services/band-transfer.service';
import { BandsService } from '../services/bands.service';
import { AuthenticationService } from '../../authentication/authentication.service';

describe('BandingStockComponent', () => {
  let component: BandingStockComponent;
  let fixture: ComponentFixture<BandingStockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule],
      declarations: [BandingStockComponent],
      providers: [
        { provide: PeopleService, useValue: { getPeople: () => of([]) } },
        {
          provide: BandTransferService,
          useValue: { getBandTransfers: () => of([]), getLatestBandTransfers: () => of([]) }
        },
        { provide: BandsService, useValue: { getBands: () => of([]), getBandSummary: () => of([]) } },
        {
          provide: AuthenticationService,
          useValue: {
            identitySubject: of({
              isAdmin: false
            })
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BandingStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
