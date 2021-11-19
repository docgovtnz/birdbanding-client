import { Component, Input, OnInit } from '@angular/core';
import { EventData } from '../../view-data/services/event-types';

@Component({
  selector: 'app-map-popup',
  templateUrl: './map-popup.component.html',
  styleUrls: ['./map-popup.component.scss']
})
export class MapPopupComponent implements OnInit {
  selectedEventIndex = 0;

  @Input()
  events: EventData[];

  constructor() {}

  ngOnInit(): void {}

  nextEvent() {
    if (this.selectedEventIndex < this.events.length - 1) {
      this.selectedEventIndex = this.selectedEventIndex + 1;
    } else {
      this.selectedEventIndex = 0;
    }
  }

  previousEvent() {
    if (this.selectedEventIndex > 0) {
      this.selectedEventIndex = this.selectedEventIndex - 1;
    } else {
      this.selectedEventIndex = this.events.length - 1;
    }
  }
}
