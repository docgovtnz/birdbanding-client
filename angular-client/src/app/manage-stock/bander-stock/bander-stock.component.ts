import { Component, HostListener, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { combineLatest, fromEvent, Subject } from 'rxjs';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ViewportScroller } from '@angular/common';

import { PeopleData } from '../../people/people-data';
import { PeopleService } from '../../services/people.service';
import { AuthenticationService, PersonIdentity } from '../../authentication/authentication.service';
import { Band, BandState, SelectableBandStates } from '../model/band';
import { ReferenceDataService, StockEnums } from '../../services/reference-data.service';
import { BandsService } from '../services/bands.service';
import { Pagination } from '../model/band-transfer';
import { debounceTime, takeUntil } from 'rxjs/operators';

export interface BandSearchFields {
  prefix: string;
  bandNumberFrom: string;
  bandNumberTo: string;
  status: string;
  prefixNumber: string;
  shortNumber: string;
  bander: PeopleData;
  limit: number;
  paginationToken: number;
}

interface BucketItem {
  prefix: string;
  amount: number;
  bands: Band[];
}

@Component({
  selector: 'app-bander-stock',
  templateUrl: './bander-stock.component.html',
  styleUrls: ['./bander-stock.component.scss', '../manage-stock.component.scss']
})
export class BanderStockComponent implements OnInit, OnDestroy {
  person: PersonIdentity;

  loaded = false;

  isSaving = false;

  // all possible status for bands
  allState: StockEnums;
  selectableBandStates = SelectableBandStates;
  newEventStates = Object.keys(BandState);
  returnStates = [BandState.RETURNED, BandState.RETURNED_USED];


  // search fields
  searchFields: BandSearchFields;
  people: PeopleData[];
  bandPrefixes: string[];
  // Typeahead can deal with object.field notation. This is only for display
  selectedBander: string;

  transferToBander: PeopleData;
  selectedTransferTo: string;
  transferDate: Date;


  selectedNewEventBander: string;
  newEventBander: string = null;
  selectNewEventBander: string;
  newEventDate: Date;
  newEventTime = '00:00';
  newEventState: BandState;
  newEventDateError = null;
  newEventTimeError = null;
  newEventStateError = null;
  newEventBanderError = null;
  saveError = null;

  isSearching = false;
  noResults = false;

  filterBy: ('NEW_EVENT' | 'TRANSFER' | 'DELETE') = 'TRANSFER';

  allBandsRaw: Band[];
  allBands: Band[][] = [];
  bandsSize = 0;
  bandsBucket: BucketItem[] = [];
  toBucket = false;
  topHeight: number;

  // pagination
  currentPageUrl = '';
  previousPageUrl = '';
  nextPageUrl = '';
  isFirstPage: boolean;
  isLastPage: boolean;
  limitPerPage = 100;
  paginationToken = 0;
  currentPage = 1;
  fromItem = 0;
  toItem = 0;


  // modals
  deleteRef: BsModalRef;
  transferRef: BsModalRef;
  newEventRef: BsModalRef;

  alerts: any[] = [];
  dismissible = true;

  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private auth: AuthenticationService,
    private peopleService: PeopleService,
    private refService: ReferenceDataService,
    private bandService: BandsService,
    private modalService: BsModalService,
    private viewPortScroller: ViewportScroller
  ) {}

  ngOnInit() {
    combineLatest([this.auth.identitySubject, this.peopleService.getPeople(), this.refService.stockSubject]).subscribe(
      ([person, people, stockEnums]) => {
        this.person = person;
        this.people = people;
        this.allState = stockEnums;
        this.bandPrefixes = stockEnums.PREFIX_NUMBERS.map(prefix => prefix.toUpperCase());
        this.bandPrefixes.unshift('ALL');

        this.resetSearchFields();

        // trigger initial search for non-admins
        if (!this.person.isAdmin) {
          this.onSearch();
        }

        // get initial top height of bucket for initial rendering
        this.topHeight = window.innerHeight / 2 - (490 / 2);

        // react on window resize event
        fromEvent(window, 'resize')
          .pipe(
            debounceTime(1000),
            takeUntil(this.destroy$)
          ).subscribe((event: any) => {
          const innerHeight = event.target.innerHeight;
          this.topHeight = innerHeight / 2 - (490 / 2);
        });

        this.loaded = true;
      }
    );
  }


  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }


  /**
   * UI search button click, search for all bands via API
   */
  onSearch(): void {
    // reset mark and delete all
    this.toBucket = false;

    this.isSearching = true;
    this.noResults = false;

    if (!this.person.isAdmin) {
      this.searchFields.bander = this.people.find(ppl => ppl.id === this.person.userId);
    }
    this.bandService.searchBands(this.searchFields).pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.allBandsRaw = res.bands;
      if (this.allBandsRaw.length === 0) {
        this.noResults = true;
      }
      this.prepareSearchResults(res.bands);
      this.handlePagination(res.pagination);
      this.synchCheckboxes();
      this.isSearching = false;
    });
  }

  /**
   * UI bander typeahead, store item for search
   */
  onSelectBander(item: any): void {
    this.searchFields.bander = item;
  }

  /**
   * UI - the little cross in the bander typeahead, removes selected from search and view
   */
  clearBanderSearch(): void {
    this.searchFields.bander = null;
    this.selectNewEventBander = null;
  }

  /**
   * UI - bander to typeahead (in modal), store for transfer
   */
  onSelectTransferTo(item: any): void {
    this.transferToBander = item;
  }

  /**
   * UI - checkbox: transfer bands into the bucket or out of the bucket
   */
  onToggleToBucket(): void {
    this.toBucket = !this.toBucket;
    if (this.toBucket) {
      // mark all bands
      this.allBandsRaw.forEach(b => {
        if (!this.isBandInBucket(b) && this.canSelect(b)) {
          this.transferBandToBucket(b);
        }
      });
    } else {
      // unmark all bands
      this.allBands.forEach(ab =>
        ab.forEach(b => {
          if (b.isBandMarked) {
            this.removeBandfromBucket(b);
          }
        })
      );
    }
  }

  /**
   * Returns true if the given band is already in the bucket
   */
  private isBandInBucket(band: Band): boolean {
    if (!band.isBandMarked && this.bandsBucket[band.bandPrefix]) {
      return this.bandsBucket[band.bandPrefix].includes(band);
    }
    return false;
  }

  /**
   * UI single band checkbox: toggle add or remove to/from bucket
   */
  onToggleBand(bucketIdx: number, bandIdx: number): void {
    const band = this.allBands[bucketIdx][bandIdx];
    if (band.isBandMarked) {
      band.isBandMarked = false;
      this.removeBandfromBucket(band);
    } else {
      band.isBandMarked = true;
      this.transferBandToBucket(band);
    }
  }

  /**
   * UI - toggles the edit mode
   */
  onToggleBandEdit(bucketIdx: number, bandIdx: number): void {
    const edit = !this.allBands[bucketIdx][bandIdx].isBandEdit;
    // clear all existing edit states before setting one to edit
    this.allBandsRaw.forEach(b => (b.isBandEdit = false));
    this.allBands[bucketIdx][bandIdx].isBandEdit = edit;
  }

  unselectAll() {
    this.toBucket = false;
    this.allBands.forEach(ab =>
      ab.forEach(b => {
        if (b.isBandMarked) {
          this.removeBandfromBucket(b);
        }
      }));
  }

  /**
   * UI - gets called when user clicks on a status from the dropdown, will change the status
   */
  onStatusChange(status: BandState, bucketIdx: number, bandIdx: number): void {
    const band = this.allBands[bucketIdx][bandIdx];
    this.bandService.changeStatus(band, status.toString()).subscribe(
      res => {
        band.state = status;
        band.isBandEdit = false;

        // check whether it is still allowed to delete or transfer the band in case it is ticked
        if (band.isBandMarked && !this.canSelect(band)) {
          this.removeBandfromBucket(band);
          band.isBandMarked = false;
        }
        this.showSuccessNotification('Status updated');
      },
      err => {
        console.log('status update failed');
      }
    );
  }

  /**
   * Returns a list of status which are selectable from the current status - wow, ugly. TODO: better via Map
   */
  getStatus(status: string): string[] {
    if (status === 'SEARCH') {
      const displStatus = JSON.parse(JSON.stringify(this.allState.MARK_STATUS_SEARCH)); // clone array
      displStatus.unshift('ALL');
      return displStatus;
    } else if (status === 'NEW') {
      return this.allState.MARK_STATUS_FROM_NEW;
    } else if (status === 'ALLOCATED') {
      return this.allState.MARK_STATUS_FROM_ALLOCATED;
    } else if (status === 'ATTACHED') {
      return this.allState.MARK_STATUS_FROM_ATTACHED;
    } else if (status === 'DETACHED') {
      return this.allState.MARK_STATUS_FROM_DETACHED;
    } else if (status === 'LOST') {
      return this.allState.MARK_STATUS_FROM_LOST;
    } else if (status === 'PRACTICE') {
      return this.allState.MARK_STATUS_FROM_PRACTICE;
    } else if (status === 'RETURNED') {
      return this.allState.MARK_STATUS_FROM_RETURNED;
    } else if (status === 'RETURNED_USED') {
      return this.allState.MARK_STATUS_FROM_RETURNED_USED;
    } else if (status === 'OTHER') {
      return this.allState.MARK_STATUS_FROM_OTHER;
      // pending statuses can't be transformed
    } else if (status.slice(0, 2) === '**' && status.slice(-2) === '**') {
      return Array<string>();
    } else {
      return this.allState.MARK_STATUS_SEARCH;
    }
  }

  /**
   * UI - click on previous pagination
   */
  onPreviousPage(): void {
    this.viewPortScroller.scrollToPosition([0, 0]);
    this.loadPagination(this.previousPageUrl);
  }

  /**
   * UI - click on next pagination
   */
  onNextPage(): void {
    this.viewPortScroller.scrollToPosition([0, 0]);
    this.loadPagination(this.nextPageUrl);
  }

  /**
   * UI - click on transfer band, opens a modal to transfer the bands in the bucket
   */
  onTransferBands(template: TemplateRef<any>): void {
    const config = {
      backdrop: true,
      ignoreBackdropClick: true,
      class: 'transfer-modal'
    };
    this.transferDate = new Date();
    this.transferRef = this.modalService.show(template, config);
  }

  /**
   * UI - click on addEvent, opens a modal to add events to the bands in the bucket
   */
  onNewEvent(template: TemplateRef<any>): void {
    const config = {
      backdrop: true,
      ignoreBackdropClick: true,
      class: 'transfer-modal'
    };

    this.newEventRef = this.modalService.show(template, config);
  }
  /**
   * UI - gets called from the modal to transfer the bands via API call
   */
  onConfirmTransfer(): void {
    const bandsToTransfer = this.getListFromBucket();
    this.isSaving = true;
    this.bandService.transferBands(this.transferToBander.id, this.transferDate, bandsToTransfer).subscribe(
      _ => {
        this.onSearch();
        this.cancelTransfer();
        this.onEmptyBucket();
        this.showSuccessNotification('Bands transferred');
        this.isSaving = false;
      },
      err => {
        console.log('Unable to transfer bands');
        if (err?.error?.details) {
          this.saveError = 'Error: '  + err.error.details.map(e => e.message).join('. ');
        }
        this.isSaving = false;
      },
    );
  }

  isBanderSelectable() {
    return !this.returnStates.includes(this.newEventState);
  }

  validateNewEvent(): boolean {

    this.newEventStateError = this.newEventDateError = this.newEventTimeError = this.newEventBanderError = null;
    let isError = false;

    if (!this.newEventState) {
      this.newEventStateError = 'A state must be selected.';
      isError = true;
    }
    if (!this.newEventDate) {
      this.newEventDateError = 'A date must be selected.';
      isError = true;
    }
    if (!this.newEventTime) {
      this.newEventTimeError = 'A time must be selected.';
      isError = true;
    }
    else if (!/^(2[0-3]|[01]?[0-9]):([0-5]?[0-9])$/.test(this.newEventTime)) {
      this.newEventTimeError = 'Time must be in HH:MM format.';
      isError = true;
    }
    return !isError;
  }


  /**
   * UI - gets called from the modal to transfer the bands via API call
   */
  onConfirmNewEvent(): void {
    if (!this.validateNewEvent()) {
      return;
    }
    const bandsForNewEvent = this.getListFromBucket();
    this.isSaving = true;
    this.bandService.addBandHistoryMultiple(this.newEventBander, this.newEventDate,
      this.newEventTime, this.newEventState, bandsForNewEvent).subscribe(
        _ => {
          this.onSearch();
          this.onEmptyBucket();
          this.showSuccessNotification('Band event' + (bandsForNewEvent.length ? 's' : '') + ' created');
          this.isSaving = false;
          this.cancelNewEvent();
        },
        err => {
          if (err?.error?.details) {
            this.saveError = 'Error: ' + err.error.details.map(e => e.message).join('. ');
          }
          this.isSaving = false;
          console.log('Unable to create new band events');
        }
    );
  }

  cancelNewEvent() {
    this.clearNewEventFields();
    this.newEventRef.hide();
  }

  clearNewEventFields() {
    this.saveError = null;
    this.newEventDateError = null;
    this.newEventTimeError = null;
    this.newEventStateError = null;
    this.newEventBanderError = null;
    this.newEventState = null;
    this.newEventTime = '00:00';
    this.newEventDate = null;
    this.newEventBander = null;
  }

  clearTransferFields() {
    this.saveError = null;
    this.selectedTransferTo = null;
    this.transferDate = null;
  }

  cancelTransfer() {
    this.clearTransferFields();
    this.transferRef.hide();
  }


  /**
   * Deletes all bands from the current bucket
   */
  onEmptyBucket(): void {
    // first: unset all marked bands
    this.allBandsRaw.forEach(b => (b.isBandMarked = false));

    // then delete bucket
    this.bandsBucket = [];
    this.toBucket = false;
  }

  /**
   * Returns true if the bucket has at least one item and all items can be deleted
   */
  canDeleteBucket(): boolean {
    if (this.bandsBucket.length === 0) {
      return false;
    }
    let canDelete = true;
    this.bandsBucket.forEach(bb =>
      bb.bands.forEach(b => {
        if (!this.canDelete(b)) {
          canDelete = false;
        }
      })
    );
    return canDelete;
  }

  /**
   * Returns true if the band is allowed to be transferred
   */
  canSelect(band: Band): boolean {
    if (this.filterBy === 'TRANSFER' || this.filterBy === 'DELETE') {
      return this.allState.MARK_STATUS_CAN_TRANSFER.includes(band.state.toString());
    }
    return true;
  }

  /**
   * Returns true if the band can be deleted
   */
  private canDelete(band: Band): boolean {
    return this.allState.MARK_STATUS_CAN_DELETE.includes(band.state.toString());
  }

  private getListFromBucket(): Band[] {
    let list: Band[] = [];
    this.bandsBucket.forEach(bb => {
      list = list.concat(bb.bands);
    });
    return list;
  }

  /**
   * transfers the band into the bucket but only if it can be transferred or is not
   * already in the bucket
   */
  private transferBandToBucket(band: Band): void {
    if (!this.canSelect(band)) {
      return;
    }
    const bucket = this.bandsBucket.find(b => b.prefix === band.bandPrefix);
    if (bucket) {
      if (!bucket.bands.includes(band)) {
        bucket.amount++;
        bucket.bands.push(band);
      }
    } else {
      this.bandsBucket.push({
        prefix: band.bandPrefix,
        amount: 1,
        bands: [band]
      });
    }
    band.isBandMarked = true;
  }

  /**
   * Removes the band from the bucket
   */
  private removeBandfromBucket(band: Band): void {
    const bucket = this.bandsBucket.find(b => b.prefix === band.bandPrefix);
    if (bucket) {
      // const index = bucket.bands.indexOf(band); --> Doesn't work when doing Next then Previous
      let index = -1;
      bucket.bands.forEach((v, i) => {
        if (band.id === v.id) {
          index = i;
        }
      });
      if (index > -1) {
        band.isBandMarked = false;
        bucket.bands.splice(index, 1);
        bucket.amount--;
      }
      if (bucket.bands.length === 0) {
        const bucketIdx = this.bandsBucket.indexOf(bucket);
        if (bucketIdx > -1) {
          this.bandsBucket.splice(bucketIdx, 1);
        }
      }
    }
  }

  /**
   * Rehydrate checkboxes from bucket after a new search or pagination when
   * coming back.
   */
  private synchCheckboxes(): void {
    this.bandsBucket.forEach(items =>
      items.bands.forEach(item => {
        const band = this.allBandsRaw.filter(b => b.id === item.id);
        if (band.length !== 0) {
          band[0].isBandMarked = true;
        }
      })
    );
    this.toBucket = this.allBandsMarked();
  }

  /**
   * Returns true if all allowed bands are marked on the current screen
   */
  private allBandsMarked(): boolean {
    let counter = 0;
    this.allBands.forEach(ab =>
      ab.forEach(b => {
        if (b.isBandMarked) {
          counter++;
        }
      })
    );
    return counter > 0;
  }

  /**
   * UI - click on Delete bands button opens modal
   */
  onBandDelete(template: TemplateRef<any>): void {
    const config = {
      backdrop: true,
      ignoreBackdropClick: true,
      class: 'warn-modal'
    };
    this.deleteRef = this.modalService.show(template, config);
  }

  /**
   * UI - from modal deletes the bands via API call
   */
  onConfirmDelete(): void {
    const bandsToDelete = this.getListFromBucket();
    this.isSaving = true;
    this.bandService.deleteBands(bandsToDelete).subscribe(
      _ => {
        this.onSearch();
        this.deleteRef.hide();
        this.onEmptyBucket();
        this.showSuccessNotification('Band(s) deleted');
      },
      err => {
        console.error('Unable to delete bands');
      },
      () => { this.isSaving = false;}
    );
  }

  // At the moment not working, waiting for API
  // onLimitChanged(event: any) {
  //   this.limitPerPage = Number(event.target.value);
  //   console.log('Limit changed: trigger load from API');
  // }

  // At the moment not working, waiting for API to provide max results
  // onPageChanged(event: any): void {
  //   this.currentPage = event.page;
  //   console.log('Page changed: trigger load from API');
  // }

  // Parked for now as it is currently not possible due to the database
  // onJumpTo(): void {
  //   if (!this.jumpToPage) {
  //     return;
  //   }
  //   const page = Number(this.jumpToPage);
  //   if (is(Number, page)) {
  //     this.currentPage = page - 1;
  //
  //     // calculate pagination token
  //     const paginationToken = this.limitPerPage * this.currentPage;
  //     if (this.currentPageUrl.includes('paginationToken')) {
  //       this.currentPageUrl = this.currentPageUrl.substring(0, this.currentPageUrl.length - 2) + paginationToken;
  //     } else {
  //       this.currentPageUrl = `${this.currentPageUrl}&paginationToken=${paginationToken}`;
  //     }
  //     this.loadPagination(this.currentPageUrl);
  //   }
  //   this.jumpToPage = '';
  // }

  /**
   * UI - Returns the css class name for colouring in the status names
   */
  getStatusClass(state: string): string {
    switch (state) {
      case 'NEW':
        return 'status-box-green';
      case 'ALLOCATED':
        return 'status-box-grey';
      case 'ATTACHED':
        return 'status-box-blue';
      case 'DETACHED':
        return 'status-box-orange';
      case 'RETURNED':
        return 'status-box-yellow';
      case 'PRACTICE':
        return 'status-box-lightblue';
      case 'LOST':
        return 'status-box-red';
      case 'RETURNED_USED':
        return 'status-box-purple';
      default:
        // = 'OTHER'
        return 'status-box-darkgrey';
    }
  }

  /**
   * UI - returns the sum of bands in the bucket
   */
  getBandBucketSum(): number {
    return this.bandsBucket.reduce((acc, obj) => acc + obj.amount, 0);
  }

  /**
   * Reset the search fields
   */
  resetSearchFields(): void {
    // hack: display user name if non admin as I can't pre populate the
    this.searchFields = {
      prefix: 'ALL',
      bandNumberFrom: null,
      bandNumberTo: null,
      prefixNumber: null,
      shortNumber: null,
      status: 'ALL',
      bander: this.person.isAdmin ? null : this.people[0],
      limit: this.limitPerPage,
      paginationToken: this.paginationToken
    };
  }

  /**
   * Loads the next or previous page
   */
  private loadPagination(urlPath: string): void {
    this.isSearching = true;
    this.bandService.getSearchByUrl(urlPath).subscribe(res => {
      this.allBandsRaw = res.bands;
      this.prepareSearchResults(res.bands);
      this.handlePagination(res.pagination);
      this.synchCheckboxes();
      this.isSearching = false;
    });
  }

  /**
   * Removes the duplicate part of the path
   */
  private getSanitisedPath(path: string) {
    return path.substring('/birdbanding/'.length);
  }

  /**
   * Calculations for pagination
   */
  private handlePagination(pagination: Pagination): void {
    this.currentPageUrl = this.getSanitisedPath(pagination.self);
    this.previousPageUrl = this.getSanitisedPath(pagination.prev);
    this.nextPageUrl = this.getSanitisedPath(pagination.next);
    this.isFirstPage = pagination.self === pagination.prev;
    this.isLastPage = pagination.isLastPage;
    if (this.currentPage === 1) {
      this.fromItem = 1;
    } else {
      this.fromItem = this.limitPerPage * (this.currentPage - 1);
    }
    if (this.bandsSize < this.limitPerPage) {
      this.toItem = this.bandsSize;
    } else {
      this.toItem = this.fromItem + this.limitPerPage;
    }
  }

  /**
   * Helper to group the search results for the view
   */
  private prepareSearchResults(res: Band[]) {
    this.bandsSize = res.length;

    this.allBands = [];
    let bb = [];
    let i = 1;
    res.forEach(band => {
      // enrich with user-id

      const pplData = this.people.find(ppl => ppl.id === band.banderId);
      if (pplData) {
        band.userId = pplData.userName;
      }
      bb.push(band);
      i++;
      if (i === 5) {
        this.allBands.push(bb);
        bb = [];
        i = 1;
      }
    });
    if (bb.length !== 0) {
      this.allBands.push(bb);
    }
  }

  /**
   * Pushes a success message to the alert notification TODO: Refactor potential
   */
  private showSuccessNotification(msg: string): void {
    this.alerts.push({
      type: 'success',
      msg,
      timeout: 3000
    });
  }

  /**
   * Closes an alert TODO: Refactor potential
   */
  onClosed(dismissedAlert: any): void {
    this.alerts = this.alerts.filter(alert => alert !== dismissedAlert);
  }
}
