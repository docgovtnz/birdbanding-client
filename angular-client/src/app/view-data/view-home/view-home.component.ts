import { Component, OnDestroy, OnInit } from '@angular/core';
import { EventData } from '../services/event-types';
import { SearchDataService, SearchDataResult } from '../services/search-data.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { EVENT_CODES, ReferenceDataService } from '../../services/reference-data.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-view-data',
  templateUrl: './view-home.component.html',
  styleUrls: ['./view-home.component.scss'],
})
export class ViewHomeComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();

  isLoading: boolean;

  hasResultsToDisplay: boolean;

  events: EventData[];

  isFirstPage: boolean;

  isLastPage: boolean;

  eventCodes = EVENT_CODES;
  eventCodeState: boolean[] = [];

  // pagination
  limitPerPage: number;

  constructor(private searchDataService: SearchDataService) {}

  ngOnInit() {
    this.eventCodeState = Array(this.eventCodes.length).fill(true);
    this.searchDataService.hasSearchToDisplayBehaviour.pipe(takeUntil(this.destroy$)).subscribe((hasSearchToDisplay: boolean) => {
      this.hasResultsToDisplay = hasSearchToDisplay;
    });
    this.searchDataService.isLoadingBehaviour.pipe(takeUntil(this.destroy$)).subscribe((loading: boolean) => {
      this.isLoading = loading;
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
