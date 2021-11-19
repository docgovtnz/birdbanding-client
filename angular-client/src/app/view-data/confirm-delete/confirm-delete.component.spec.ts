import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDeleteComponent } from './confirm-delete.component';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { SearchDataService } from '../services/search-data.service';
import { EventDataService } from '../services/event-data.service';
import { of } from 'rxjs';
import { LoggingService } from '../../services/logging.service';

describe('ConfirmDeleteComponent', () => {
  let component: ConfirmDeleteComponent;
  let fixture: ComponentFixture<ConfirmDeleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmDeleteComponent],
      providers: [
        {
          provide: BsModalRef,
          useValue: {
            hide: () => {}
          }
        },
        {
          provide: Router,
          useValue: {
            navigate: () => Promise.resolve()
          }
        },
        {
          provide: SearchDataService,
          useValue: {
            searchAgain: () => {}
          }
        },
        {
          provide: EventDataService,
          useValue: {
            deleteEvent: () => of({})
          }
        },
        {
          provide: LoggingService,
          useValue: {
            logError: () => {}
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
