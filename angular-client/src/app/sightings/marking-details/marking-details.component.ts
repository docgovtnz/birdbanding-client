import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Form, FormArray, FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-marking-details',
  templateUrl: './marking-details.component.html',
  styleUrls: ['./marking-details.component.scss']
})
export class MarkingDetailsComponent implements OnInit {
  @Input()
  markingFrom: FormGroup;

  lowerLeftBand: FormArray;
  upperLeftBand: FormArray;
  lowerRightBand: FormArray;
  upperRightBand: FormArray;

  @Output()
  changePage = new EventEmitter<number>();

  hasPrimaryMarkSet: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);


  constructor() {}

  ngOnInit() {
    this.lowerLeftBand = this.markingFrom.get('lowerLeftBands') as FormArray;
    this.upperLeftBand = this.markingFrom.get('upperLeftBands') as FormArray;
    this.lowerRightBand = this.markingFrom.get('lowerRightBands') as FormArray;
    this.upperRightBand = this.markingFrom.get('upperRightBands') as FormArray;
  }

  next() {
    if (this.markingFrom.invalid) {
      this.markingFrom.markAllAsTouched();
    } else {
      this.markingFrom.markAsTouched();
      this.changePage.emit(4);
    }
  }

  get f() {
    return this.markingFrom.controls;
  }

  previous() {
    this.changePage.emit(2);
  }
}
