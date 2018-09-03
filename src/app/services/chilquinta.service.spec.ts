import { TestBed, inject } from '@angular/core/testing';

import { ChilquintaService } from './chilquinta.service';

describe('ChilquintaService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChilquintaService]
    });
  });

  it('should be created', inject([ChilquintaService], (service: ChilquintaService) => {
    expect(service).toBeTruthy();
  }));
});
