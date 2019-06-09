import { TestBed, inject } from '@angular/core/testing';

import { CepHostService } from './cep-host.service';

describe('CepHostService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CepHostService]
    });
  });

  it('should be created', inject([CepHostService], (service: CepHostService) => {
    expect(service).toBeTruthy();
  }));
});
