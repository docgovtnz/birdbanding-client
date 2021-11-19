import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewExportsComponent } from './view-exports.component';
import { ExportService } from '../services/export.service';
import { of } from 'rxjs';

describe('ViewExportsComponent', () => {
  let component: ViewExportsComponent;
  let fixture: ComponentFixture<ViewExportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewExportsComponent],
      providers: [
        {
          provide: ExportService,
          useValue: {
            getAvailableDownloads: () => {},
            downloadsSubject: of([])
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewExportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
