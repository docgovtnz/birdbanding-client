import { Component, Input, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { EventDataService } from '../services/event-data.service';
import { LoggingService } from '../../services/logging.service';
import { SearchDataService } from '../services/search-data.service';

@Component({
  selector: 'app-confirm-delete',
  templateUrl: './confirm-delete.component.html',
  styleUrls: ['./confirm-delete.component.scss']
})
export class ConfirmDeleteComponent implements OnInit {
  @Input()
  eventId: string;

  loading = false;

  hasError = false;

  errorMessage = '';

  constructor(
    public modalRef: BsModalRef,
    private router: Router,
    private eventDataService: EventDataService,
    private loggingService: LoggingService,
    private searchDataService: SearchDataService
  ) {}

  ngOnInit(): void {}

  deleteEvent() {
    this.loading = true;
    this.hasError = false;
    this.errorMessage = '';
    this.eventDataService.deleteEvent(this.eventId).subscribe(
      r => {
        this.loading = false;
        // refresh search results
        this.searchDataService.searchAgain();
        this.router.navigate(['/view-data']).then(_ => {
          this.modalRef.hide();
        });
      },
      error => {
        this.loading = false;
        this.loggingService.logError(`Could not delete event ${this.eventId}: ${JSON.stringify(error)}`);
        this.errorMessage = 'Unable to delete event, please contact support';
        this.hasError = true;
      }
    );
  }
}
