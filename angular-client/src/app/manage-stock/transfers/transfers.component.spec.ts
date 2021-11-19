import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransfersComponent } from './transfers.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { FormsModule } from '@angular/forms';
import { BandTransferService } from '../services/band-transfer.service';
import { AuthenticationService } from '../../authentication/authentication.service';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

describe('TransfersComponent', () => {
  let component: TransfersComponent;
  let fixture: ComponentFixture<TransfersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, FormsModule, TypeaheadModule.forRoot(), PaginationModule.forRoot()],
      declarations: [TransfersComponent],
      providers: [
        {
          provide: AuthenticationService,
          useValue: {
            identitySubject: of({})
          }
        },
        {
          provide: BandTransferService,
          useValue: {
            getPeople: () => of([])
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransfersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
