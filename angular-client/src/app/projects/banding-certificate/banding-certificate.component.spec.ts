import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BandingCertificateComponent } from './banding-certificate.component';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { ReferenceDataService } from '../../services/reference-data.service';
import { of } from 'rxjs';
import { CertificationService } from '../../services/certification.service';

describe('BandingCertificateComponent', () => {
  let component: BandingCertificateComponent;
  let fixture: ComponentFixture<BandingCertificateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [PopoverModule.forRoot()],
      declarations: [BandingCertificateComponent],
      providers: [
        {
          provide: ReferenceDataService,
          useValue: {
            speciesGroupSubject: of([])
          }
        },
        {
          provide: CertificationService,
          useValue: {
            getCertifications: () => of([])
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BandingCertificateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
