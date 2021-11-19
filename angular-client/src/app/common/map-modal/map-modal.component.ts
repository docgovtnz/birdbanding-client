import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import * as L from 'leaflet';
import { MapCoordinate } from '../map-picker/map-picker.component';

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss']
})
export class MapModalComponent implements OnInit {
  constructor(public modalRef: BsModalRef) {}
  @Input()
  selectedCoordinate: MapCoordinate;

  coordinateSubject: Subject<MapCoordinate> = new Subject<MapCoordinate>();

  ngOnInit() {}

  selectLocation() {
    this.coordinateSubject.next(this.selectedCoordinate);
    this.modalRef.hide();
  }
}
