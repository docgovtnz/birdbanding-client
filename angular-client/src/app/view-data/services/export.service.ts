import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigurationService } from '../../services/configuration.service';
import { AdvancedFilterOption, ApiAdvancedSearchBody, FilterOptions } from './event-types';
import { AuthenticationService, PersonIdentity } from '../../authentication/authentication.service';
import { EventDataService } from '../services/event-data.service';
import { buildEventParameters } from './utility/build-event-query';
import { BehaviorSubject, Observable, ReplaySubject, timer } from 'rxjs';
import { isAfter, isBefore, parseISO } from 'date-fns';
import { map } from 'rxjs/operators';
import { isEmpty, isNil, not } from 'ramda';
import { advancedFilterOptionsToApiAdvancedSearch } from './utility/api-event-transformer';

export interface ExportDescription {
  isAvailable: boolean;
  exportId: string;
  downloadStatus: string;
  numberOfRows: number;
  fileSizeKilobytes: number;
  isMoratorium: boolean;
  linkToData: string;
  exportDate: Date;
  approvalRequired: boolean;
  isInProgress: boolean;
  hasError: boolean;
}

interface ApiExportDescription {
  id: string;
  row_creation_timestamp_: string;
  row_update_timestamp_: string;
  download_status: string; // OR REQUEST_PENDING_APPROVAL
  number_of_rows: number;
  file_size_in_bytes: number;
  moratorium_data_included: boolean;
  presigned_url: string;
}

const transformExportDescription = (apiExport: ApiExportDescription): ExportDescription => {
  return {
    exportId: apiExport.id,
    downloadStatus: apiExport.download_status.split('_').join(' '),
    fileSizeKilobytes: apiExport.file_size_in_bytes ? apiExport.file_size_in_bytes / 1000 : undefined,
    isMoratorium: apiExport.moratorium_data_included,
    numberOfRows: apiExport.number_of_rows,
    linkToData: apiExport.presigned_url,
    exportDate: parseISO(apiExport.row_creation_timestamp_),
    isAvailable: apiExport.download_status.includes('AVAILABLE'),
    isInProgress: apiExport.download_status === 'IN_PROGRESS',
    approvalRequired: apiExport.download_status === 'REQUEST_PENDING_APPROVAL',
    hasError: apiExport.download_status === 'DOWNLOAD_FAILED'
  };
};

const sortByExportDate = ({ exportDate: exportDate1 }: ExportDescription, { exportDate: exportDate2 }: ExportDescription): number => {
  if (isBefore(exportDate1, exportDate2)) {
    return 1;
  } else if (isAfter(exportDate1, exportDate2)) {
    return -1;
  } else {
    return 0;
  }
};

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  downloadsSubject: BehaviorSubject<ExportDescription[]> = new BehaviorSubject<ExportDescription[]>([]);

  numberOfDownloads: ReplaySubject<number> = new ReplaySubject<number>();

  readonly baseUri: string;

  private person: PersonIdentity;

  interval = 30000;

  currentTimer = timer(0, this.interval);

  constructor(private http: HttpClient, config: ConfigurationService, authenticationService: AuthenticationService, private eventDataService: EventDataService) {
    this.baseUri = config.getConfig().apiUrl;
    authenticationService.identitySubject.subscribe(identity => {
      this.person = identity;
      this.getAvailableDownloads();
    });

  }

  startPolling() {
    this.currentTimer.subscribe(_ => {
      this.getAvailableDownloads();
    });
  }

  requestDownloadAdvanced(filterOptions: AdvancedFilterOption[]): Observable<ExportDescription> {
    let uri = `${this.baseUri}/banders/${this.person.userId}/event-downloads?exportMode=advanced`;
    const payload = { download_status: 'REQUEST', 'advanced_search': advancedFilterOptionsToApiAdvancedSearch(filterOptions) };
    return this.http.post(uri, payload, this.httpOptions)
      .pipe(map(transformExportDescription));
  }

  requestDownload(filterOptions: FilterOptions): Observable<ExportDescription> {

    let uri = `${this.baseUri}/banders/${this.person.userId}/event-downloads`;
    const queryString = buildEventParameters(filterOptions);
    if (not(isEmpty(queryString))) {
      uri = uri + `?${queryString}`;
    }
    return this.http
      .post(
        uri,
        {
          download_status: 'REQUEST'
        },
        this.httpOptions
      )
      .pipe(map(transformExportDescription));
  }

  startDownLoad(downloadId: string): Observable<ExportDescription> {
    const uri = `${this.baseUri}/banders/${this.person.userId}/event-downloads/${downloadId}`;
    return this.http
      .put(
        uri,
        {
          download_status: 'START'
        },
        this.httpOptions
      )
      .pipe(map(transformExportDescription));
  }

  getAvailableDownloads(): void {
    if (isNil(this.person)) {
      return;
    }
    const uri = `${this.baseUri}/banders/${this.person.userId}/event-downloads`;
    this.http.get(uri).subscribe((response: ApiExportDescription[]) => {
      const exportDescriptions = response
        .filter(dataExport => dataExport.download_status !== 'READY_FOR_DOWNLOAD')
        .map(transformExportDescription);
      exportDescriptions.sort(sortByExportDate);
      this.downloadsSubject.next(exportDescriptions);
      this.numberOfDownloads.next(exportDescriptions.length);
    });
  }
}
