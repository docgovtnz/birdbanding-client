import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import {  Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { isNil } from 'ramda';


export interface CoordinateRange {
  minLat: string;
  maxLat: string;
  minLng: string;
  maxLng: string;
}

@Component({
  selector: 'app-coordinate-search',
  templateUrl: './coordinate-search.component.html',
  styleUrls: ['./coordinate-search.component.scss']
})
export class CoordinateSearchComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();

  @Input()
  coordinateControl: FormControl;

  @Input()
  primaryForm: FormGroup;

  coordinateForm: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.coordinateForm = this.fb.group(
      {
        minLat: [null, Validators.compose([Validators.max(90), Validators.min(-90), Validators.pattern('-?\\d+\\.?\\d*')])],
        maxLat: [null, Validators.compose([Validators.max(90), Validators.min(-90), Validators.pattern('-?\\d+\\.?\\d*')])],
        minLng: [null, Validators.compose([Validators.max(180), Validators.min(-180), Validators.pattern('-?\\d+\\.?\\d*')])],
        maxLng: [null, Validators.compose([Validators.max(180), Validators.min(-180), Validators.pattern('-?\\d+\\.?\\d*')])]
      },
      {
        validators: [minMaxLatValidator, minMaxLongValidator]
      }
    );
    if (!isNil(this.coordinateControl) && !isNil(this.coordinateControl.value)) {
      this.coordinateForm.patchValue(this.coordinateControl.value);
    }
    this.coordinateForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(_ => {
      if (!isNil(this.coordinateControl)) {
        this.coordinateControl.setValue(this.coordinateForm.value);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  get minLat(): FormControl {
    return this.coordinateForm.get('minLat') as FormControl;
  }
  get maxLat(): FormControl {
    return this.coordinateForm.get('maxLat') as FormControl;
  }
  get minLng(): FormControl {
    return this.coordinateForm.get('minLng') as FormControl;
  }
  get maxLng(): FormControl {
    return this.coordinateForm.get('maxLng') as FormControl;
  }
}

const minMaxLatValidator: ValidatorFn = (group: FormGroup): ValidationErrors | null => {
  const minLat = group.get('minLat') as FormControl;
  const maxLat = group.get('maxLat') as FormControl;
  if (minLat.value && maxLat.value && parseFloat(minLat.value) > parseFloat(maxLat.value)) {
    return {
      minLatGreaterThanMaxLat: true
    };
  } else {
    return null;
  }
};

const minMaxLongValidator: ValidatorFn = (group: FormGroup): ValidationErrors | null => {
  const minLng = group.get('minLng') as FormControl;
  const maxLng = group.get('maxLng') as FormControl;

  if (minLng.value && maxLng.value && parseFloat(minLng.value) > parseFloat(maxLng.value)) {
    return {
      minLngGreaterThanMaxLng: true
    };
  } else {
    return null;
  }
};
