import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-marking-configurations',
  templateUrl: './marking-configurations.component.html',
  styleUrls: ['./marking-configurations.component.scss']
})
export class MarkingConfigurationsComponent implements OnInit {
  @Input()
  markingForm: FormGroup;

  captureForm: FormGroup;

  releaseForm: FormGroup;

  @Input()
  hasPrimaryMarkSet: BehaviorSubject<boolean>;


  @Input()
  primaryMarkControl: FormControl;

  @Input()
  markingType: string;

  constructor() {}

  ngOnInit() {
    this.captureForm = this.markingForm.controls.captureMarkings as FormGroup;
    this.releaseForm = this.markingForm.controls.releaseMarkings as FormGroup;
  }
}
