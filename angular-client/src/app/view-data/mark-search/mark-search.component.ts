import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ReferenceDataService, UploadEnums, ViewDataEnums } from '../../services/reference-data.service';
import { isNil } from 'ramda';

export interface MarkSearchCriteria {
  leg: string;
  bandColour: string;
  alphaNumericText: string;
  position: string;
  type: string;
  form: string;
}

@Component({
  selector: 'app-mark-search',
  templateUrl: './mark-search.component.html',
  styleUrls: ['./mark-search.component.scss']
})
export class MarkSearchComponent implements OnInit {
  destroy$: Subject<boolean> = new Subject<boolean>();

  @Input()
  markControl: FormControl;

  markGroup: FormGroup;

  uploadEnums: UploadEnums;

  viewDataEnums: ViewDataEnums;

  constructor(private fb: FormBuilder, private referenceDataService: ReferenceDataService) {}

  ngOnInit(): void {
    this.markGroup = this.fb.group({
      leg: [],
      bandColour: [],
      alphaNumericText: [],
      position: [],
      type: [],
      form: []
    });
    if (!isNil(this.markControl) && !isNil(this.markControl.value)) {
      this.markGroup.patchValue(this.markControl.value, {
        emitEvent: false
      });
    }
    this.referenceDataService.dataUploadSubject.pipe(takeUntil(this.destroy$)).subscribe(uploadEnums => (this.uploadEnums = uploadEnums));
    this.referenceDataService.viewDataSubject
      .pipe(takeUntil(this.destroy$))
      .subscribe(viewDataEnums => (this.viewDataEnums = viewDataEnums));
    this.markGroup.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(_ => {
      this.markControl.setValue(this.markGroup.value);
    });
  }
}
