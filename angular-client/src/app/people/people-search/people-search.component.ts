import { Component, OnDestroy, OnInit } from '@angular/core';
import { is } from 'ramda';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ActivatedRoute, Router } from '@angular/router';

import { ConfigurationService } from '../../services/configuration.service';
import { BandingLevel, PeopleData, Status } from '../people-data';
import { PeopleService } from '../../services/people.service';
import { EditPersonComponent } from '../edit-person/edit-person.component';
import { Data } from '../../services/data';
import { AuthenticationService, PersonIdentity } from '../../authentication/authentication.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-manage-people',
  templateUrl: './people-search.component.html',
  styleUrls: ['./people-search.component.scss']
})
export class PeopleSearchComponent implements OnInit, OnDestroy {
  person: PersonIdentity;

  // people data
  people: PeopleData[];
  displayPeople: PeopleData[];
  allPeople = 0;
  activePeople = 0;
  suspendedPeople = 0;
  lockedPeople = 0;
  selected: string;

  currentStatus: Status = 'ALL';

  // pagination
  numberOfPeople = 2619;
  peopleStart = 0;
  peopleEnd = 0;
  currentPage = 1;
  limitPerPage = 20;
  jumpToPage = '';

  // banding level
  bandingLevel: string[];
  selectedBandingLevel: string;

  // add person modal
  modalRef: BsModalRef;

  alerts: any[] = [];
  dismissible = true;
  exporting = false;

  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private config: ConfigurationService,
    private peopleService: PeopleService,
    private auth: AuthenticationService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private modalService: BsModalService,
    private data: Data
  ) {}

  ngOnInit() {
    this.auth.identitySubject.pipe(takeUntil(this.destroy$)).subscribe(ident => {
      this.person = ident;
    });

    // from config
    this.bandingLevel = this.config.getConfig().bandingLevel;

    // use stored search criteria or default
    if (this.data.storage) {
      this.selectedBandingLevel = this.data.storage.banderLevel;
      this.currentStatus = this.data.storage.currentStatus;
      this.limitPerPage = this.data.storage.limit;
      this.currentPage = this.data.storage.page;
      this.data.storage = null;
    } else {
      this.selectedBandingLevel = this.bandingLevel[0];
    }

    // load people from API
    // this.loadPeopleFromAPI('/banders?limit=20');
    this.loadPeopleFromAPI();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  /**
   * Limit change event from UI. Fired by the results per page select box
   */
  public onLimitChanged(event: any) {
    this.limitPerPage = Number(event.target.value);
    this.applyFilter();
    // this.loadPeopleFromAPI(this.getPathForPagination(this.currentPage));
  }

  /**
   * PageChanged event from UI. Fired by the pagination when the page changes
   */
  public pageChanged(event: any): void {
    const path = this.getPathForPagination(event.page);
    this.currentPage = event.page;
    this.applyFilter();
    // this.loadPeopleFromAPI(path);
  }

  /**
   * Blur event from UI. Will change the current page of the pagination.
   */
  public onJumpTo(): void {
    const page = Number(this.jumpToPage);
    if (is(Number, page)) {
      this.currentPage = page;
    }
    this.jumpToPage = '';
  }

  /**
   * Changes the banding level and applies the filter
   */
  public onBandingLevelChange(event: any): void {
    this.selectedBandingLevel = event.target.value;
    this.applyFilter();
  }

  /**
   * Status changed event from UI.
   */
  public onStatusChanged(status: string): void {
    switch (status) {
      case 'all':
        this.numberOfPeople = this.allPeople;
        this.currentStatus = 'ALL';
        break;
      case 'active':
        this.numberOfPeople = this.activePeople;
        this.currentStatus = 'ACTIVE';
        break;
      case 'suspended':
        this.numberOfPeople = this.suspendedPeople;
        this.currentStatus = 'SUSPENDED';
        break;
      case 'locked':
        this.numberOfPeople = this.lockedPeople;
        this.currentStatus = 'LOCKED';
        break;
    }
    this.applyFilter();
  }

  /**
   * Opens 'Add person modal'
   */
  public onAddPerson(): void {
    const config = {
      backdrop: true,
      ignoreBackdropClick: true,
      class: 'edit-modal',
      initialState: {
        data: {
          isAdd: true,
          isAdmin: this.person.isAdmin
        }
      }
    };
    this.modalRef = this.modalService.show(EditPersonComponent, config);
    this.modalRef.content.onClose.subscribe(result => {
      if (result) {
        this.alerts.push({
          type: 'success',
          msg: 'New person added.',
          timeout: 3000
        });
        this.loadPeopleFromAPI();
      }
    });
  }

  /**
   * From the people typeahead jump directly to the chosen user.
   */
  onSelectPeople(item: any): void {
    this.data.storage = {
      banderLevel: this.selectedBandingLevel,
      currentStatus: this.currentStatus,
      limit: this.limitPerPage,
      page: this.currentPage
    };
    this.router.navigate(['/people-view/' + item.id]);
  }

  /**
   * Closes an alert
   */
  onClosed(dismissedAlert: any): void {
    this.alerts = this.alerts.filter(alert => alert !== dismissedAlert);
  }

  exportContactDetails() {
    this.exporting = true;
    this.peopleService.getBanderDataFile().subscribe(
      _ => (this.exporting = false),
      _ => (this.exporting = false)
    );
  }

  /**
   * Called by UI, for display only
   */
  public getMaxBandingLevel(maxBandingLevel: BandingLevel): string {
    switch (maxBandingLevel) {
      case 'L1':
        return '1';
      case 'L2':
        return '2';
      case 'L3':
        return '3';
    }
    return '';
  }

  /**
   * Applies any banding level or status filter set.
   */
  private applyFilter() {
    if (this.currentStatus === 'ALL') {
      this.displayPeople = this.people;
    } else {
      this.displayPeople = this.people.filter(pp => pp.status === this.currentStatus);
    }
    if (this.selectedBandingLevel !== 'All') {
      this.displayPeople = this.displayPeople.filter(pp => pp.maxBandingLevel === this.selectedBandingLevel);
    }
    this.handlePagination();
  }

  /**
   * Takes care of the pagination
   */
  private handlePagination(): void {
    this.peopleStart = this.currentPage === 1 ? 0 : (this.currentPage - 1) * this.limitPerPage;
    if (this.displayPeople.length - this.peopleStart < this.limitPerPage) {
      this.peopleEnd = this.peopleStart + this.displayPeople.length - this.peopleStart;
    } else {
      this.peopleEnd = this.peopleStart + this.limitPerPage;
    }
    this.numberOfPeople = this.displayPeople.length;
    this.displayPeople = this.displayPeople.slice(this.peopleStart, this.peopleEnd);
  }

  /**
   * Returns the pagination path related to the given page number and the current
   * limitPerPage
   */
  private getPathForPagination(page: number): string {
    let path = '/banders?limit=' + this.limitPerPage;
    if (page !== 1) {
      path += '&paginationToken=' + page * this.limitPerPage;
    }
    return path;
  }

  /**
   * Loads all people from API
   */
  private loadPeopleFromAPI(path?: string) {
    this.peopleService.getPeople(path).pipe(takeUntil(this.destroy$)).subscribe(result => {
      this.people = result;
      this.gatherStats();
      this.applyFilter();
    });
  }

  /**
   * Gets a couple of numbers for the UI from the list of people
   */
  private gatherStats(): void {
    // remove INACTIVE people as we do not need then at the moment seems to be no longer needed???
    // this.people = this.people.filter(p => p.status !== 'INACTIVE');

    // now get a couple of numbers
    this.people.forEach(p => {
      this.activePeople += p.status === 'ACTIVE' ? 1 : 0;
      this.suspendedPeople += p.status === 'SUSPENDED' ? 1 : 0;
      this.lockedPeople += p.status === 'LOCKED' ? 1 : 0;
    });
    this.allPeople = this.activePeople + this.suspendedPeople + this.lockedPeople;
    this.numberOfPeople = this.allPeople;
  }
}
