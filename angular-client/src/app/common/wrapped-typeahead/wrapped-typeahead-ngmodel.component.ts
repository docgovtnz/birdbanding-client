import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, forwardRef } from '@angular/core';
import { isNil, not } from 'ramda';
import { FormControl, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';



@Component({
  selector: 'app-wrapped-typeahead-ngmodel',
  templateUrl: './wrapped-typeahead-ngmodel.component.html',
  styleUrls: ['./wrapped-typeahead.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => WrappedTypeaheadNgModelComponent),
    multi: true
  }]
})

export class WrappedTypeaheadNgModelComponent implements ControlValueAccessor {
  selected: any;

  @Input()
  optionList: any[];

  @Input()
  optionId: any = 'id';

  @Input()
  optionField: string;

  @Input()
  placeholder: string;

  isSelected = false;

  propagateChange = (_: any) => { };


  onSelect(event) {
    this.propagateChange(event.item[this.optionId]);
    this.isSelected = true;
  }

  clearSelection() {
    this.isSelected = false;
    this.selected = null;
    this.propagateChange(null);
  }

  writeValue(value: any) {
    let option = null;
    option = this.optionList.find(o => o.id === value);
    if (option) {
      this.selected = option[this.optionField];
      this.isSelected = true;
    }
  }

  registerOnChange(fn) {
    this.propagateChange = fn;
  }

  registerOnTouched() {
  }

}
