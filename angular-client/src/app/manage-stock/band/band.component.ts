import { Component, Input, OnInit, OnChanges, SimpleChange, SimpleChanges } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { AuthenticationService, PersonIdentity } from '../../authentication/authentication.service';
import { BandsService } from '../services/bands.service';
import { PeopleService } from '../../services/people.service';
import { Band, BandResponse, BandHistoryResponse, History, HistoryView, BandState, SelectableBandStates} from '../model/band';
import { map, mergeMap} from 'rxjs/operators';
import { Observable, throwError, combineLatest, forkJoin} from 'rxjs';
import { BandSearchFields } from '../bander-stock/bander-stock.component'; // @todo move to service
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PeopleData, PersonData } from '../../people/people-data';
import { format, parseISO, parse, formatISO, set, compareDesc } from 'date-fns';

@Component({
  selector: 'app-band',
  templateUrl: './band.component.html',
  styleUrls: ['./band.component.scss', '../manage-stock.component.scss']
})
export class BandComponent implements OnInit {

  alerts: any[] = [];
  dismissible = true;
  loaded = false;
  notFound = true;
  isAdmin = false;
  prefixNumber: string;
  shortNumber: string;
  bandId: string;
  person: PersonIdentity;
  bandHistory: BandHistoryResponse;
  history: HistoryView[];
  people: PeopleData[];
  band: Band;
  searchFields: BandSearchFields = {
      prefix: 'ALL',
      bandNumberFrom: null,
      bandNumberTo: null,
      prefixNumber: null,
      shortNumber: null,
      status: 'ALL',
      bander: null,
      limit: 1,
      paginationToken: 0
  };

  bandState = Object.keys(BandState);
  selectableBandStates = SelectableBandStates;
  undeletableStates = [BandState.NEW, BandState.ATTACHED, BandState.DETACHED];
  // for these states the API will set the bander to the Banding Office
  returnedStates = [BandState.RETURNED, BandState.RETURNED_USED];

  sortUp = true;
  selectMultiple = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthenticationService,
    private bandService: BandsService,
    private peopleService: PeopleService
  ) {
  }

  ngOnInit(): void {
    combineLatest([
      this.route.paramMap.pipe(
        mergeMap(params => {
          this.prefixNumber = params.get('prefixNumber');
          this.shortNumber = params.get('shortNumber');
          this.searchFields.prefixNumber = this.prefixNumber;
          this.searchFields.shortNumber = this.shortNumber;
          return this.bandService.searchBands(this.searchFields);
        }),
        mergeMap(br => {
          if (br.bands.length === 0) {
            this.notFound = true;
            this.loaded = true;
            return throwError('Band not found');
          }
          else {
            this.bandId = br.bands[0].id;
            return this.bandService.getBandById(br.bands[0].id);
          }
        })
      ),
      this.peopleService.getPeople(),
      this.auth.identitySubject]
    ).subscribe(
      resp => {
        let history = Array<History>();
        [{ history, band: this.band }, this.people, this.person] = resp;
        this.isAdmin = this.person.isAdmin;
        this.history = this.makeHistoryViewArray(history);
        this.sort();
        // copy history for reverting
        this.loaded = true;
        this.notFound = true;
      },
      err => {
        this.notFound = true;
        this.loaded = true;
        console.log(err);
    });
  }

  getStatusClass(state: BandState): string {
    switch (state.toString()) {
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

  updateBander(ev, hv: HistoryView) {
    hv.history.banderId = ev.id;
  }

  noBanderSelected(ev, hv: HistoryView) {
    hv.history.banderId = null;
  }

  isValid(h: HistoryView) {
    const errs = Array<string>();
    if (h.history.eventDateObj == null) {
      errs.push('Please select a date');
    }
    if (h.history.eventTime === null || !/^(2[0-3]|[01]?[0-9]):([0-5]?[0-9])$/.test(h.history.eventTime)) {
      errs.push('Time must be in HH:MM format.');
    }
    if (h.history.state === BandState.ALLOCATED || h.history.state === BandState.NEW) {
      if (h.history.banderId === null) {

        errs.push('A bander must be selected for a new or allocated event.');
      }
    }
    h.errorMsg = errs.join(' ');
    return !errs.length;
  }

  updatEventDateTime(h: HistoryView) {
    h.errorMsg = '';
    if (h.history.eventDateObj !== null) {
      // not too much point saving just the time component
      h.history.eventDateObj = parse(h.history.eventTime, 'HH:mm', h.history.eventDateObj);
      h.isSaving = true;
      this.bandService.updateEventTime(h.history.eventId, formatISO(h.history.eventDateObj)).subscribe(
        () => {
          h.isSaving = false;
          h.isFocused = false;
          h.editAllEventMarks = false;
          this.updateMarkDetail();
        },
        () => {
          h.isSaving = false;
          h.errorMsg = 'Falied to save date for this event. ';
        }
      );
    } else {
      h.errorMsg = 'Please select a valid date';
    }
  }

  updateEvent(historyView: HistoryView) {
    if (historyView.editAllEventMarks) {
      this.updatEventDateTime(historyView);
      return;
    }

    if (!this.isValid(historyView)) {
      historyView.isSaving = false;
      return;
    }
    historyView.isSaving = true;

    historyView.history.eventDateObj = parse(historyView.history.eventTime || '00:00' , 'HH:mm', historyView.history.eventDateObj);
    const saveFunc = (historyView.history.eventId) ? this.bandService.branchBandHistory : this.bandService.addBandHistory;

    saveFunc.call(this.bandService, historyView.history, this.band.id).subscribe(
      rec => {
        historyView.originalHistory = { ...rec };
        historyView.history = rec;
        this.updateMarkDetail();
        historyView.isSaving = false;
        historyView.isFocused = false;
      },

      err => {
        if (err.errors) {
          historyView.errorMsg = err.errors.map(e => e.message).join('. ');
        }
        else if (err.error?.details) {
          historyView.errorMsg = err.error.details.map(e => e.message).join('. ');
        }
        historyView.isSaving = false;
        throw new Error(err);
      }
  );
  }

  deleteEvent(h: HistoryView, idx: number) {
    if (!h.history.eventId/*is new*/) {
      this.cancel(idx);
      return;
    }
    h.isSaving = true;
    this.bandService.deleteBandHistory(h.history).subscribe(
      resp => {
        const index = this.history.findIndex(his => his === h);
        this.history.splice(index, 1);
        this.updateMarkDetail();
      },
      err => {
        h.errorMsg = 'Delete failed.';
        h.isSaving = false;
        console.dir(err);
      }
    );
  }

  updateMarkDetail() {
    this.bandService.getBandById(this.bandId).subscribe(resp => this.band = resp.band);
  }

  addBlankEvent() {
    const historyView: HistoryView =
    {
      history:
      {
        markId: null,
        banderId: null,
        eventId: null,
        eventDate: null,
        eventTime: '00:00',
        state: null,
        distinctPrefixNumbers: null,
        markCount: null,
        isMultipleBands: false,
        bandPrefixes: []
      },
      originalHistory: null,
      isDelete: false,
      isFocused: true,
      isSaving: false,
      errorMsg: null,
      isEditable: true,
      isStateEditable: true,
      editAllEventMarks: false
    };

    historyView.originalHistory = Object.assign({}, historyView.history);
    this.history.push(historyView);
  }

  isDeletable(h: History) {
    return !this.undeletableStates.includes(h.state);
  }

  isStateEditable(bs: BandState) {
    return this.selectableBandStates.includes(bs) || bs === null;
  }

  cancel(idx: number, event?) {
    if (event){
      event.stopPropagation();
    }
    const hv = this.history[idx];
    hv.errorMsg = null;
    if (hv.history.eventId) {
      this.revertHistory(hv);
      this.history[idx] = hv;
      this.history[idx].isFocused = false;
    }
    else {
      this.history.splice(idx, 1);
    }
  }

  needsBander(state: BandState) {
    return state === BandState.NEW || state === BandState.ALLOCATED;
  }

  isBanderEditable(hv: HistoryView) {
    return hv.isEditable && !this.returnedStates.includes(hv.history.state);
  }

  getBanderText(hv: HistoryView) {
    if (this.returnedStates.includes(hv.history.state)) {
      return 'Banding office';
    }
    else if (hv.history.banderId === null) {
      return '-';
    }
    else {
      return hv.history.banderName;
    }
  }

  onClosed(dismissedAlert: any): void {
    this.alerts = this.alerts.filter(alert => alert !== dismissedAlert);
  }

  revertHistory(hv: HistoryView) {
    hv.history = hv.originalHistory;
    hv.originalHistory = Object.assign({}, hv.history);
  }

  makeHistoryView(h: History): HistoryView {
     return {
        history: h,
        originalHistory: Object.assign({}, h),
        isFocused: false,
        isSaving: false,
        isDelete: false,
        isEditable: ![BandState.ATTACHED, BandState.DETACHED].includes(h.state) && this.isAdmin,
        errorMsg: null,
        isStateEditable: this.selectableBandStates.includes(h.state),
        editAllEventMarks: false
    };
  }

  makeHistoryViewArray(history: History[]): HistoryView[] {
    return history.map(this.makeHistoryView, this);
  }

  sort() {
    this.sortUp = !this.sortUp;
    return this.history.sort((hv1, hv2) => {
      return compareDesc(hv1.history.eventDateObj, hv2.history.eventDateObj) * (this.sortUp ? -1 : 1);
    });
  }

  focus(h: HistoryView) {
    if (!h.isFocused && h.isEditable) {
      h.isFocused = true;
    }
  }

}



