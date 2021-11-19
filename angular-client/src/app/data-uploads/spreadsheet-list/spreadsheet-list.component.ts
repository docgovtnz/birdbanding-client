import { Component, OnInit, Input, Output } from '@angular/core';
import { AuthenticationService, PersonIdentity } from '../../authentication/authentication.service';
import { ApiSpreadsheetDetail as SpreadsheetDetail, UPLOAD_STATUS} from '../services/data-upload-types';
import { SpreadsheetUploadService } from '../services/spreadsheet-upload.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { IdDisplay } from '../../services/reference-data.service';


interface SSListItem {
  updating: boolean;
  isNew?: boolean;
  ssDetail: SpreadsheetDetail;
  normalizedProjectName: string;
  normalizedBanderName: string;

}

@Component({
  selector: 'app-spreadsheet-list',
  templateUrl: './spreadsheet-list.component.html',
  styleUrls: ['./spreadsheet-list.component.scss'],
  animations: [
    trigger('listAdd', [
      state('added', style({ backgroundColor: '*' })),
      transition('void => added', [style({ backgroundColor: 'lemonchiffon' }), animate(1000)]),
      transition('void => *', [])
    ])]
})
export class SpreadsheetListComponent implements OnInit {

  spreadsheets: SSListItem[] = [];

  loading = true;
  searchTerm = '';
  statusFilters: IdDisplay[] = [];
  beforeDate: Date;
  afterDate: Date;


  person: PersonIdentity;
  loadedAuth = false;

  statusOptions: IdDisplay[] = Object.entries(this.uploadService.states).map(rec => ({ id: rec[0], display: rec[1] }));

  getStatusClass(uploadStatus) {
    return this.uploadService.statusClasses[uploadStatus];
  }

  constructor(
    private uploadService: SpreadsheetUploadService,
    private auth: AuthenticationService
  ) { }

  ngOnInit(): void {
    this.auth.identitySubject.subscribe(ident => {
      this.person = ident;
      this.loadedAuth = true;
    });

    this.uploadService.listSpreadsheets().subscribe(ssList => {
      this.spreadsheets = ssList.data.map(ss => this.wrapInListItem(ss));
      this.loading = false;
    });

    this.uploadService.spreadsheetNew.subscribe(ss => this.addSpreadsheetRecord(ss));

    this.uploadService.spreadsheetStatusChange.subscribe(ss => this.updateStatus(ss));
  }

  wrapInListItem(ss: SpreadsheetDetail): SSListItem {
    return {
      ssDetail: ss,
      updating: false,
      isNew: false,
      normalizedProjectName: ss.project_name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
      normalizedBanderName: ss.bander_name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    };
  }

  updateStatus(statusChange: [SpreadsheetDetail, SpreadsheetDetail]) {
    const [old, nu] = statusChange;
    const ss = this.spreadsheets.find(s => s.ssDetail.id === old.id);
    if (ss) {
      ss.ssDetail = nu;
      ss.updating = false;
    }
  }

  addSpreadsheetRecord(spreadsheetDetail: SpreadsheetDetail): void {
    console.log('Adding new spreadsheet');
    const ss = this.wrapInListItem(spreadsheetDetail);
    ss.updating = this.uploadService.isTransitoryState(ss.ssDetail);
    this.spreadsheets.splice(0, 0, ss);
    ss.isNew = true;
  }

  formatErrorCount(ssListItem: SSListItem) {
    return `${ssListItem.ssDetail.criticals_count} errors, ${ssListItem.ssDetail.warnings_count} warnings`;
  }

  getReadableState(us: UPLOAD_STATUS) {
    return this.uploadService.getReadableState(us);
  }

  get isAdmin() {
    return this.person.role === 'admin';
  }

  // datepicker/Date obj seems to return date with current time. Can't find where to fix that
  processDate(date: Date): Date {
    const d: Date = new Date(date);
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);
    return d;
  }

  isVisible(ssListItem: SSListItem) {
    const ss = ssListItem.ssDetail;
    if (this.statusFilters.length) {
      if (!this.statusFilters.find(s => ss.upload_status === s.id)) {
        return false;
      }
    }

    if (this.beforeDate) {
      const beforeDate = this.processDate(this.beforeDate);
      if (beforeDate.toJSON() > ss.created_datetime) {
        return false;
      }
    }

    if (this.afterDate) {
      const afterDate = this.processDate(this.afterDate);
      afterDate.setDate(afterDate.getDate() + 1);
      if (afterDate.toJSON() < ss.created_datetime) {
        return false;
      }
    }

    const searchTerm = this.searchTerm.toLowerCase();
    if (searchTerm.length > 3) {
      const normTerm = searchTerm.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (!ssListItem.normalizedProjectName.includes(normTerm) &&
        !ssListItem.normalizedBanderName.includes(normTerm)) {
        return false;
      }
    }
    return true;
  }


}

