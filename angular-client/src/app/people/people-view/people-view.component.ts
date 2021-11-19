import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { isNil } from 'ramda';

import { ConfigurationService } from '../../services/configuration.service';
import { LoggingService } from '../../services/logging.service';
import { PeopleService } from '../../services/people.service';
import { PersonData, Status } from '../people-data';
import { EditPersonComponent } from '../edit-person/edit-person.component';
import { AuthenticationService, PersonIdentity } from '../../authentication/authentication.service';
import { ReferenceDataService, SpeciesGroup } from '../../services/reference-data.service';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';
import { CertificationService } from '../../services/certification.service';
import { PreviousRouteService } from '../../services/previous-route.service';


@Component({
  selector: 'app-people-view',
  templateUrl: './people-view.component.html',
  styleUrls: ['./people-view.component.scss']
})
export class PeopleViewComponent implements OnInit, OnDestroy {
  personData: PersonData;
  loadedAuth = false;
  loadedRef = false;
  loadedPers = false;
  person: PersonIdentity;
  modalRef: BsModalRef;

  alerts: any[] = [];
  dismissible = true;

  speciesGroups: SpeciesGroup[] = [];
  speciesOrEndorsement: string[];

  certForm: FormGroup;
  isCertInEditMode = false;
  certSaved = false;
  bandingLevel: string[];

  hasRestrictions = false;
  submitting = false;
  isOwnProfile = false;

  isInactive = false;

  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private fb: FormBuilder,
    private config: ConfigurationService,
    private auth: AuthenticationService,
    private referenceDataService: ReferenceDataService,
    private logService: LoggingService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private peopleService: PeopleService,
    private certService: CertificationService,
    private modalService: BsModalService,
    private previousRoueService: PreviousRouteService
  ) {}

  ngOnInit() {
    this.auth.identitySubject.pipe(takeUntil(this.destroy$)).subscribe(ident => {
      this.person = ident;
      this.loadedAuth = true;
    });

    // first get the id from the route and the speciesGroups
    combineLatest([this.activatedRoute.paramMap, this.referenceDataService.speciesGroupSubject])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([params, groups]) => {
      this.speciesGroups = groups;
      this.prepareSpeciesGroupEndorsementList();
      this.peopleService.getPerson(params.get('id')).pipe(takeUntil(this.destroy$)).subscribe(person => {
        this.isInactive = person.banderStatus === 'INACTIVE';
        this.isOwnProfile = this.person.userId === person.id;
        this.preparePerson(person);
        this.loadedPers = true;
      });
      this.loadedRef = true;
    });

    // Don't want the ALL in the edit/add dropdowns
    this.bandingLevel = this.config.getConfig().bandingLevel.slice(1);

    // the model for the cert form
    this.certForm = this.fb.group({
      id: [null],
      userId: [null],
      speciesOrEndorsement: [null, [Validators.required]],
      speciesGroupId: [null],
      speciesGroup: [null],
      certificationType: [null],
      bandingLevel: ['L1', [Validators.required]],
      banderId: [null],
      validFrom: [Date],
      comment: [null],
      endorsement: [null],
      isInEditMode: [false]
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  // take the person back to where they came from
  goBack() {
    const previousRoute = this.previousRoueService.getPreviousRoute('/people');
    this.router.navigate([previousRoute]);
  }

  /**
   * Will change the status immediately and reloads the screen.
   */
  onStatusChanged(status: Status): void {
    this.logService.logInfo('Updating persons Status to: ' + status);
    this.personData.banderStatus = status;
    this.peopleService.updatePerson(this.personData).subscribe(
      _ => {
        this.showSuccessNotification('Status changed.', true);
      },
      _ => {
        this.logService.logError('Updating persons Status failed');
      }
    );
  }

  /**
   * Opens modal for editing person data
   */
  onProfileEdit(): void {
    const config = {
      backdrop: true,
      ignoreBackdropClick: true,
      class: 'edit-modal',
      initialState: {
        data: {
          personData: this.personData,
          isAdd: false,
          isAdmin: this.person.isAdmin
        }
      }
    };
    this.modalRef = this.modalService.show(EditPersonComponent, config);
    this.modalRef.content.onClose.subscribe(result => {
      if (result) {
        this.showSuccessNotification('Person updated.', true);
      }
    });
  }

  onResetPwd(): void {
    const config = {
      backdrop: true,
      ignoreBackdropClick: true,
      initialState: {
        data: {
          personData: this.personData
        }
      }
    };
    this.modalRef = this.modalService.show(ResetPasswordComponent, config);
    this.modalRef.content.onClose.subscribe(result => {
      if (result) {
        this.showSuccessNotification('Password reset email sent.', false);
      }
    });
  }

  canEdit(): boolean {
    return this.person.isAdmin || this.person.userId === this.personData.id;
  }

  /**
   * Closes an alert
   */
  onClosed(dismissedAlert: any): void {
    this.alerts = this.alerts.filter(alert => alert !== dismissedAlert);
  }

  /**
   * Adds a new blank certificate to the top of the list and set it to edit mode
   */
  onAddCert(): void {
    if (this.isCertInEditMode) {
      return;
    }
    this.certForm.patchValue({ speciesOrEndorsement: null });
    this.personData.certs.push({
      id: null,
      userId: this.personData.id,
      speciesGroupId: null,
      speciesGroup: null,
      certificationType: null,
      bandingLevel: 'L1',
      banderId: this.personData.banderId,
      validFrom: new Date(),
      comment: null,
      endorsement: null,
      isInEditMode: true
    });
    this.editCert(this.personData.certs.length - 1);
  }

  onCertEdit(index: number): void {
    this.editCert(index);
  }

  onCertSave(): void {
    this.submitting = true;
    this.certSaved = true;
    const cert = this.certForm.value;
    const speciesGroup = this.speciesGroups.filter(sg => sg.name === cert.speciesOrEndorsement)[0];
    if (!isNil(cert.speciesOrEndorsement)) {
      if (isNil(speciesGroup)) {
        cert.endorsement = cert.speciesOrEndorsement;
        cert.certificationType = 'ENDORSEMENT';
      } else {
        cert.speciesGroup = speciesGroup;
        cert.speciesGroupId = speciesGroup.id;
        cert.certificationType = 'SPECIES_GROUP';
      }
    }
    if (isNil(cert.id)) {
      this.logService.logInfo('Adding certificate via API');
      this.certService.addCertificate(cert).subscribe(
        _ => {
          cert.isInEditMode = false;
          this.isCertInEditMode = false;
          this.showSuccessNotification('Certificate added.', true);
        },
        err => {
          this.logService.logError('Adding certificate via API failed');
          this.submitting = false;
          if (err instanceof HttpErrorResponse) {
            if (err.status === 400) {
              this.handleErrorResponse(err.error.details);
            }
          }
        },
        () => {
          this.certSaved = false;
        }
      );
    } else {
      this.certService.updateCertificate(cert).subscribe(
        result => {
          if (result) {
            cert.isInEditMode = false;
            this.isCertInEditMode = false;
            this.showSuccessNotification('Certificate updated.', true);
          }
        },
        err => {
          this.logService.logError('Updating certificate via API failed');
          this.submitting = false;
          if (err instanceof HttpErrorResponse) {
            if (err.status === 400) {
              this.handleErrorResponse(err.error.details);
            }
          }
        },
        () => {
          this.certSaved = false;
        }
      );
    }
  }

  /**
   * Resets the error state of the speciesGroup field (called by UI)
   */
  resetError(): void {
    this.f.speciesGroup.setErrors(null);
    this.certSaved = false;
  }

  /**
   * Removes the certificate at the given position.
   */
  onCertRemove(index: number): void {
    const delCert = this.personData.certs[index];
    this.certService.deleteCertificate(delCert).subscribe(_ => {
      this.isCertInEditMode = false;
      this.showSuccessNotification('Certificate deleted.', true);
    });
  }

  /**
   * Either removes a newly added cert and/or stops editing mode
   */
  onCertCancel(index: number): void {
    if (isNil(this.personData.certs[index].id)) {
      // remove newly added
      this.personData.certs.splice(index, 1);
    } else {
      this.personData.certs[index].isInEditMode = false;
    }
    this.isCertInEditMode = false;
    this.certSaved = false;
  }

  /**
   * Returns true if the current edited cert is new (add) otherwise false when existing (edit)
   */
  isCertAdd(): boolean {
    return isNil(this.certForm.value.id);
  }

  /**
   * Starts editing mode for a specific cert
   */
  private editCert(index: number): void {
    const cert = this.personData.certs[index];
    cert.isInEditMode = true;
    cert.banderId = this.personData.id;

    // populate model
    this.certForm.patchValue(cert);
    this.hasRestrictions = !isNil(cert.comment);

    this.isCertInEditMode = true;
  }

  /**
   * Convenient method for UI to access the form controls
   */
  get f() {
    return this.certForm.controls;
  }

  private showSuccessNotification(msg: string, reload: boolean): void {
    this.alerts.push({
      type: 'success',
      msg,
      timeout: 3000
    });
    if (reload) {
      this.loadPerson(this.personData.id);
    }
  }

  /**
   * Loads a person by the given ID from API
   */
  private loadPerson(id: string): void {
    this.logService.logInfo('Loading person from API');
    this.peopleService.getPerson(id).pipe(takeUntil(this.destroy$)).subscribe(data => {
      // handle certs as species group and endorsement are handled in a pretty ugly way by API
      this.preparePerson(data);
      this.loadedPers = true;
    });
  }

  private preparePerson(person): void {
    person.certs.forEach(cert => {
      if (cert.certificationType === 'SPECIES_GROUP') {
        cert.speciesGroup = this.speciesGroups.filter(g => g.id === cert.speciesGroupId)[0];
      }
    });
    this.personData = person;
  }

  private prepareSpeciesGroupEndorsementList(): void {
    // TODO: get the endorsements from API
    const endorsements = ['Mist-netting', 'Mist-netting waterfowl', 'Cannon-netting', 'Net gun', 'Pullus', 'Transponder insertion'];
    this.speciesOrEndorsement = [];
    this.speciesGroups.forEach(sg => this.speciesOrEndorsement.push(sg.name));
    endorsements.forEach(end => this.speciesOrEndorsement.push(end));
  }

  /**
   * API returns either a ValidationError or a SchemaValidationError :(
   */
  private handleErrorResponse(errors: any): void {
    if (errors instanceof Array) {
      errors.forEach(error => {
        this.handleError(error);
      });
    } else {
      this.handleError(errors);
    }
  }

  private handleError(error: any): void {
    if (error.name === 'ParameterValidationError') {
      this.handleValidationError(error);
    } else {
      this.handleSchemaValidationError(error);
    }
  }

  private handleValidationError(error: any): void {
    const fields = error.property.split('/');
    this.setValidationError(fields[fields.length - 1]);
  }

  private handleSchemaValidationError(error: any): void {
    const fields = error.property.split('/');
    this.setValidationError(fields[fields.length - 1]);
  }

  /**
   * Form specific function to assign a returned validation error to a specific input field
   */
  private setValidationError(errorField: string): void {
    if (errorField.startsWith('phone_num')) {
      this.certForm.controls.speciesOrEndorsement.setErrors({ invalid_format: true });
    }
    if (errorField.startsWith('certification')) {
      this.certForm.controls.speciesGroup.setErrors({ required: true });
    }
  }

  resendInvitation() {
    this.peopleService.resendInvitation(this.personData).subscribe(
      _ => {
        this.showSuccessNotification('Invitation resent', false);
      },
      _ => {
        this.alerts.push({
          type: 'warning',
          msg: 'Unable to resend invitation',
          timeout: 3000
        });
      }
    );
  }
}
