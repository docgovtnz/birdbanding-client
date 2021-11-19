import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CharacteristicValue } from '../../services/reference-data.service';
import { FormControl, FormArray, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-status-details',
  templateUrl: './status-details.component.html',
  styleUrls: ['./status-details.component.scss']
})
export class StatusDetailsComponent implements OnInit, OnChanges {

  @Input()
  statusDetails = new Array<string>();

  @Input()
  statusDetailValues = new Array<string>();

  @Input()
  statusDetailsForm: FormGroup;

  @Input()
  formType: string;

  availableStatusDetails = Array<string>();

  constructor() { }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.statusDetailValues && changes.statusDetailValues?.currentValue !== undefined) {
      (changes.statusDetailValues.currentValue as string[]).map(this.addStatusDetailValue, this);
    }

    if (this.statusDetails && this.statusDetails.length) {
      this.filterStatusDetails(this.statusDetailsForm.get('statusDetailValues').value);
    }
  }

  filterStatusDetails(statusDetailValues: string[]) {
    this.availableStatusDetails = this.statusDetails.filter(sd => !this.statusDetailValues.includes(sd));
  }

  newStatusDetailValue(e) {
    this.addStatusDetailValue(e.target.value);
  }

  addStatusDetailValue(sd: string) {
    const newStatusDetailValue = new FormControl(sd);
    (this.statusDetailsForm.get('statusDetailValues') as FormArray).push(newStatusDetailValue);
    const i = this.availableStatusDetails.indexOf(sd);
    this.availableStatusDetails.splice(i, 1);
  }

  removeStatusDetailValue(statusDetailValue: string) {
    const valueArray = this.statusDetailsForm.get('statusDetailValues') as FormArray;
    valueArray.removeAt(valueArray.value.indexOf(statusDetailValue));
    console.dir(this.statusDetailsForm.get('statusDetailValues'));
    const addAt: number = this.availableStatusDetails.findIndex(sd => sd.localeCompare(statusDetailValue) === 1);
    console.log(addAt);
    this.availableStatusDetails.splice(addAt, 0, statusDetailValue);
    console.dir(this.availableStatusDetails);
  }

  get statusDetailValuesForm(): FormArray {
    return this.statusDetailsForm.get('statusDetailValues') as FormArray;
  }





}
