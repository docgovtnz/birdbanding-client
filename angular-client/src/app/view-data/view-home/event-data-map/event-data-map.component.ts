import { AfterViewInit, Component, Input, OnDestroy, OnInit, Type, ViewChild } from '@angular/core';
import { EventData } from '../../services/event-types';
import { Subject } from 'rxjs';
import { MapDataResult, MapDataService } from '../../services/map-data.service';
import { EVENT_CODES } from '../../../services/reference-data.service';
import { MapComponent } from '../../../common/map/map.component';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-event-data-map',
  templateUrl: './event-data-map.component.html',
  styleUrls: ['./event-data-map.component.scss']
})
export class EventDataMapComponent implements AfterViewInit, OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();

  events: EventData[] = [];

  redrawMapSubject: Subject<boolean> = new Subject<boolean>();

  loading: boolean;

  hasMoreData = true;

  eventCodes = EVENT_CODES;
  eventCodeState: boolean[] = [];

  @ViewChild('mapComponent')
  mapComponent: MapComponent;

  constructor(private mapDataService: MapDataService) {}

  ngOnInit() {
    this.eventCodeState = Array(this.eventCodes.length).fill(true);
    this.mapDataService.mapDataSubject.pipe(takeUntil(this.destroy$)).subscribe((dataResult: MapDataResult) => {
      this.events = dataResult.mapData;

      this.hasMoreData = dataResult.hasMoreData;
      this.redrawMapSubject.next(true);
    });
    this.mapDataService.isLoadingBehaviour.pipe(takeUntil(this.destroy$)).subscribe((loading: boolean) => {
      this.loading = loading;
    });
  }

  ngAfterViewInit(): void {}

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  addDataToMap() {
    this.loading = true;
    this.mapDataService.requestMoreData();
  }

  onToggleEventCode(index: number): void {
    this.eventCodeState[index] = !this.eventCodeState[index];
    // this.filterEventCodes(); TODO: Subject -> map.component
  }
}
