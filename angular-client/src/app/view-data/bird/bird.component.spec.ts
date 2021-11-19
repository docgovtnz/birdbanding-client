import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { BirdComponent } from './bird.component';
import { EventDataService } from '../services/event-data.service';
import { BirdService } from '../services/bird.service';

import { of } from 'rxjs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { Bird } from '../services/event-types';
import { PreviousRouteService } from '../../services/previous-route.service';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthenticationService } from '../../authentication/authentication.service';

describe('BirdComponent', () => {
  let component: BirdComponent;
  let fixture: ComponentFixture<BirdComponent>;

  const testBirdId = 'bird-12345';

  const getEventsForBirdIdSpy: jasmine.Spy = jasmine.createSpy('getEventsForBirdId').and.returnValue(
    of({
      listData: []
    })
  );

  const testBird: Bird = {
    bands: [],
    commonName: 'testName',
    firstRecorded: new Date(),
    lastRecorded: new Date(),
    friendlyName: 'soFriendly',
    id: '24323',
    lastSeenAt: 'Downtown',
    firstSeenAt: 'Uptown',
    species: 'special',
    speciesCode: 1234,
    speciesGroup: 'birds',
    scientificName: 'Special name',
    birdDisplayName: 'B-451',
    age: { code: 'A', description: 'Adult' },
    sex: {
      description: 'Female',
      code: 'F'
    },
    longevity: 34,
    dispersalDistanceKm: 4,
    cumulativeDistanceKm: 34,
    deltaFirstLastSightingKm: 4,
    deltaMostRecentSightingKm: 4,
    inferredBirdStatus: 'Alive'
  };

  const getBirdByIdSpy: jasmine.Spy = jasmine.createSpy('getBirdById').and.returnValue(of(testBird));

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [PaginationModule.forRoot(), FormsModule, TooltipModule.forRoot(), RouterTestingModule],
      declarations: [BirdComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({
              get: () => testBirdId
            })
          }
        },
        {
          provide: EventDataService,
          useValue: {}
        },
        {
          provide: BirdService,
          useValue: {
            getBirdById: getBirdByIdSpy,
            getEventsForBirdId: getEventsForBirdIdSpy
          }
        },
        {
          provide: PreviousRouteService,
          useValue: {}
        },
        {
          provide: AuthenticationService,
          useValue: {
            identitySubject: of({})
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BirdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getEventsForBirdId with birdId and inital limit', () => {
    expect(component).toBeTruthy();
    expect(getEventsForBirdIdSpy.calls.mostRecent().args[1]).toEqual(testBirdId);
    expect(getEventsForBirdIdSpy.calls.mostRecent().args[0]).toEqual(component.limitPerPage);
  });

  it('should call getBirdById with birdId', () => {
    expect(component).toBeTruthy();
    expect(getBirdByIdSpy.calls.mostRecent().args[0]).toEqual(testBirdId);
  });

  it('returned bird is saved', () => {
    expect(component).toBeTruthy();
    expect(component.bird).toEqual(testBird);
  });

  it('call events with the new limit when onLimitChanged called', () => {
    const newLimit = 50;
    component.limitPerPage = newLimit;
    component.onLimitChanged();
    expect(getEventsForBirdIdSpy.calls.mostRecent().args[0]).toEqual(newLimit);
  });
});
