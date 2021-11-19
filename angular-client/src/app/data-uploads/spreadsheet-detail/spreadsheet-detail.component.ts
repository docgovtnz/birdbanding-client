import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PreviousRouteService } from '../../services/previous-route.service';
import { SpreadsheetUploadService } from '../services/spreadsheet-upload.service';
import { ApiSpreadsheetDetail as SpreadsheetDetail, UPLOAD_STATUS, SpreadsheetError } from '../services/data-upload-types';
import { csvGenerator } from '../../common/csv/csv-generator';
import { AuthenticationService, PersonIdentity } from '../../authentication/authentication.service';


@Component({
  selector: 'app-spreadsheet-detail',
  templateUrl: './spreadsheet-detail.component.html',
  styleUrls: ['./spreadsheet-detail.component.scss']
})
export class SpreadsheetDetailComponent implements OnInit {

  ssDetail: SpreadsheetDetail;
  loading = true;
  updatingStatus = false;
  deleted = false;
  processedErrors: any;
  person: PersonIdentity;
  loadedAuth = false;

  constructor(
    private previousRouteService: PreviousRouteService,
    private route: ActivatedRoute,
    private router: Router,
    public uploadService: SpreadsheetUploadService,
    private auth: AuthenticationService

  ) {

  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(async (params) => {
      this.ssDetail = await this.uploadService.getSpreadsheetById(params.get('spreadsheetId'));
      this.processedErrors = this.uploadService.processErrors(this.ssDetail.errors);
      this.loading = false;
    });

    this.uploadService.spreadsheetStatusChange.subscribe(ss => this.onStatusChange(ss));

    this.auth.identitySubject.subscribe(ident => {
      this.person = ident;
      this.loadedAuth = true;
    });
  }

  downloadCSV(errors: SpreadsheetError[]) {
    errors.forEach(e => {
      const separatorIdx = e.property.indexOf(',');
      e.lineNumber = parseInt(e.property.slice(0, separatorIdx), 10);
      e.field = e.property.slice(separatorIdx + 1);
    });
    const headers = {
      code: 'Code',
      type: 'Type',
      value: 'Value',
      keyword: 'Keyword',
      message: 'Message',
      lineNumber: 'Line number',
      field: 'Column name',
      severity: 'Severity'
    };
    const filePrefix = 'banding-upload-errors_';
    csvGenerator(headers, filePrefix, errors);
  }

  goBack() {
    const previousRoute = this.previousRouteService.getPreviousRoute('/data-uploads/upload-spreadsheet');
    this.router.navigate([previousRoute]);
  }

  get isUserAdmin(): boolean {
    return this.person.role === 'admin';
  }

  get isUserDeleter(): boolean {
    return this.isUserAdmin || this.person.userId === this.ssDetail.bander_id;
  }

  async changeStatus(status: UPLOAD_STATUS) {
    this.updatingStatus = true;
    await this.uploadService.updateSpreadsheetState(this.ssDetail, status);
    if (status === 'PENDING_RESULT') {
      this.ssDetail.upload_status = 'PENDING_RESULT';
    }
    this.uploadService.pollForStatusChange(this.ssDetail);
  }

  onStatusChange(sheets: [SpreadsheetDetail, SpreadsheetDetail]) {
    const [old, nu] = sheets;
    console.log(`Detail component: ${old.upload_status}-->${nu.upload_status}`);
    if (this.uploadService.isTransitoryState(nu)) {
      this.uploadService.pollForStatusChange(nu);
    }
    else {
      this.ssDetail = nu;
      this.updatingStatus = false;
      if (!this.uploadService.isPostApprovalState(nu)) {
        this.processedErrors = this.uploadService.processErrors(nu.errors);
      }
    }
  }

  delete() {
    try {
      this.uploadService.deleteSpreadsheet(this.ssDetail.id);
      this.deleted = true;
    }
    catch (e) {
      console.error(`Error deleting ${this.ssDetail.id}`);
    }
  }

  getValidationClass(): UPLOAD_STATUS {
    return {
      PASS: 'valid-sphere',
      CRITICALS: 'error-sphere',
      WARNINGS_AND_CRITICALS: 'error-sphere',
      PROCESS_ERROR: 'error-sphere',
      WARNINGS: 'warning-sphere',
      PASS_FILE_FORMAT: 'gray-sphere',
      PENDING_RESULT : 'gray-sphere'
    }[this.ssDetail.upload_status] || 'valid-sphere';
  }

  getApprovalClass(): UPLOAD_STATUS {
    return {
      REQUEST_FOR_APPROVAL: 'valid-sphere',
      ADMIN_REJECTED: 'valid-sphere',
      ADMIN_APPROVED: 'valid-sphere',
      PUSHED_TO_DATABASE: 'valid-sphere'
    }[this.ssDetail.upload_status];
  }

  getAddedClass(): UPLOAD_STATUS {
    return {
      ADMIN_REJECTED: 'error-sphere',
      PUSHED_TO_DATABASE: 'valid-sphere'
    }[this.ssDetail.upload_status];
  }
}
