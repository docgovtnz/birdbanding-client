import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CertificationService, PersonCertificate } from '../../services/certification.service';
import { ReferenceDataService, SpeciesGroup } from '../../services/reference-data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-banding-certificate',
  templateUrl: './banding-certificate.component.html',
  styleUrls: ['./banding-certificate.component.scss'],
})
export class BandingCertificateComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();

  certifications: PersonCertificate[] = [];

  constructor(private certificationService: CertificationService, private referenceDataService: ReferenceDataService) {}

  @Input()
  personId: string;

  loading = true;

  ngOnInit() {
    this.referenceDataService.speciesGroupSubject.pipe(takeUntil(this.destroy$)).subscribe((speciesGroups) => {
      this.certificationService
        .getCertifications(this.personId)
        .pipe(takeUntil(this.destroy$))
        .subscribe((certifications) => {
          this.certifications = certifications.map(certificationToSpeciesCertification(speciesGroups));
          this.loading = false;
        });
    });
  }
  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}

// takes a species group list and returns a function that maps a given certification, to a certification with the
// speciesGroup details include for that certification speciesGroupId
const certificationToSpeciesCertification = (speciesGroups: SpeciesGroup[]) => (certification: PersonCertificate): PersonCertificate => {
  if (certification.certificationType === 'SPECIES_GROUP') {
    certification.speciesGroup = speciesGroups.find((sg) => sg.id === certification.speciesGroupId);
    return certification;
  } else {
    return certification;
  }
};
