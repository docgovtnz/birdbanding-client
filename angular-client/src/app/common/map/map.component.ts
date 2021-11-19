import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import { EventData } from '../../view-data/services/event-types';
import { Subject } from 'rxjs';
import { isNil } from 'ramda';
import { NgElement, WithProperties } from '@angular/elements';
import { MapPopupComponent } from '../../elements/map-popup/map-popup.component';
import { ConfigurationService } from '../../services/configuration.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit, OnDestroy, OnInit {
  private readonly iconsDir = '../../../assets/icons';

  private mapBoxApiKey: string;

  // tslint:disable-next-line:variable-name
  private _events: EventData[];

  private map: any;

  private BirdMarkerIcon = L.Icon.extend({
    options: {
      iconSize: [20, 20]
    }
  });

  @Input()
  redrawSubject: Subject<boolean>;

  @Input()
  fullHeight = false;

  // tslint:disable-next-line:variable-name
  private _mapType: 'Topographical' | 'Satellite' = 'Topographical';

  @Output()
  mapTypeChange = new EventEmitter();

  // tslint:disable-next-line:variable-name
  private _markerLayout: 'Cluster' | 'Scatter' = 'Cluster';

  @Output()
  markerLayoutChange = new EventEmitter();

  layerGroup: any;

  constructor(private config: ConfigurationService) {}

  get events(): EventData[] {
    return this._events;
  }

  @Input()
  set events(value: EventData[]) {
    this._events = value;
    if (this.map) {
      this.redraw();
    }
  }

  get mapType(): 'Topographical' | 'Satellite' {
    return this._mapType;
  }

  @Input()
  set mapType(value: 'Topographical' | 'Satellite') {
    this._mapType = value;
    if (this.map) {
      this.loadMap(); // different to changing the marker layout because this means we need to reload all of the tiles
    }
    this.mapTypeChange.emit(this._mapType);
  }

  get markerLayout(): 'Cluster' | 'Scatter' {
    return this._markerLayout;
  }

  @Input()
  set markerLayout(value: 'Cluster' | 'Scatter') {
    this._markerLayout = value;
    if (this.map) {
      this.redraw();
    }
    this.markerLayoutChange.emit(this._markerLayout);
  }

  ngOnInit(): void {
    this.mapBoxApiKey = this.config.getConfig().mapBoxApiKey;
  }

  ngAfterViewInit(): void {
    this.initMap();

    if (!isNil(this.redrawSubject)) {
      this.redrawSubject.subscribe(_ => {
        if (this.map) {
          this.redraw();
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (!isNil(this.map)) {
      this.map.remove();
      this.map = null;
    }
  }

  private initMap(): void {
    // a timeout makes sure that the correct map div is targeted, otherwise the is a blank map in some cases
    setTimeout(() => {
      this.map = L.map('map', {
        center: [-41.275742, 173.144531],
        zoom: 6,
        maxZoom: 16,
        bounds: [
          [-90, 0],
          [90, 360]
        ]
      });
      this.loadMap();
    }, 1);
  }

  loadMap() {
    if (!this.mapType) {
      throw new Error('No mapType is currently set.');
    }

    const MAP_TYPE_URLS = {
      Topographical: 'https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/tiles/{z}/{x}/{y}',
      Satellite: 'https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}'
    };

    const urlTemplate = MAP_TYPE_URLS[this.mapType] + `?access_token=${this.mapBoxApiKey}`;

    const tiles = L.tileLayer(urlTemplate, {
      minZoom: 3,
      maxZoom: 16,
      tileSize: 512,
      zoomOffset: -1,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);
    const anteMeridianLatLng = [
      [90, 180],
      [-90, 180]
    ];
    L.polyline(anteMeridianLatLng, { color: 'red', weight: 1, opacity: 0.8, dashArray: '4' }).addTo(this.map);

    setTimeout(() => {
      this.map.invalidateSize();
    }, 0);

    if (this._events != null && this._events.length > 0) {
      this.drawEvents();
    }
  }

  redraw() {
    const markers = L.markerClusterGroup();
    markers.clearLayers();
    this.drawEvents();
  }

  drawEvents() {
    try {
      if (this.map) {
        const markerList = [];
        for (const event of this._events) {
          if (event.lng && event.lat) {
            const popup = L.popup({ className: 'map-popup-wrapper', minWidth: 350, closeButton: false }).setContent(_ => {
              const popupEl: NgElement & WithProperties<MapPopupComponent> = document.createElement('popup-element') as any;
              // Listen to the close event
              popupEl.addEventListener('closed', () => document.body.removeChild(popupEl));
              popupEl.events = [event];
              // Add to the DOM
              document.body.appendChild(popupEl);
              return popupEl;
            });
            const icon = this.getBirdMarker(event.bbsCode);
            icon.options.shadowSize = [0, 0];
            const shiftedLng = event.lng < 0 ? event.lng + 360 : event.lng;
            markerList.push(L.marker([event.lat, shiftedLng], { icon }).bindPopup(popup));
          }
        }

        if (this.layerGroup) {
          this.layerGroup.remove();
        }

        switch (this.markerLayout) {
          case 'Cluster':
            this.layerGroup = L.markerClusterGroup({ chunkedLoading: true });
            this.layerGroup.addLayers(markerList);
            this.map.addLayer(this.layerGroup);
            break;
          case 'Scatter':
            this.layerGroup = L.layerGroup();
            for (const eventMarker of markerList) {
              eventMarker.addTo(this.layerGroup);
            }
            this.map.addLayer(this.layerGroup);
            break;
          default:
            throw new Error('Unknown markerLayout of ' + this.markerLayout);
        }

        if (this._events.length === 1) {
          const { lat, lng } = this._events[0];
          this.panToEvent({ lat, lng });
        }
      }
    } catch (e) {
      console.error('error drawing', e);
    }
  }

  panToEvent(latLong) {
    const { lat, lng } = latLong;
    if (lng < 0) {
      this.map.panTo({
        lng: lng + 360,
        lat
      });
    } else {
      this.map.panTo(latLong);
    }
  }

  private getBirdMarker(eventType: string): L.Icon {
    const key = eventType.substring(0, 2).trim();
    switch (key) {
      case '1':
        return new this.BirdMarkerIcon({ iconUrl: `${this.iconsDir}/red_hollow_circle.png` });
      case 'Z':
        return new this.BirdMarkerIcon({ iconUrl: `${this.iconsDir}/purple_triangle.png` });
      case '2A':
        return new this.BirdMarkerIcon({ iconUrl: `${this.iconsDir}/yellow_triangle.png` });
      case '2B':
        return new this.BirdMarkerIcon({ iconUrl: `${this.iconsDir}/red_circle.png` });
      case '2C':
        return new this.BirdMarkerIcon({ iconUrl: `${this.iconsDir}/lightblue_rec.png` });
      case '2D':
        return new this.BirdMarkerIcon({ iconUrl: `${this.iconsDir}/green_rec.png` });
      case '3':
        return new this.BirdMarkerIcon({ iconUrl: `${this.iconsDir}/purple_circle.png` });
      case 'C':
        return new this.BirdMarkerIcon({ iconUrl: `${this.iconsDir}/green_rec_outline.png` });
      case 'X':
        return new this.BirdMarkerIcon({ iconUrl: `${this.iconsDir}/grey_circle.png` });
      default:
        return new this.BirdMarkerIcon({ iconUrl: `${this.iconsDir}}/red_hollow_circle.png` });
    }
  }
}
