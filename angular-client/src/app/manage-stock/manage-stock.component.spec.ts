import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageStockComponent } from './manage-stock.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthenticationService } from '../authentication/authentication.service';
import { of } from 'rxjs';

describe('ManageStockComponent', () => {
  let component: ManageStockComponent;
  let fixture: ComponentFixture<ManageStockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, ReactiveFormsModule],
      declarations: [ManageStockComponent],
      providers: [
        {
          provide: AuthenticationService,
          useValue: {
            identitySubject: of({})
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
