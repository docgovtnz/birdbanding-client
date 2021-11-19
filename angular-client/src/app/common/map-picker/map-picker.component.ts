import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import * as L from 'leaflet';
import { isNil } from 'ramda';
import { ConfigurationService } from '../../services/configuration.service';

export interface MapCoordinate {
  latitude: string;
  longitude: string;
}

@Component({
  selector: 'app-map-picker',
  templateUrl: './map-picker.component.html',
  styleUrls: ['./map-picker.component.scss']
})
export class MapPickerComponent implements AfterViewInit, OnChanges, OnInit {
  private readonly iconsDir = '../../../assets/icons';

  private mapBoxApiKey: string;

  private FirstMarkIcon = L.Icon.extend({
    options: {
      iconSize: [20, 20],
      iconUrl: `${this.iconsDir}/red_hollow_circle.png`,
      shadowSize: [20, 20]
    }
  });

  constructor(private config: ConfigurationService) {}

  @Output()
  selectedCoordinateChange = new EventEmitter<MapCoordinate>();

  @Input()
  selectedCoordinate: MapCoordinate;

  marker: any;

  icon = new this.FirstMarkIcon();

  private map: any;

  ngOnInit(): void {
    this.mapBoxApiKey = this.config.getConfig().mapBoxApiKey;
  }

  ngOnChanges(change) {
    const {
      selectedCoordinate: { currentValue }
    } = change;
    if (this.map) {
      this.setMarker(currentValue);
    }
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [-41.275742, 173.144531],
      zoom: 6
    });

    this.loadMap();
  }

  setMarker(coordinates: MapCoordinate) {
    if (isValidLatitude(coordinates.latitude) && isValidLongitude(coordinates.longitude)) {
      const latNumber = Number(coordinates.latitude);
      const longNumber = Number(coordinates.longitude);
      if (isNil(this.marker)) {
        this.marker = L.marker([latNumber, longNumber], { icon: this.icon }).addTo(this.map);
      } else {
        this.marker.setLatLng({
          lat: latNumber,
          lng: longNumber
        });
      }
      this.map.panTo(this.marker.getLatLng());
    }
  }

  loadMap() {
    const urlTemplate = `https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/tiles/{z}/{x}/{y}` + `?access_token=${this.mapBoxApiKey}`;

    const tiles = L.tileLayer(urlTemplate, {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      minZoom: 3,
      maxZoom: 16,
      bounds: [
        [-90, -180],
        [90, 180]
      ]
    });

    tiles.addTo(this.map);

    if (
      !isNil(this.selectedCoordinate) &&
      isValidLongitude(this.selectedCoordinate.longitude) &&
      isValidLatitude(this.selectedCoordinate.latitude)
    ) {
      this.marker = L.marker([Number(this.selectedCoordinate.latitude), Number(this.selectedCoordinate.longitude)], {
        icon: this.icon
      }).addTo(this.map);
      this.map.panTo(this.marker.getLatLng());
    }
    setTimeout(() => {
      this.map.invalidateSize();
    }, 0);
    this.map.on('click', e => {
      const { lat, lng } = this.map.wrapLatLng(e.latlng);
      this.selectedCoordinate = {
        longitude: Number(lng).toFixed(4),
        latitude: Number(lat).toFixed(4)
      };
      this.setMarker(this.selectedCoordinate);
      this.selectedCoordinateChange.emit(this.selectedCoordinate);
    });
  }
}

export const isValidLatitude = (latString): boolean => {
  const lat = Number(latString);
  if (isNaN(lat) || isNaN(parseFloat(latString))) {
    return false;
  }
  return lat >= -90 && lat <= 90;
};

export const isValidLongitude = (lngString): boolean => {
  const lng = Number(lngString);
  if (isNaN(lng) || isNaN(parseFloat(lngString))) {
    return false;
  }
  return lng >= -180 && lng <= 180;
};
