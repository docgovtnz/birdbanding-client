import { Component, Input, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { PeopleService } from '../../services/people.service';
import { PeopleData } from '../people-data';
import { LoggingService } from '../../services/logging.service';

/**
 * This form is used by a modal dialog to edit or add a person.
 */
@Component({
  selector: 'app-edit-person',
  templateUrl: './edit-person.component.html',
  styleUrls: ['./edit-person.component.scss']
})
export class EditPersonComponent implements OnInit {
  @Input() public data: any;

  peopleData: PeopleData[] = [];

  public onClose: Subject<boolean>;

  editForm: FormGroup;
  submitted = false;
  submitting = false;
  json = JSON;

  constructor(
    private fb: FormBuilder,
    public modalRef: BsModalRef,
    private peopleService: PeopleService,
    private logService: LoggingService
  ) {}

  ngOnInit() {
    // load people data (should be cached) for validations
    this.peopleService.getPeople().subscribe(data => (this.peopleData = data));

    // the model for the reactive form
    this.editForm = this.fb.group({
      id: [''],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      userName: ['', [Validators.required, this.validateUsername()]],
      email: ['', [Validators.required]],
      company: [''],
      phone: [''],
      address: [''],
      banderId: ['', this.validateBandersNumber()],
      nznbb: [false],
      banderStatus: ['']
    });

    // populate model if data is available (when edit)
    if (this.data.personData) {
      this.editForm.patchValue(this.data.personData);
    }

    // to send a status back to the parent
    this.onClose = new Subject<boolean>();
  }

  /**
   * Sends either an update or add to the API when form is valid. Closes modal afterwards.
   */
  public onSubmit(): void {
    this.submitted = true;
    this.submitting = true;

    // send to API
    if (this.data.isAdd) {
      this.logService.logInfo('Adding person via API');
      this.peopleService.addPerson(this.editForm.value).subscribe(
        _ => {
          this.onClose.next(true);
          this.modalRef.hide();
        },
        err => {
          this.logService.logError('Adding person via API failed');
          this.submitting = false;
          if (err instanceof HttpErrorResponse) {
            if (err.status === 400) {
              this.handleErrorResponse(err.error.details);
            }
          }
        }
      );
    } else {
      this.logService.logInfo('Updating person via API');
      this.peopleService.updatePerson(this.editForm.value).subscribe(
        result => {
          this.onClose.next(true);
          this.modalRef.hide();
        },
        err => {
          this.logService.logError('Updating person via API failed');
          this.submitting = false;
          if (err instanceof HttpErrorResponse) {
            if (err.status === 400) {
              this.handleErrorResponse(err.error.details);
            }
          }
        }
      );
    }
  }

  /**
   * Returns true if the user is an admin otherwise false.
   */
  isAdmin(): boolean {
    return this.data.isAdmin;
  }

  /**
   * Returns true if this modal should act as an add modal otherwise false (= update)
   */
  isAdd(): boolean {
    return this.data.isAdd;
  }

  /**
   * Username Validator: unique. Checks the given username against the list of people
   */
  validateUsername(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors => {
      const duplicate = this.peopleData.filter(pp => control.value === pp.userName).length > 0;
      if (duplicate) {
        return { duplicate: true };
      } else {
        return null;
      }
    };
  }

  /**
   * Username Validator: unique. Checks the given username against the list of people
   */
  validateBandersNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors => {
      const duplicate = this.peopleData.filter(pp => control.value === pp.banderNumber).length > 0;
      if (duplicate) {
        return { duplicate: true };
      } else {
        return null;
      }
    };
  }

  /**
   * Convenient method for UI to access the form controls
   */
  get f() {
    return this.editForm.controls;
  }

  /**
   * API returns either a ValidationError or a SchemaValidationError :(
   */
  private handleErrorResponse(errors: any): void {
    if (errors instanceof Array) {
      errors.forEach(error => {
        this.setValidationError(error.code, error.property);
      });
    } else {
      this.setValidationError(errors.code, errors.property);
    }
  }

  /**
   * Form specific function to assign a returned validation error to a specific input field
   */
  private setValidationError(errorCode: number, errorField: string): void {
    if (errorField.includes('username')) {
      if (errorCode === 1007) {
        this.editForm.controls.userName.setErrors({ invalid_format: true });
      }
      if (errorCode === 2004) {
        this.editForm.controls.userName.setErrors({ duplicate: true });
      }
    }
    if (errorField.includes('phone_number')) {
      this.editForm.controls.phone.setErrors({ invalid_format: true });
    }
    if (errorField.includes('email')) {
      if (errorCode === 1005) {
        this.editForm.controls.email.setErrors({ invalid_format: true });
      }
      if (errorCode === 2004) {
        this.editForm.controls.email.setErrors({ duplicate: true });
      }
    }
  }
}
