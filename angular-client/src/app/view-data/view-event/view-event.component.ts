import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { EventDataService } from '../services/event-data.service';
import { PeopleService } from '../../services/people.service';

import { EMPTY_EVENT_DETAILS, EventDetails } from '../services/event-types';
import { AuthenticationService, PersonIdentity } from '../../authentication/authentication.service';

import { DuplicateModalComponent } from '../duplicate-modal/duplicate-modal.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ConfirmDeleteComponent } from '../confirm-delete/confirm-delete.component';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, take, tap, mergeMap } from 'rxjs/operators';
import { CharacteristicValue } from '../../services/reference-data.service';


@Component({
  selector: 'app-view-event',
  templateUrl: './view-event.component.html',
  styleUrls: ['./view-event.component.scss'],
})
export class ViewEventComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();

  eventId: string;

  eventDetails: EventDetails = EMPTY_EVENT_DETAILS;

  charList: [] = [];

  // used for mapping
  events: EventDetails[];

  alerts: any[] = [];
  dismissible = true;

  loggedInIdentity: PersonIdentity;

  isEditor = false;
  isDeletor = false;

  // is this a record that has just been created
  isAdd = false;

  birdCharacteristics = {
    outConditionCode: null, outStatusCode: null, age: null, sex: null, wingLength: null,
    billLength: null, moultScore: null, bodyCondition: null, mass: null, statusDetails: null, moultNotes: null
  };

  // i.e. have a separate location in the ui so don't appear in the other detail list
  standAloneChars = (Object.keys(this.birdCharacteristics)).map(k => k.toLowerCase());

  constructor(
    private route: ActivatedRoute,
    private eventService: EventDataService,
    private router: Router,
    private authenticationService: AuthenticationService,
    private modalService: BsModalService,
    private locationService: Location,
    private peopleService: PeopleService,
  ) { }

  ngOnInit() {
    forkJoin([
      this.authenticationService.identitySubject.pipe(
        take(1),
        tap(ident => this.loggedInIdentity = ident),
        mergeMap(ident => this.peopleService.getPerson(ident.userId))
      ),
      this.route.paramMap.pipe(
        take(1),
        mergeMap(params => this.eventService.getEventDetails(params.get('eventId')))
      )
    ]).subscribe(([person, event]) => {
      this.eventId = event.eventId;
      this.eventDetails = event;
      this.events = [event];
      const isProvider = event.provider.banderId === this.loggedInIdentity.userId;
      const isReporter = event.reporter.banderId === this.loggedInIdentity.userId;
      const isProjectMember = person.projects.map(p => p.projectId).includes(event.projectId);
      const isAdmin = this.loggedInIdentity.isAdmin;
      this.isEditor = isProvider || isReporter || isProjectMember || isAdmin;
      this.isDeletor = isProvider || isReporter || isAdmin;
      const getChar = code => this.eventDetails.characteristicValues.find(c => c.code === code.toLowerCase());
      const birdChar = Object.keys(this.birdCharacteristics).reduce((acc, chrName) => {
        acc[chrName] = getChar(chrName);
        return acc;
      }, {} as any
      );

      this.birdCharacteristics = new Proxy(birdChar, {
        get(target, prop: string, receiver) {
          const char: CharacteristicValue = Reflect.get(target, prop, receiver);
          const val = char?.value;
          if (!char) {
            return '-';
          }
          if (char.code === 'statusdetails') {
            const statuses = val.toString().split(',').sort();
            return statuses;
          }
          else if (!val || val === '') {
            return '-';
          }
          else if (char.dataType === 'TEXT') {
            return char.displayValue;
          }
          else if (char.unit) {
            return `${val} ${char.unitDescriptor}`;
          }
          else {
            return val;
          }
        }
      });
    });

    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
        const status = params.get('status');
        switch (status) {
          case 'added':
            this.isAdd = true;
            this.alerts.push({
              type: 'success',
              msg: 'Event added',
              timeout: 3000,
            });
            break;
          case 'updated':
            this.alerts.push({
              type: 'success',
              msg: 'Event updated',
              timeout: 3000,
            });
            break;
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  onClosed(dismissedAlert: any): void {
    this.alerts = this.alerts.filter((alert) => alert !== dismissedAlert);
  }

  goBack() {
    this.locationService.back();
  }

  duplicateEvent(): void {
    const config = {
      backdrop: true,
      ignoreBackdropClick: true,
      class: 'duplicate-modal',
      initialState: {
        eventType: this.eventDetails.eventType,
        eventId: this.eventDetails.eventId,
      },
    };
    this.modalService.show(DuplicateModalComponent, config);
  }

  deleteEvent(): void {
    const config = {
      backdrop: true,
      ignoreBackdropClick: false,
      class: 'delete-modal',
      initialState: {
        eventId: this.eventDetails.eventId,
      },
    };
    this.modalService.show(ConfirmDeleteComponent, config);
  }

  formatMoultScore(): string {
    const chrValue: Array<string> = this.eventDetails.characteristicValues.find(cv => cv.code === 'moultscore')?.value as Array<string>;
    if (!chrValue) {
      return Array(10).join('-, ') + '-';
    }
    return chrValue.map(score => {
      return (!isNaN(parseFloat(score)) ? parseFloat(score) : '-');
    }).join(',');
  }

  formatCharValue(charName: string): string {
    const chrValue = this.eventDetails.characteristicValues.find(cv => cv.code === charName);
    if (chrValue) {
      return chrValue.value.toString();
    }
    else {
      return '-';
    }
  }
}
