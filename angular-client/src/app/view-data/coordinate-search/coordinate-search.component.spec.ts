import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoordinateSearchComponent } from './coordinate-search.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('CoordinateSearchComponent', () => {
  let component: CoordinateSearchComponent;
  let fixture: ComponentFixture<CoordinateSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [CoordinateSearchComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoordinateSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
