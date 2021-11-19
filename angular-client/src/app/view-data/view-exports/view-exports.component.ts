import { Component, OnDestroy, OnInit } from '@angular/core';

import { ExportService, ExportDescription } from '../services/export.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-view-exports',
  templateUrl: './view-exports.component.html',
  styleUrls: ['./view-exports.component.scss'],
})
export class ViewExportsComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();

  exportsCount = 0;

  exports: ExportDescription[] = [];

  constructor(private exportService: ExportService) {}

  ngOnInit() {
    this.exportService.downloadsSubject.pipe(takeUntil(this.destroy$)).subscribe((exports) => {
      this.exports = exports;
      this.exportsCount = exports.length;
    });
    this.exportService.getAvailableDownloads();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  refresh() {
    this.exportService.getAvailableDownloads();
  }

  descriptionToIcon(exportDescription: ExportDescription) {
    if (exportDescription.isInProgress) {
      return 'watch_later';
    }
    if (exportDescription.isAvailable) {
      return 'check';
    }
    if (exportDescription.approvalRequired) {
      return 'priority_high';
    }
    if (exportDescription.hasError) {
      return 'cancel';
    }
  }
}
