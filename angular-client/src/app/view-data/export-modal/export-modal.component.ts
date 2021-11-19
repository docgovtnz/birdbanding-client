import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { AdvancedFilterOption, FilterOptions } from '../services/event-types';
import { ExportDescription, ExportService } from '../services/export.service';
import { LoggingService } from '../../services/logging.service';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

enum ExportState {
  LOADING,
  EXPORT_READY,
  DOWNLOADING,
  ERROR,
}

@Component({
  selector: 'app-export-modal',
  templateUrl: './export-modal.component.html',
  styleUrls: ['./export-modal.component.scss'],
})
export class ExportModalComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();

  exportState: ExportState = ExportState.LOADING;

  rowsToExport: number;

  isMoratorium: boolean;

  exportId: string;

  readyToExport = false;

  hasStartedDownLoad = false;

  hasError = false;

  @Input() filterOptions: FilterOptions | AdvancedFilterOption[];

  isAdvancedFilterOption = function(options: FilterOptions | AdvancedFilterOption[]) {
    return Array.isArray(options);
  }

  constructor(
    public modalRef: BsModalRef,
    private router: Router,
    private exportService: ExportService,
    private loggingService: LoggingService
  ) {}

  ngOnInit() {
    this.requestDownload();
  }

  requestDownload() {

    let exportRequest: Observable<ExportDescription>;
    if (!this.isAdvancedFilterOption(this.filterOptions)) {
      exportRequest = this.exportService.requestDownload(this.filterOptions as FilterOptions)
    } else {
      exportRequest = this.exportService.requestDownloadAdvanced(this.filterOptions as Array<AdvancedFilterOption>);
    }
    exportRequest.pipe(takeUntil(this.destroy$))
      .subscribe(
        (dataExport) => {
          this.rowsToExport = dataExport.numberOfRows;
          this.isMoratorium = dataExport.isMoratorium;
          this.exportId = dataExport.exportId;
          this.exportState = ExportState.EXPORT_READY;
          this.readyToExport = true;
        },
        (error) => {
          this.loggingService.logError(`Can not request download=${this.filterOptions}, httpStatus:${error.status}`);
          this.exportState = ExportState.ERROR;
          this.hasError = true;
        });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  startDownload() {
    this.exportService.startDownLoad(this.exportId).subscribe(
      (exportDesc) => {
        this.exportService.startPolling();
        this.hasStartedDownLoad = true;
        this.exportState = ExportState.DOWNLOADING;
      },
      (error) => {
        this.loggingService.logError(`Can not start download id=${this.exportId}, httpStatus:${error.status}`);
        this.exportState = ExportState.ERROR;
        this.hasError = true;
      }
    );
  }

  navigateToExports() {
    this.router.navigate(['view-data/view-exports']).then(() => {
      this.modalRef.hide();
    });
  }
}
