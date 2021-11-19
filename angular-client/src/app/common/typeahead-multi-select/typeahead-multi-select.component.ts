import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef } from '@angular/core';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { isNil } from 'ramda';
import { BehaviorSubject, Subject } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-typeahead-multi-select',
  templateUrl: './typeahead-multi-select.component.html',
  styleUrls: ['./typeahead-multi-select.component.scss'],
})
export class TypeaheadMultiSelectComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();

  selected: any;

  @Input()
  selectedItems = [];

  @Output()
  selectedItemsChange = new EventEmitter<string[]>();

  @Input()
  optionList: any[];

  @Input()
  optionField: string;

  @Input()
  customItemTemplate: TemplateRef<any>;

  @Input()
  placeholder: string;

  @Input()
  clearValue$: Subject<boolean>;

  @Input()
  inputId: string;

  constructor() {}

  ngOnInit() {
    if (isNil(this.inputId)) {
      this.inputId = `typeahead-multi-${uuidv4()}`;
    }
    // this subject allows the parent to clear the value in the child typeahead input
    if (this.clearValue$) {
      this.clearValue$.pipe(takeUntil(this.destroy$)).subscribe((_) => {
        this.clearInputValue();
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  clearItems() {
    this.selectedItems = [];
    this.publishChange();
  }

  clearInputValue() {
    const input = document.getElementById(this.inputId) as HTMLInputElement;
    if (!isNil(input)) {
      input.value = '';
    }
  }

  onSelect($event: TypeaheadMatch): void {
    if (!this.selectedItems.includes($event.item)) {
      this.selectedItems.push($event.item);
      this.publishChange();
    }
    this.selected = null;
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
