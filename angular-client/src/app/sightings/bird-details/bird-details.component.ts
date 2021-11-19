import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { isNil, not } from 'ramda';
import { CONDITIONS, ReferenceDataService, Species } from '../../services/reference-data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-bird-details',
  templateUrl: './bird-details.component.html',
  styleUrls: ['./bird-details.component.scss'],
})
export class BirdDetailsComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();

  @Input()
  birdDetailsForm: FormGroup;

  @Output()
  changePage = new EventEmitter<number>();

  // relates to the recognised button, if true the name input is displayed
  isRecognised;
  // relates to the is marked button, if false the bottom of the form becomes hidden
  showForm;

  species: Species[];

  conditions = CONDITIONS;
  constructor(private referenceDataService: ReferenceDataService) {}

  ngOnInit() {
    this.referenceDataService.speciesSubject.pipe(takeUntil(this.destroy$)).subscribe((species) => (this.species = species));
    this.birdDetailsForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((nextValue) => {
      this.isRecognised = nextValue.recognised;
      this.showForm = !(not(isNil(nextValue.marked)) && not(nextValue.marked));
    });
    const formValue = this.birdDetailsForm.value;
    // set the working variables if the values they relate to are already set on the form
    this.isRecognised = formValue.recognised;
    this.showForm = !(not(isNil(formValue.marked)) && not(formValue.marked));
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  get f() {
    return this.birdDetailsForm.controls;
  }

  updateSpeciesId(species) {
    this.birdDetailsForm.controls.speciesId.setValue(species.id);
  }

  next() {
    if (this.birdDetailsForm.invalid) {
      this.birdDetailsForm.markAllAsTouched();
    } else {
      this.changePage.emit(2);
    }
  }
}
