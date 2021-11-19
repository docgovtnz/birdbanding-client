import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigurationService } from '../../services/configuration.service';
import { LoggingService } from '../../services/logging.service';
import { Observable, interval } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  PresignedUrlResponse,
  ApiSpreadsheetRecord as SpreadsheetRecord,
  ApiSpreadsheetDetail as SpreadsheetDetail,
  ApiSpreadsheetList as SpreadsheetList,
  Message,
  SpreadsheetError,
  UPLOAD_STATUS
} from '../services/data-upload-types';


@Injectable({
  providedIn: 'root'
})
export class SpreadsheetUploadService {

  baseUri: string;

  private errorStates: UPLOAD_STATUS[] = ['CRITICALS', 'WARNINGS_AND_CRITICALS'];
  private passStates: UPLOAD_STATUS[] = ['PASS'];
  private submittableStates: UPLOAD_STATUS[] = ['PASS', 'WARNINGS'];
  private unsubmittableStates: UPLOAD_STATUS[] = ['CRITICALS', 'WARNINGS_AND_CRITICALS'];
  private approvableStates: UPLOAD_STATUS[] = ['REQUEST_FOR_APPROVAL'];
  private rejectedStates: UPLOAD_STATUS[] = ['ADMIN_REJECTED'];
  private approvedStates: UPLOAD_STATUS[] = ['ADMIN_APPROVED'];
  private postApprovalStates: UPLOAD_STATUS[] = ['ADMIN_APPROVED', 'ADMIN_REJECTED'];

  transitoryStates = {
    PASS_FILE_FORMAT: 'File format correct',
    PENDING_RESULT: 'Validating...',
    ADMIN_APPROVED: 'Adding to db...'
  };

  states = {
    WARNINGS: 'Warnings',
    CRITICALS: 'Errors',
    WARNINGS_AND_CRITICALS: 'Warnings and errors',
    PASS: 'Ready',
    PUSHED_TO_DATABASE: 'Added to database',
    PROCESS_ERROR: 'Unexpected error',
    REQUEST_FOR_APPROVAL: 'Awaiting approval',
    ADMIN_REJECTED: 'Rejected by admin'
  };


  getReadableState = (() => {
    return (status) => ({ ...this.transitoryStates, ...this.states })[status];
  })();

  isTransitoryState = SpreadsheetUploadService.checkState(Object.keys(this.transitoryStates) as UPLOAD_STATUS[]);
  isErrorState = SpreadsheetUploadService.checkState(this.errorStates);
  isSubmittableState =  SpreadsheetUploadService.checkState(this.submittableStates);
  isPassState = SpreadsheetUploadService.checkState(this.passStates);
  isUnsubmittableState = SpreadsheetUploadService.checkState(this.unsubmittableStates);
  isApprovableState = SpreadsheetUploadService.checkState(this.approvableStates);
  isRejectedState = SpreadsheetUploadService.checkState(this.rejectedStates);
  isApprovedState = SpreadsheetUploadService.checkState(this.approvedStates);
  isPostApprovalState = SpreadsheetUploadService.checkState(this.postApprovalStates);

   statusClasses = {
    PASS: 'status-green',
    PUSHED_TO_DATABASE: 'status-green',
    REQUEST_FOR_APPROVAL: 'status-green',
    WARNINGS: 'status-grey',
    WARNINGS_AND_CRITICALS: 'status-orange',
    PROCESS_ERROR: 'status-orange',
    CRITICALS: 'status-orange',
    ADMIN_REJECTED: 'status-orange',
    CRITICAL_FILE_FORMAT: 'status-orange',
    DEFUNCT: 'status-orange'
  };



  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient, private loggingService: LoggingService, config: ConfigurationService) {
    this.baseUri = config.getConfig().apiUrl;
  }

  @Output() spreadsheetNew: EventEmitter<SpreadsheetDetail> = new EventEmitter();
  @Output() spreadsheetStatusChange: EventEmitter<[
    SpreadsheetDetail,
    SpreadsheetDetail
  ]> = new EventEmitter();
  @Output() spreadsheetDelete: EventEmitter<number> = new EventEmitter();

  static checkState = (statuses: UPLOAD_STATUS[]) => {
    const states = statuses;
    return (ssDetail: SpreadsheetDetail): boolean => {
      return states.includes(ssDetail.upload_status);
    };
  }

  addNewSpreadsheet(spreadsheetDetail: SpreadsheetDetail) {
    this.spreadsheetNew.emit(spreadsheetDetail);
  }

  getPresignedUrl(ss: SpreadsheetRecord) {
    return this.http.post<PresignedUrlResponse>(
      `${this.baseUri}/projects/${ss.project_id}/event-spreadsheet?presignedUrl=true`,
      {
        file_size_in_bytes: ss.file_size_in_bytes,
        object_path: ss.object_path,
        bander_id: ss.bander_id,
        upload_status: ss.upload_status
      },
      this.httpOptions
    ).toPromise<PresignedUrlResponse>();
  }

  postSSData(ssMetaDataPayload: SpreadsheetRecord) {
    return this.http.post<SpreadsheetDetail>(
      `${this.baseUri}/projects/${ssMetaDataPayload.project_id}/event-spreadsheet/`,
      ssMetaDataPayload,
      this.httpOptions
    ).toPromise();
  }

  putFile(url, fileContent) {
    return this.http.put(url, fileContent, this.httpOptions).toPromise();
  }

  listSpreadsheets(): Observable<SpreadsheetList> {
    return this.http.get<SpreadsheetList>(
      `${this.baseUri}/event-spreadsheets/`,
      this.httpOptions
    );
  }

    /*
    @todo make APIs return project and bander readable names
  */
  async updateSpreadsheetState(ss: SpreadsheetDetail, newState: UPLOAD_STATUS) {
    const resp = await this.http.patch<SpreadsheetDetail>(
      `${this.baseUri}/event-spreadsheets/${ss.id}/`,
      {
        upload_status: newState
      },
      this.httpOptions
    ).toPromise();
    return resp;
  }

  async getSpreadsheetById(spreadsheetId: string) {
    const ssDetail: SpreadsheetDetail = await this.http.get<SpreadsheetDetail>(
      `${this.baseUri}/event-spreadsheets/${spreadsheetId}/`,
      this.httpOptions
    ).toPromise<SpreadsheetDetail>();
    return ssDetail;
  }

  deleteSpreadsheet(spreadsheetId: string) {
    return this.http.delete(
      `${this.baseUri}/event-spreadsheets/${spreadsheetId}/`,
        this.httpOptions
    ).toPromise();
  }

  async pollForStatusChange(spreadsheet: SpreadsheetDetail, timeoutMillis: number = 300_000, intervalMillis: number = 7_000) {
    const currStatus = spreadsheet.upload_status;
    const delay = (millis: number) => new Promise(resolve => setTimeout(resolve, millis));
    const poll = async (countDown: number = timeoutMillis) => {
      const newSheet: SpreadsheetDetail = await this.http.get<SpreadsheetDetail>(
        `${this.baseUri}/event-spreadsheets/${spreadsheet.id}/`,
        this.httpOptions
      ).toPromise();
      console.log(`Curr status: ${currStatus} spreadsheet.upload_status" ${spreadsheet.upload_status}`);
      if (currStatus !== newSheet.upload_status) {
        const returnTuple: [SpreadsheetDetail, SpreadsheetDetail] = [spreadsheet, newSheet];
        this.spreadsheetStatusChange.emit(returnTuple);
      }
      else if (timeoutMillis - intervalMillis > 0){
        delay(intervalMillis);
        poll(timeoutMillis - intervalMillis);
      }
      else{
        throw Error(`Polling for status change for sheet ${spreadsheet.id} timed out`);
      }
    };
    poll(timeoutMillis);
  }

  processErrors(errors: SpreadsheetError[]): Map<number, SpreadsheetError[]> {
    const errorsByRowNo: Map<number, SpreadsheetError[]> = new Map();
    for (const e of errors) {
      const separatorIdx = e.property.indexOf(',');
      if (separatorIdx !== -1) {
        const lineNumber = parseInt(e.property.slice(0, separatorIdx), 10) || -1;
        e.field = e.property.slice(separatorIdx + 1);
        if (errorsByRowNo.has(lineNumber)) {
          const tmp = errorsByRowNo.get(lineNumber);
          tmp.push(e);
          errorsByRowNo.set(lineNumber, tmp);
        } else {
          errorsByRowNo.set(lineNumber, [e]);
        }
      }
      else {
        console.error('property field contains no comma');
      }
    }
    return errorsByRowNo;
  }





  }



