import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { isNil, not } from 'ramda';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-wrapped-typeahead',
  templateUrl: './wrapped-typeahead.component.html',
  styleUrls: ['./wrapped-typeahead.component.scss']
})
export class WrappedTypeaheadComponent implements OnInit {
  selected: any;

  @Input()
  selectedItem: FormControl;

  @Input()
  optionList: any[];

  @Input()
  optionField: string;

  @Input()
  placeholder: string;

  isSelected = false;

  constructor() {}

  ngOnInit() {
    if (not(isNil(this.selectedItem)) && not(isNil(this.selectedItem.value))) {
      this.selected = this.selectedItem.value[this.optionField];
      this.isSelected = true;
    } else {
      this.selected = null;
    }
    // watch to see if the control is populated from the from itself
    this.selectedItem.valueChanges.subscribe(value => {
      if (not(isNil(value))) {
        this.selected = value[this.optionField];
        this.isSelected = true;
      }
    });
  }

  onSelect(event) {
    this.selectedItem.setValue(event.item);
    this.selectedItem.markAsDirty();
    this.isSelected = true;
  }

  clearSelection() {
    this.isSelected = false;
    this.selectedItem.setValue(null);
    this.selected = null;
  }
}
