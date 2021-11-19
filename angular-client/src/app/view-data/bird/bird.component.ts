import { Component, OnDestroy, OnInit, Renderer2, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BirdService } from 'src/app/view-data/services/bird.service';
import { Bird, EventData, ListEventDataResponse } from '../services/event-types';
import { PreviousRouteService } from '../../services/previous-route.service';
import { AuthenticationService, PersonIdentity } from '../../authentication/authentication.service';
import { PeopleService } from '../../services/people.service';
import { Subject, forkJoin, concat, Observable } from 'rxjs';
import { takeUntil, take, concatMap, map, concatMapTo, tap} from 'rxjs/operators';
import { ProjectService } from '../../projects/services/project.service';

@Component({
  selector: 'app-bird',
  templateUrl: './bird.component.html',
  styleUrls: ['./bird.component.scss'],
})
export class BirdComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();


  bird: Bird = {
    bands: [],
    commonName: '',
    firstRecorded: null,
    friendlyName: '',
    id: '',
    lastRecorded: null,
    lastSeenAt: '',
    species: '',
    speciesCode: null,
    speciesGroup: '',
    birdDisplayName: '',
    scientificName: '',
    sex: {
      code: '',
      description: '',
    },
    age: {
      description: '',
      code: '',
    },
    firstSeenAt: '',
    cumulativeDistanceKm: null,
    deltaFirstLastSightingKm: null,
    deltaMostRecentSightingKm: null,
    dispersalDistanceKm: null,
    inferredBirdStatus: '',
    longevity: null,
    earliestEvent: null
  };

  events: EventData[];

  birdId: string;

  nameState: ('editing' | 'saving' | 'read-only') = 'read-only';

  resultsCount = 0;

  limitPerPage = 20;

  isFirstPage = false;

  isLastPage = false;

  person: PersonIdentity;

  reloadMap: Subject<boolean> = new Subject<boolean>();

  private prevPaginationToken: string;
  private nextPaginationToken: string;
  private currentPaginationToken: string;

  isAdmin: boolean;
  isEventOwner: boolean;
  isEventProvider: boolean;
  isEventReporter: boolean;
  isProjectManager: boolean;

  friendlyName: string;

  @ViewChild('friendlyNameInput') friendlyNameInput: ElementRef;
  constructor(
    private route: ActivatedRoute,
    private birdService: BirdService,
    private router: Router,
    private previousRouteService: PreviousRouteService,
    private authenticationService: AuthenticationService,
    private peopleService: PeopleService,
    private projectService: ProjectService
  ) {}

  ngOnInit() {

    const route$ = this.route.paramMap.pipe(take(1));
    const person$ = this.authenticationService.identitySubject.pipe(take(1), tap(p => { this.isAdmin = p.isAdmin; console.log('Is admin' + this.isAdmin) }));
    const personDetail$ = person$.pipe(concatMap(person => this.peopleService.getPerson(person.userId)));
    const birdDetail$ = route$.pipe(concatMap(route => this.birdService.getBirdById(route.get('birdId'))));
    const project$ = birdDetail$.pipe(concatMap(birdDetail => this.projectService.getProjectDetails(birdDetail.earliestEvent.projectId)));

    forkJoin([birdDetail$, personDetail$]).subscribe(([birdDetail, personDetail]) => {
      this.isEventOwner = birdDetail.earliestEvent.eventOwnerId === personDetail.id;
      this.isEventProvider = birdDetail.earliestEvent.eventProviderId === personDetail.id;
      this.isEventReporter = birdDetail.earliestEvent.eventReporterId === personDetail.id;
      console.dir(birdDetail.earliestEvent);
    });

    forkJoin([project$, personDetail$]).subscribe(([project, personDetail]) => {
      this.isProjectManager = project.projectManager.id === personDetail.id;
    });
   

    this.authenticationService.identitySubject.pipe(
      take(1),
      concatMap(person => {
        this.person = person;
        return this.peopleService.getPerson(person.userId);
      }),
      concatMap(personDetail => { 
        return () => { };
      })
    )
        

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const birdId = params.get('birdId');
      this.birdId = birdId;
      this.birdService
        .getBirdById(birdId)
        .pipe(takeUntil(this.destroy$))
        .subscribe((bird: Bird) => {
          bird.earliestEvent.eventOwnerId
          this.bird = bird;
          this.friendlyName = this.bird.friendlyName;
        });
      this.getEvents(birdId, null);
    });
  }

  edit() {
    this.nameState = 'editing';
    this.friendlyNameInput.nativeElement.focus();
    this.friendlyNameInput.nativeElement.select();
  }

  blurName() {
    if (this.nameState !== 'saving') {
      this.nameState = 'read-only';
    }
  }

  save() {
    this.nameState = 'saving';
    this.birdService.putBirdName(this.birdId, this.friendlyName, this.bird.speciesCode).subscribe(
      resp => {
        this.bird.friendlyName = resp.friendlyName;
        this.nameState = 'read-only';
      },
      err => {
        this.friendlyName = this.bird.friendlyName;
        this.nameState = 'read-only';
      }
    )
  }


  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  nextPage() {
    this.getEvents(this.birdId, this.nextPaginationToken);
  }

  prevPage() {
    this.getEvents(this.birdId, this.prevPaginationToken);
  }

  onLimitChanged() {
    this.getEvents(this.birdId, this.currentPaginationToken);
  }

  private getEvents(birdId: string, paginationToken: string) {
    this.birdService.getEventsForBirdId(this.limitPerPage, birdId, paginationToken).subscribe((response: ListEventDataResponse) => {
      this.events = response.listData;
      this.resultsCount = this.events.length;
      this.currentPaginationToken = response.selfPaginationToken;
      this.prevPaginationToken = response.prevPaginationToken;
      this.nextPaginationToken = response.nextPaginationToken;
      this.isFirstPage = response.isFirstPage;
      this.isLastPage = response.isLastPage;
      this.reloadMap.next(true);
    });
  }

  // take the person back to where they came from
  goBack() {
    const previousRoute = this.previousRouteService.getPreviousRoute('/view-data');
    this.router.navigate([previousRoute]);
  }

  copyBirdIdToClipboard() {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(`${this.birdId}`);
    }
  }

  scrollToTop() {
    window.scrollTo(0, 0);
  }

  get canEdit(): boolean {
    return this.bird.friendlyName && this.isAdmin || this.isProjectManager || this.isEventOwner || this.isEventReporter || this.isEventProvider;
  }

}
