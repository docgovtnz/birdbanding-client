import { Component, OnDestroy, OnInit } from '@angular/core';
import { EventData } from '../../services/event-types';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SearchDataResult, SearchDataService } from '../../services/search-data.service';
import { ExportModalComponent } from '../../export-modal/export-modal.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EventProjectModalComponent } from '../../event-project-modal/event-project-modal.component';
import { MapDataService } from '../../services/map-data.service';
import { AuthenticationService, PersonIdentity } from '../../../authentication/authentication.service';

@Component({
  selector: 'app-event-data-table',
  templateUrl: './event-data-table.component.html',
  styleUrls: ['./event-data-table.component.scss'],
})
export class EventDataTableComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();

  isLoading: boolean;

  isLoadingPage: boolean;

  hasResultsToDisplay: boolean;

  events: EventData[];

  isFirstPage: boolean;

  isLastPage: boolean;

  resultsCount: number;

  // pagination
  limitPerPage: number;

  numberOfEvents = 200;

  exportModalRef: BsModalRef;

  isAdvancedSearch = false;

  alerts: any[] = [];

  person: PersonIdentity;

  constructor(
    private searchDataService: SearchDataService,
    private modalService: BsModalService,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit() {
    this.isAdvancedSearch = this.searchDataService.isAdvancedSearch;
    this.limitPerPage = this.searchDataService.currentLimit;
    this.searchDataService.hasSearchToDisplayBehaviour.pipe(takeUntil(this.destroy$)).subscribe((hasSearchToDisplay: boolean) => {
      this.hasResultsToDisplay = hasSearchToDisplay;
    });
    this.searchDataService.isLoadingBehaviour.pipe(takeUntil(this.destroy$)).subscribe((loading: boolean) => {
      this.isLoading = loading;
    });
    this.searchDataService.searchResults.pipe(takeUntil(this.destroy$)).subscribe((events: SearchDataResult) => {
      this.events = events.eventData;
      this.resultsCount = this.events.length;
      this.numberOfEvents = this.events.length;
      this.isFirstPage = events.isFirstPage;
      this.isLastPage = events.isLastPage;
    });
    this.searchDataService.isLoadingPage$.pipe(takeUntil(this.destroy$)).subscribe((loadingPage) => (this.isLoadingPage = loadingPage));
    this.authenticationService.identitySubject.subscribe((p) => (this.person = p));
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  nextPage() {
    this.searchDataService.nextPage();
  }

  previousPage() {
    this.searchDataService.previousPage();
  }

  onLimitChanged(event: Event) {
    this.searchDataService.changeLimit(this.limitPerPage);
  }

  scrollToTop() {
    window.scrollTo(0, 0);
  }

  exportSearchData(): void {
    const config = {
      backdrop: true,
      ignoreBackdropClick: true,
      class: 'export-modal',
      initialState: {
        filterOptions: this.searchDataService.currentSearchOptions,
      },
    };
    this.exportModalRef = this.modalService.show(ExportModalComponent, config);
  }

  exportAdvancedSearchData() {
    const config = {
      backdrop: true,
      ignoreBackdropClick: true,
      class: 'export-modal',
      initialState: {
        filterOptions: this.searchDataService.currentAdvancedOptions,
      }
    };
    this.exportModalRef = this.modalService.show(ExportModalComponent, config);
  }

  linkToProject(): void {
    const config = {
      backdrop: true,
      ignoreBackdropClick: true,
      class: 'export-modal',
      initialState: {
        eventIds: this.events.map((e) => e.eventId),
      },
    };
    const ref = this.modalService.show(EventProjectModalComponent, config);
    ref.content.updatedEvents.pipe(takeUntil(this.destroy$)).subscribe((updateEvent) => {
      this.searchDataService.searchAgain();
      this.alerts.push({
        type: 'success',
        msg: `Events linked to ${updateEvent.projectName}`,
        sub: 'This will be reflected within 30 minutes',
        timeout: 5000,
      });
    });
  }

  /**
   * Closes an alert
   */
  onClosed(dismissedAlert: any): void {
    this.alerts = this.alerts.filter((alert) => alert !== dismissedAlert);
  }
}
