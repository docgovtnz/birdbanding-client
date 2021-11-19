import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { parseISO } from 'date-fns';

import { BandTransfer, BandTransferResponse, TransferBand } from '../model/band-transfer';
import { ConfigurationService } from '../../services/configuration.service';
import { LoggingService } from '../../services/logging.service';

@Injectable({
  providedIn: 'root'
})
export class BandTransferService {
  private readonly baseUrl: string;
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private config: ConfigurationService, private logService: LoggingService, private httpClient: HttpClient) {
    this.baseUrl = config.getConfig().apiUrl;
  }

  /**
   * Returns an object containing all transfers and pagination information
   */
  getBandTransfers(path: string): Observable<BandTransferResponse> {
    return this.httpClient.get(`${this.baseUrl}/${path}`, this.httpOptions).pipe(map(transfers => apiToTransfers(transfers)));
  }

  /**
   * Returns the transfer information for a given transfer-id
   */
  getBandTransfer(transferId: string): Observable<TransferBand[]> {
    return this.httpClient
      .get(`${this.baseUrl}/event-transfers/${transferId}`, this.httpOptions)
      .pipe(map(data => apiToTransferredBands(data)));
  }

  /**
   * Returns a list of the latest Band transfers
   */
  getLatestBandTransfers(): Observable<BandTransferResponse> {
    return this.httpClient
      .get(`${this.baseUrl}/event-transfers?limit=10`, this.httpOptions)
      .pipe(map(transfers => apiToTransfers(transfers)));
  }
}

const apiToTransfers = (res: any): BandTransferResponse => {
  const transfers: BandTransfer[] = [];
  res.data.forEach(trf =>
    transfers.push({
      transferId: trf.event.id,
      transferFromUserId: trf.event_provider.id,
      transferFromUserName: trf.event_provider.person_name,
      transferFromMaxCert: trf.event_provider.maximum_certification_level,
      transferToUserId: trf.transfer_recipient.id,
      transferToUserName: trf.transfer_recipient.person_name,
      transferToMaxCert: trf.transfer_recipient.maximum_certification_level,
      transferDate: trf.event.event_timestamp ? parseISO(trf.event.event_timestamp) : null,
      amount: trf.mark_allocation_count,
      isTransferView: false
    })
  );
  return {
    transfers,
    pagination: {
      self: res.links.self.href,
      prev: res.links.prev.href,
      next: res.links.next.href,
      pageCount: res.links.pageCount,
      count: res.links.count,
      countFromPageToEnd: res.links.countFromPageToEnd,
      isLastPage: res.links.isLastPage
    }
  };
};

const apiToTransferredBands = (res: any): TransferBand[] => {
  const transferred: TransferBand[] = [];
  if (res.mark_aggregation) {
    res.mark_aggregation.forEach(item =>
      transferred.push({
        prefix: item.prefix_number.toUpperCase(),
        amount: item.number_of_marks,
        minShortNumber: item.min_short_number,
        maxShortNumber: item.max_short_number
      })
    );
  }
  return transferred;
};
