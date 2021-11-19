import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { not, isNil } from 'ramda';

@Component({
  selector: 'app-free-text-multi-select',
  templateUrl: './free-text-multi-select.component.html',
  styleUrls: ['./free-text-multi-select.component.scss'],
})
export class FreeTextMultiSelectComponent implements OnInit {

  @Output()
  selectedItemsChange = new EventEmitter<string[]>();

  @Input()
  placeholder: string;

  @Input()
  buttonLabel = 'Add term';

  @Input()
  minimumTermSize = 3;

  selectedItems = new Set<string>();

  currentValue = '';

  constructor() {}

  ngOnInit() { }

  addItem() {
    if (this.currentValue.trim().length >= this.minimumTermSize) {
      this.selectedItems.add(this.currentValue);
      this.currentValue = '';
    }
  }

  onFieldChange(event: any) {
    this.publishChange();
  }

  removeItem(item: string) {
    this.selectedItems.delete(item);
    this.publishChange();
  }

  clearItems() {
    this.selectedItems.clear();
    this.publishChange();
  }

  publishChange() {
    if (this.currentValue.length >= this.minimumTermSize) {
      this.selectedItemsChange.emit(Array.from(this.selectedItems).concat(this.currentValue));
    }
    else {
      this.selectedItemsChange.emit(Array.from(this.selectedItems));
    }
  }

  truncateDescription(s: string): string {
    if (isNil(s)) {
      return '';
    } else if (s.length < 10) {
      return s;
    } else {
      return s.substr(0, 10) + '...';
    }
  }
}
