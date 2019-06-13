import { TestBed, inject } from '@angular/core/testing';

import { AutoUpdateService } from './auto-update.service';

describe('AutoUpdateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AutoUpdateService]
    });
  });

  it('should be created', inject([AutoUpdateService], (service: AutoUpdateService) => {
    expect(service).toBeTruthy();
  }));
});
