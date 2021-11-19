import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { IdDisplay, UploadEnums } from '../../services/reference-data.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { MapModalComponent } from '../../common/map-modal/map-modal.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss']
})
export class LocationComponent implements OnInit, OnDestroy {
  @Input()
  locationForm: FormGroup;

  @Input()
  uploadEnums: UploadEnums;

  accuracies: IdDisplay[] = [
    {
      display: '1m',
      id: '1'
    },
    {
      display: '10m',
      id: '10'
    },
    {
      display: '100m',
      id: '100'
    },
    {
      display: '1000m',
      id: '1000'
    },
    {
      display: '10,000m',
      id: '10000'
    },
    {
      display: '100,000m',
      id: '100000'
    }
  ];

  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private modalService: BsModalService) {}

  ngOnInit() {}

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  get f() {
    return this.locationForm.controls;
  }

  get latitude(): FormControl {
    return this.locationForm.get('latitude') as FormControl;
  }

  get longitude(): FormControl {
    return this.locationForm.get('longitude') as FormControl;
  }
  showMapPicker(): void {
    const config = {
      backdrop: true,
      ignoreBackdropClick: true,
      class: 'map-picker-modal',
      initialState: {
        selectedCoordinate: {
          latitude: this.latitude.value,
          longitude: this.longitude.value
        }
      }
    };
    const modalRef = this.modalService.show(MapModalComponent, config);
    modalRef.content.coordinateSubject.pipe(takeUntil(this.destroy$)).subscribe(coordinates => {
      this.latitude.setValue(coordinates.latitude);
      this.longitude.setValue(coordinates.longitude);
    });
  }
}
