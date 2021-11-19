import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadSpreadsheetComponent } from './upload-spreadsheet.component';
import { RouterTestingModule } from '@angular/router/testing';
import { Component } from '@angular/core';

@Component({
  selector: 'app-spreadsheet-validator',
  template: '<div></div>'
})
class TestSpreadsheetValidatorComponent {}

describe('UploadSpreadsheetComponent', () => {
  let component: UploadSpreadsheetComponent;
  let fixture: ComponentFixture<UploadSpreadsheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [UploadSpreadsheetComponent, TestSpreadsheetValidatorComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadSpreadsheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
