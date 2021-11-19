import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { Band, BandResponse, BandHistoryResponse, History, BandState} from '../model/band';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { ConfigurationService } from '../../services/configuration.service';
import { map } from 'rxjs/operators';
import { BandSearchFields } from '../bander-stock/bander-stock.component';
import { format, parseISO, parse, formatISO, set, compareDesc } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class BandsService {
  constructor(private config: ConfigurationService, private http: HttpClient) {}

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  getBandById(markId: string): Observable<BandHistoryResponse> {
    return this.http.get<Response>(`${this.config.getConfig().apiUrl}/marks/${markId}/`, this.httpOptions).pipe(
    map((response: any) => {
        return apiToBandHistoryResponse(response);
      })
    );
  }

  addBandHistory(bandHistory: History, markId: string): Observable<History> {
    return this.http.post<any>(
      `${this.config.getConfig().apiUrl}/mark-events-batch/`,
      addBandEventToApi(bandHistory, markId),
      this.httpOptions)
    .pipe(map(resp => apiPostToHistoryResponse(resp)));
  }

  // @todo: merge addBandHistory methods?
  addBandHistoryMultiple(eventBanderId: string, eventDate: Date, eventTime: string, state: BandState, marks: Band[]): Observable<any> {
    return this.http.post<any>(
      `${this.config.getConfig().apiUrl}/mark-events-batch/`,
      addBandEventBatchToApi(eventBanderId, eventDate, eventTime, state, marks.map(m => m.id)),
      this.httpOptions
    );
  }

  /**
   * Updates a mark's history by creating a new, different event for it
   */
  branchBandHistory(bandHistory: History, markId: string): Observable<History> {
    return this.http.put<any>(
      `${this.config.getConfig().apiUrl}/mark-events/${bandHistory.eventId}/`,
      bandHistoryToApi(bandHistory, markId),
      this.httpOptions)
    .pipe(map(resp => apiPutToHistoryResponse(resp)) );
  }

  deleteBandHistory(bandHistory: History): Observable<BandHistoryResponse> {
    return this.http.delete<BandHistoryResponse>(`${this.config.getConfig().apiUrl}/mark-events/${bandHistory.eventId}/`, this.httpOptions);
  }

  /**
   * Update an event's time
   *
   */
  updateEventTime(eventId, eventTimestamp) {
    return this.http.put<any>(
      `${this.config.getConfig().apiUrl}/mark-events-batch/${eventId}`,
      { event_timestamp: eventTimestamp },
      this.httpOptions);
  }

  /**
   * Sends a GET to API with query parameters according to the given
   * search fields. If search is omitted it will request all bands
   */
  searchBands(search: BandSearchFields): Observable<BandResponse> {
    let query = '';
    if (search) {
      if (search.bander) {
        query = addToQuery(query, 'banderId', search.bander.id);
      }
      if (search.prefix && search.prefix !== 'ALL') {
        query = addToQuery(query, 'prefixNumber', search.prefix);
      }
      if (search.bandNumberFrom) {
        query = addToQuery(query, 'shortNumberFrom', search.bandNumberFrom);
      }
      if (search.bandNumberTo) {
        query = addToQuery(query, 'shortNumberTo', search.bandNumberTo);
      }
      if (search.prefixNumber) {
        query = addToQuery(query, 'prefixNumber', search.prefixNumber);
      }
      if (search.shortNumber) {
        query = addToQuery(query, 'shortNumber', search.shortNumber);
      }
      if (search.status && search.status !== 'ALL') {
        query = addToQuery(query, 'markState', search.status);
      }
      // query = addToQuery(query, 'limit', search.limit.toString(10)); No limit yet
      if (search.paginationToken !== 0) {
        query = addToQuery(query, 'paginationToken', search.paginationToken.toString(10));
      }
    }
    return this.http.get(`${this.config.getConfig().apiUrl}/marks${query}`, this.httpOptions).pipe(
      map((response: any) => {
        return apiToBandResponse(response);
      })
    );
  }

  /**
   * Submits a band search request
   */
  getSearchByUrl(urlPath: string): Observable<BandResponse> {
    return this.http.get(`${this.config.getConfig().apiUrl}/${urlPath}`, this.httpOptions).pipe(
      map((response: any) => {
        return apiToBandResponse(response);
      })
    );
  }

  /**
   * Returns a summary list of bands from the API. Will return the summary of a
   * particular user if a banderId is given
   */
  getBandSummary(banderId?: string): Observable<Band[]> {
    let query = '?format=summary';
    if (banderId) {
      query += '&banderId=' + banderId;
    }
    return this.http.get(`${this.config.getConfig().apiUrl}/marks${query}`, this.httpOptions).pipe(
      map((response: any) => {
        return apiToBands(response);
      })
    );
  }

  /**
   * Transfers the bands to the recipient.
   */
  transferBands(recipientId: string, transferDate: Date, bands: Band[]): Observable<any> {
    return this.http.post(`${this.config.getConfig().apiUrl}/event-transfers`,
      transferToApi(recipientId, transferDate, bands), this.httpOptions);
  }

  /**
   * Sends bands for deletion to the API (only bands with status NEW, transfers the IDs only)
   */
  deleteBands(bandsToDelete: Band[]): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify(deleteBandsToApi(bandsToDelete))
    };
    return this.http.delete(`${this.config.getConfig().apiUrl}/marks?format=batch`, options);
  }

  /**
   * Changes the status of the band
   */
  changeStatus(band: Band, status: string): Observable<any> {
    return this.http.put(
      `${this.config.getConfig().apiUrl}/marks/${band.id}?component=markState`,
      '{"state": "' + status + '"}',
      this.httpOptions
    );
  }

  /**
   * Adds a range of bands. first till last number needs to b unique
   */
  addBands(prefix: string, firstNumber: string, lastNumber: string): Observable<any> {
    return this.http.post(
      `${this.config.getConfig().apiUrl}/marks?format=range`,
      JSON.stringify(addBandsToApi(prefix, firstNumber, lastNumber)),
      this.httpOptions
    );
  }
}

/**
 * Helper to assemble a query string
 */
const addToQuery = (query: string, key: string, value: string): string => {
  if (query.length === 0) {
    query += '?';
  } else {
    query += '&';
  }
  return `${query}${key}=${value}`;
};

const apiToBands = (res: any): Band[] => {
  const bands: Band[] = [];
  res.forEach(band =>
    bands.push({
      id: band.id,
      bandPrefix: band.prefix_number.toUpperCase(),
      noOfBands: parseInt(band.number_of_bands, 10),
      lastBandNo: band.last_short_number,
      isBandEdit: false
    })
  );
  return bands;
};

const apiToBandResponse = (res: any): BandResponse => {
  const bands: Band[] = [];
  res.data.forEach(band =>
    bands.push({
      id: band.id,
      bandPrefix: band.prefix_number.toUpperCase(),
      lastBandNo: band.short_number,
      state: band.state,
      banderName: band.person_name,
      banderId: band.bander_id,
      bandAssignDate: (band.event_timestamp) ? format(parseISO(band.event_timestamp), 'yyyy-MM-dd') : '',
      isBandEdit: false
    })
  );
  return {
    bands,
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


const apiToBandHistoryResponse = (res: any): BandHistoryResponse => {
  const band: Band =
  {
    banderId: res.bander_id,
    banderName: res.person_name,
    id: res.id,
    bandPrefix: res.prefix_number,
    lastBandNo: res.short_number,
    state: res.state,
    bandAssignDate: (res.event_timestamp) ? format(parseISO(res.event_timestamp), 'dd/MM/yyyy') : '',
    nzbbsCertificationNumber: res.nzbbs_certification_number,
    checkBanderId: res.check_bander_id,
    checkMarkState: res.check_mark_state,
    checkMarkEventId: res.check_mark_event_id
  };

  const history = Array<History>();
  res.mark_history.forEach(m => {
    const h: History = {
      markId: m.markId,
      banderId: m.bander_id,
      banderName: m.person_name,
      distinctPrefixNumbers: m.distinct_prefix_numbers,
      eventDate: format(parseISO(m.event_timestamp), 'dd/MM/yyyy'),
      eventTime: format(parseISO( m.event_timestamp), 'HH:mm'),
      eventDateObj: set(parseISO(m.event_timestamp), { seconds:0, milliseconds: 0}),
      eventId: m.event_id,
      markCount: m.mark_count,
      state: m.state,
      isMultipleBands: m.is_multiple_bands,
      bandPrefixes: m.distinct_prefix_numbers.split(',')
    };
    history.unshift(h);
  });
  return {band, history} as BandHistoryResponse;
};

const bandHistoryToApi = (history: History, markId: string) => {
  const eventTimestamp = formatISO(history.eventDateObj);
  return {
    bander_id: history.banderId || null,
    event_timestamp: eventTimestamp,
    state: history.state,
    mark_id: markId
  };
};

const apiPutToHistoryResponse = ({ data: { vw_mark_event_summary: summary, ...fields } }): History => {
  return  {
    markId: fields.mark_id,
    eventDateObj: set(parseISO(fields.event_timestamp), { milliseconds: 0}),
    eventDate: format(parseISO(fields.event_timestamp), 'dd/MM/yyyy'),
    eventTime: format(parseISO(fields.event_timestamp), 'HH:mm'),
    banderId: fields.bander_id,
    state: fields.state as BandState,
    isMultipleBands: summary.is_multiple_bands,
    bandPrefixes: summary.distinct_prefix_numbers.split(','),
    markCount: summary.mark_count,
    eventId: fields.id
  };
};

const apiPostToHistoryResponse = ({ event, mark_allocation, mark_state }): History => {
  const markState = mark_state[0];
  return {
    markId: markState.mark_id,
    eventDateObj: set(parseISO(event.event_timestamp), { milliseconds: 0}),
    eventDate: format(parseISO(event.event_timestamp), 'dd/MM/yyyy'),
    eventTime: format(parseISO(event.event_timestamp), 'HH:mm'),
    banderId: mark_allocation?.bander_id,
    state: markState.state as BandState,
    isMultipleBands: false,
    bandPrefixes: [],
    markCount: 1,
    eventId: event.id
  };
};

const transferToApi = (toId: string, transferDate: Date, bands: Band[]) => {
  return {
    transfer_recipient_id: toId,
    event_date: (transferDate) ? format(transferDate, 'yyyy-MM-dd') : null,
    marks: bands.map(band => band.id)
  };
};

const deleteBandsToApi = (bandsToDelete: Band[]): string[] => {
  return bandsToDelete.map(b => b.id);
};

const addBandEventBatchToApi = (eventBanderId: string, eventDate: Date, eventTime: string, state: BandState, marks: string[]) => {
   return {
    bander_id: eventBanderId,
    event_timestamp: formatISO(parse(`${eventTime}`, 'HH:mm', eventDate)),
    mark_state: state,
    marks
  };
};


const addBandEventToApi = (history: History, markId: string) => {
  return {
    event_timestamp: formatISO(history.eventDateObj),
    bander_id: history.banderId,
    mark_state: history.state,
    marks: [
      markId
    ]
  };
};


// need string.toString() for firstNUmber is a Number in UI. Typescript eyewash doesn't help here
const addBandsToApi = (prefix: string, firstNumber: string, lastNumber: string) => {
  return {
    prefix_number: prefix,
    first_short_number: firstNumber.toString(),
    last_short_number: lastNumber
  };
};



