import { TestBed } from '@angular/core/testing';

import { PreviousRouteService } from './previous-route.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('PreviousRoueService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule]
    })
  );

  it('should be created', () => {
    const service: PreviousRouteService = TestBed.inject(PreviousRouteService);
    expect(service).toBeTruthy();
  });
});
