import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpreadsheetDetailComponent } from './spreadsheet-detail.component';

describe('SpreadsheetDetailComponent', () => {
  let component: SpreadsheetDetailComponent;
  let fixture: ComponentFixture<SpreadsheetDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpreadsheetDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpreadsheetDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
