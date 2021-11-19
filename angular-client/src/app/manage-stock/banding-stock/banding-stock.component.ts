import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { combineLatest } from 'rxjs';

import { BandsService } from '../services/bands.service';
import { BandTransferService } from '../services/band-transfer.service';
import { BandTransferResponse, TransferBand } from '../model/band-transfer';
import { Band } from '../model/band';
import { PeopleService } from '../../services/people.service';
import { PeopleData } from '../../people/people-data';
import { AuthenticationService, PersonIdentity } from '../../authentication/authentication.service';
import { ApiError } from '../../common/errors/error-utilities';

@Component({
  selector: 'app-banding-stock',
  templateUrl: './banding-stock.component.html',
  styleUrls: ['./banding-stock.component.scss'],
})
export class BandingStockComponent implements OnInit {
  person: PersonIdentity;
  people: PeopleData[];
  selectedBander: string;
  bands: Band[];
  transfers: BandTransferResponse;

  bandForm: FormGroup;
  bandSaving = false; // TODO: set back to false, when API is available

  loaded = false;

  updateStockErrors: ApiError[] = [];

  constructor(
    private auth: AuthenticationService,
    private fb: FormBuilder,
    private bandService: BandsService,
    private bandTransferService: BandTransferService,
    private peopleService: PeopleService
  ) {}

  ngOnInit() {
    combineLatest([
      this.auth.identitySubject,
      this.peopleService.getPeople(),
      this.bandService.getBandSummary(),
      this.bandTransferService.getLatestBandTransfers(),
    ]).subscribe(([person, people, bands, transfers]) => {
      this.person = person;
      this.people = people;
      this.bands = bands;
      this.transfers = transfers;
      this.loaded = true;
    });

    // the model for the band form
    this.bandForm = this.fb.group({
      bandPrefix: [''],
      noOfBands: [0],
      lastBandNo: ['0'],
      firstShortNo: [0],
      lastShortNo: [0],
      isBandEdit: [false],
    });
  }

  /**
   * UI bander typeahead, load summary for user
   */
  onSelectBander(item: PeopleData): void {
    this.bandService.getBandSummary(item.id).subscribe((res) => (this.bands = res));
  }

  /**
   * UI - the little cross in the bander typeahead, removes selected and loads summary
   */
  clearBanderSearch(): void {
    this.selectedBander = null;
    this.bandService.getBandSummary().subscribe((res) => (this.bands = res));
  }

  /**
   * Returns the css classes for a little ball indicating the banding level
   */
  getBallColourClass(maxBandingLevel: string): string {
    switch (maxBandingLevel) {
      case 'L1':
        return 'green-ball';
      case 'L2':
        return 'orange-circle';
      case 'L3':
        return 'red-ball';
    }
    return '';
  }

  toggleEditMode(index: number): void {
    this.setEditMode(index, !this.bands[index].isBandEdit);
  }

  setEditMode(index: number, isEdit: boolean): void {
    // unset any other edit mode
    this.updateStockErrors = [];
    this.bands.forEach((band) => (band.isBandEdit = false));

    this.bands[index].isBandEdit = isEdit;
    if (isEdit) {
      const band = this.bands[index];
      this.bandForm.patchValue(band);
      this.bandForm.patchValue({
        firstShortNo: parseInt(band.lastBandNo, 10) + 1,
        lastShortNo: null,
      });
    }
  }

  toggleViewMode(index: number): void {
    this.setViewMode(index, !this.transfers.transfers[index].isTransferView);
  }

  setViewMode(index: number, isView: boolean): void {
    this.transfers.transfers[index].isTransferView = isView;
    if (isView) {
      this.bandTransferService
        .getBandTransfer(this.transfers.transfers[index].transferId)
        .subscribe((bands) => (this.transfers.transfers[index].transferred = bands));
    }
  }

  onBandSave(): void {
    this.updateStockErrors = [];
    this.bandSaving = true;
    this.bandService
      .addBands(
        this.bandForm.controls.bandPrefix.value,
        this.bandForm.controls.firstShortNo.value,
        this.bandForm.controls.lastShortNo.value
      )
      .subscribe(
        (res) => {
          // refresh data
          this.bandService.getBandSummary().subscribe((data) => {
            this.bands = data;
            this.bands.forEach((band) => (band.isBandEdit = false));
            this.bandSaving = false;
          });
        },
        (err) => {
          this.bandSaving = false;
          if (err && err.error && err.error.details) {
            this.updateStockErrors = err.error.details;
          } else {
            this.updateStockErrors = [
              {
                message: 'Unable to update banding stock',
                property: '',
              },
            ];
          }
          console.log('Unable to add new bands');
        }
      );
  }

  getNewTotal(): number {
    const total = this.bandForm.controls.lastShortNo.value - this.bandForm.controls.firstShortNo.value + 1;
    if (total < 0) {
      return 0;
    }
    return total;
  }

  getFormattedRange(t: TransferBand) {
    const padShortNumber = s => (s.length < 5) ? '0000'.slice(0, 4 - s.length) + s : s;
    if (t.minShortNumber === t.maxShortNumber) {
      return `${t.prefix}-${padShortNumber(t.minShortNumber)}`;
    }
    else {
      return `${t.prefix} ${padShortNumber(t.minShortNumber)} to ${padShortNumber(t.maxShortNumber)}`;
    }
  }
}
