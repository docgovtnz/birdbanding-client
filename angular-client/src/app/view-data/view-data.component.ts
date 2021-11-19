import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReferenceDataService } from '../services/reference-data.service';
import { ExportService } from './services/export.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-view-data',
  templateUrl: './view-data.component.html',
  styleUrls: ['./view-data.component.scss'],
})
export class ViewDataComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private referenceDataService: ReferenceDataService, private exportService: ExportService) {}

  numberOfDownloads: number;

  ngOnInit() {
    this.referenceDataService.loadReferenceData();
    this.exportService.numberOfDownloads.pipe(takeUntil(this.destroy$)).subscribe((newNumber) => (this.numberOfDownloads = newNumber));
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
