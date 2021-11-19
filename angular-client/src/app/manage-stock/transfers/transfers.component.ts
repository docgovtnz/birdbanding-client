import { Component, OnInit } from '@angular/core';
import { is } from 'ramda';
import { TransferBand } from '../model/band-transfer';

import { BandTransferService } from '../services/band-transfer.service';

import { BandTransferResponse } from '../model/band-transfer';
import { AuthenticationService, PersonIdentity } from '../../authentication/authentication.service';

@Component({
  selector: 'app-transfers',
  templateUrl: './transfers.component.html',
  styleUrls: ['./transfers.component.scss']
})
export class TransfersComponent implements OnInit {
  person: PersonIdentity;

  transfers: BandTransferResponse;

  // pagination
  currentPageUrl = 'event-transfers?limit=20';
  previousPageUrl = this.currentPageUrl;
  nextPageUrl = this.currentPageUrl;
  limitPerPage = 20;
  currentPage = 1;
  jumpToPage = '';
  isFirstPage: boolean;
  isLastPage: boolean;

  loaded = false;

  constructor(private auth: AuthenticationService, private transferService: BandTransferService) {}

  ngOnInit() {
    this.auth.identitySubject.subscribe(pi => {
      this.person = pi;
      if (pi.isAdmin) {
        this.loadData(this.currentPageUrl);
      } else {
        this.loaded = true;
      }
    });
  }

  /**
   * Returns the css classes for a little ball indicating the banding level
   * TODO: $2 version - this method also exist here: BandingStockComponent
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

  toggleViewMode(index: number): void {
    this.setViewMode(index, !this.transfers.transfers[index].isTransferView);
  }

  setViewMode(index: number, isView: boolean): void {
    this.transfers.transfers[index].isTransferView = isView;
    if (isView) {
      this.transferService
        .getBandTransfer(this.transfers.transfers[index].transferId)
        .subscribe(bands => (this.transfers.transfers[index].transferred = bands));
    }
  }

  // a bit dodgy when switching from 50 back to 20 as pagination token is still odd.
  onLimitChanged(event: any) {
    this.limitPerPage = Number(event.target.value);
    // alter currentPageUrl
    const part1 = this.currentPageUrl.substring(0, this.currentPageUrl.indexOf('=') + 1);
    let part2 = '';
    if (this.currentPageUrl.includes('&')) {
      part2 = this.currentPageUrl.substring(this.currentPageUrl.indexOf('&'));
    }
    this.loadData(`${part1}${this.limitPerPage}${part2}`);
  }

  // TODO: API can't deliver total count :(
  // onPageChanged(event: any): void {
  //   console.log('Page changed: trigger load from API');
  //   console.log(event);
  //   this.currentPage = event.page;
  //   this.transferService.getBandTransfers(this.nextPageUrl).subscribe(d => {
  //     this.transfers = d;
  //     console.log(d.pagination);
  //   });
  // }
  onPreviousPage(): void {
    this.loadData(this.previousPageUrl);
  }

  onNextPage(): void {
    this.loadData(this.nextPageUrl);
  }

  onJumpTo(): void {
    if (!this.jumpToPage) {
      return;
    }
    const page = Number(this.jumpToPage);
    if (is(Number, page)) {
      this.currentPage = page - 1;

      // calculate pagination token
      const paginationToken = this.limitPerPage * this.currentPage;
      if (this.currentPageUrl.includes('paginationToken')) {
        this.currentPageUrl = this.currentPageUrl.substring(0, this.currentPageUrl.length - 2) + paginationToken;
      } else {
        this.currentPageUrl = `${this.currentPageUrl}&paginationToken=${paginationToken}`;
      }
      this.loadData(this.currentPageUrl);
    }
    this.jumpToPage = '';
  }

  /**
   * Removes the duplicate part of the path
   */
  private getSanitisedPath(path: string) {
    return path.substring('/birdbanding/'.length);
  }

  private loadData(path: string) {
    this.transferService.getBandTransfers(path).subscribe(data => {
      this.transfers = data;
      this.currentPageUrl = this.getSanitisedPath(data.pagination.self);
      this.previousPageUrl = this.getSanitisedPath(data.pagination.prev);
      this.nextPageUrl = this.getSanitisedPath(data.pagination.next);
      this.isFirstPage = data.pagination.self === data.pagination.prev;
      this.isLastPage = data.pagination.isLastPage;
      this.loaded = true;
    });
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

  JSON(o) {
    return JSON.stringify(o);
  }
}
