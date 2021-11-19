import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DuplicateModalComponent } from './duplicate-modal.component';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

describe('DuplicateModalComponent', () => {
  let component: DuplicateModalComponent;
  let fixture: ComponentFixture<DuplicateModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [DuplicateModalComponent],
      providers: [
        { provide: BsModalRef, useValue: {} },
        {
          provide: Router,
          useValue: {
            navigate: () => Promise.resolve()
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DuplicateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
