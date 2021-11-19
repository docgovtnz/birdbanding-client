import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { not, isNil } from 'ramda';

@Component({
  selector: 'app-multi-select',
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.scss'],
})
export class MultiSelectComponent implements OnInit {
  @Input()
  selectedItems = [];

  @Output()
  selectedItemsChange = new EventEmitter<string[]>();

  @Input()
  optionList: any[];

  @Input()
  optionField: string;

  @Input()
  placeholder: string;

  constructor() {}

  ngOnInit() {}

  onSelect($event): void {
    const item = this.optionList.find((o) => o[this.optionField] === $event.target.value);
    if (not(isNil(item)) && !this.selectedItems.includes(item)) {
      this.selectedItems.push(item);
      this.publishChange();
    }
    $event.target.value = null;
  }

  clearItems() {
    this.selectedItems = [];
    this.publishChange();
  }

  onRemoveItem(index: number) {
    this.selectedItems.splice(index, 1);
    this.publishChange();
  }

  publishChange() {
    this.selectedItemsChange.emit(this.selectedItems);
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
