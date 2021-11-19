import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BIRD_SEXES, ReferenceDataService, Species, UploadEnums } from '../../services/reference-data.service';
import { BirdSex } from '../../view-data/services/event-types';
import { AuthenticationService, PersonIdentity } from '../../authentication/authentication.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-bird-details',
  templateUrl: './bird-details.component.html',
  styleUrls: ['./bird-details.component.scss']
})
export class BirdDetailsComponent implements OnInit, OnDestroy {
  birdSexes: BirdSex[] = BIRD_SEXES;

  species: Species[];

  @Input()
  birdForm: FormGroup;

  @Input()
  birdId: FormControl;

  @Input()
  formType: string;

  @Input()
  uploadEnums: UploadEnums;

  isEdit = false;

  person: PersonIdentity;

  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private referenceDataService: ReferenceDataService, private authenticationService: AuthenticationService) {}

  ngOnInit() {
    this.isEdit = this.formType === 'EDIT';
    this.referenceDataService.speciesSubject.pipe(takeUntil(this.destroy$)).subscribe(species => (this.species = species));
    this.authenticationService.identitySubject.pipe(takeUntil(this.destroy$)).subscribe(person => (this.person = person));
  }

  get f() {
    return this.birdForm.controls;
  }

  get speciesControl(): FormControl {
    return this.birdForm.get('species') as FormControl;
  }


  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
