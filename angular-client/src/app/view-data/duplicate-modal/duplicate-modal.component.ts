import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export const DUPLICATE_PREFERENCES_KEY = 'duplicate-preferences';

export interface DuplicateFields {
  primaryMark: boolean;
  date: boolean;
  registeredProject: boolean;
  captureCode: boolean;
  species: boolean;
  age: boolean;
  sex: boolean;
  peopleInvolved: boolean;
  eventLocation: boolean;
}

type CheckBoxState = 'ALL' | 'SOME' | 'NONE';

@Component({
  selector: 'app-duplicate-modal',
  templateUrl: './duplicate-modal.component.html',
  styleUrls: ['./duplicate-modal.component.scss'],
})
export class DuplicateModalComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(public modalRef: BsModalRef, private fb: FormBuilder, private router: Router) {}

  @Input()
  eventType = '';

  @Input()
  eventId: string;

  isFirstMarking = false;

  duplicateForm: FormGroup;

  allCheckState: CheckBoxState = 'NONE';

  ngOnInit(): void {
    this.isFirstMarking = this.eventType.toLowerCase().includes('first');
    this.duplicateForm = this.fb.group({
      primaryMark: [false],
      date: [false],
      registeredProject: [false],
      captureCode: [false],
      species: [false],
      age: [false],
      sex: [false],
      peopleInvolved: [false],
      eventLocation: [false],
    });
    const storedPreferences = localStorage.getItem(DUPLICATE_PREFERENCES_KEY);
    if (storedPreferences) {
      this.duplicateForm.patchValue(JSON.parse(storedPreferences));
      this.setCorrectCheckState();
    }
    this.duplicateForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((_) => {
      this.setCorrectCheckState();
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  duplicateEvent() {
    if (!this.isFirstMarking) {
      // if the event being duplicated is not a first marking the primaryMark check will not be visible
      // and the value must be false
      this.duplicateForm.get('primaryMark').patchValue(false);
    }
    localStorage.setItem(DUPLICATE_PREFERENCES_KEY, JSON.stringify(this.duplicateForm.value));
    this.router.navigate(['/data-uploads', 'duplicate-record', this.eventId]).then((_) => {
      this.modalRef.hide();
    });
  }

  setCorrectCheckState() {
    if (this.areNoneChecked()) {
      this.allCheckState = 'NONE';
    } else if (this.areAllChecked()) {
      this.allCheckState = 'ALL';
    } else {
      this.allCheckState = 'SOME';
    }
  }

  areAllChecked(): boolean {
    let allChecked = true;

    Object.keys(this.duplicateForm.controls).forEach((key) => {
      const skipPrimaryMark = !this.isFirstMarking && key === 'primaryMark';
      if (!this.duplicateForm.get(key).value && !skipPrimaryMark) {
        allChecked = false;
      }
    });
    return allChecked;
  }

  areNoneChecked(): boolean {
    let noneChecked = true;
    Object.keys(this.duplicateForm.controls).forEach((key) => {
      if (this.duplicateForm.get(key).value) {
        noneChecked = false;
      }
    });
    return noneChecked;
  }

  setAllCheckBoxes(value: boolean) {
    Object.keys(this.duplicateForm.controls).forEach((key) => {
      this.duplicateForm.get(key).setValue(value, {
        emitEvent: false,
      });
    });
  }

  toggleAllCheckBoxes() {
    switch (this.allCheckState) {
      case 'ALL':
        this.setAllCheckBoxes(false);
        this.allCheckState = 'NONE';
        break;
      case 'SOME':
      case 'NONE':
        this.setAllCheckBoxes(true);
        this.allCheckState = 'ALL';
        break;
    }
  }
}
