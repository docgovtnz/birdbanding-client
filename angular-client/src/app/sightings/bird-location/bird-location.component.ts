import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IdDisplay, ReferenceDataService } from '../../services/reference-data.service';
import { MapCoordinate } from '../../common/map-picker/map-picker.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-bird-location',
  templateUrl: './bird-location.component.html',
  styleUrls: ['./bird-location.component.scss'],
})
export class BirdLocationComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private referenceDataService: ReferenceDataService) {}

  @Input()
  locationForm: FormGroup;

  @Output()
  changePage = new EventEmitter<number>();

  selectedCoordinates: MapCoordinate = {
    latitude: null,
    longitude: null,
  };

  regions: IdDisplay[];

  maxDate: Date = new Date();

  ngOnInit() {
    this.referenceDataService.regionSubject.pipe(takeUntil(this.destroy$)).subscribe((regions) => (this.regions = regions));
    this.longitude.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((longitude) => {
      this.selectedCoordinates = {
        longitude,
        latitude: this.selectedCoordinates.latitude,
      };
    });
    this.latitude.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((latitude) => {
      this.selectedCoordinates = {
        latitude,
        longitude: this.selectedCoordinates.longitude,
      };
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  get f() {
    return this.locationForm.controls;
  }

  get latitude(): FormControl {
    return this.locationForm.get('sightingLatitude') as FormControl;
  }

  get longitude(): FormControl {
    return this.locationForm.get('sightingLongitude') as FormControl;
  }

  setLocation(coordinate) {
    const mapCoordinate = coordinate as MapCoordinate;
    this.latitude.setValue(mapCoordinate.latitude, {
      emitEvent: false,
    });
    this.longitude.setValue(mapCoordinate.longitude, {
      emitEvent: false,
    });
  }

  next() {
    if (this.locationForm.invalid) {
      this.locationForm.markAllAsTouched();
    } else {
      this.changePage.emit(3);
    }
  }

  previous() {
    this.changePage.emit(1);
  }
}
