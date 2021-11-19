import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { ExportModalComponent } from './export-modal.component';
import { Router } from '@angular/router';
import { ExportService } from '../services/export.service';
import { of } from 'rxjs';
import { LoggingService } from '../../services/logging.service';

describe('ExportModalComponent', () => {
  let component: ExportModalComponent;
  let fixture: ComponentFixture<ExportModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExportModalComponent],
      providers: [
        { provide: BsModalRef, useValue: {} },
        {
          provide: Router,
          useValue: {
            navigate: () => Promise.resolve()
          }
        },
        {
          provide: ExportService,
          useValue: {
            requestDownload: () => of([])
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
    fixture = TestBed.createComponent(ExportModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
