import { TestBed } from '@angular/core/testing';

import { BandsService } from './bands.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('BandsService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    })
  );

  it('should be created', () => {
    const service: BandsService = TestBed.inject(BandsService);
    expect(service).toBeTruthy();
  });
});
