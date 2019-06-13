import { TestBed, inject } from '@angular/core/testing';

import { LogManagerService } from './log-manager.service';

describe('LogManagerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LogManagerService]
    });
  });

  it('should be created', inject([LogManagerService], (service: LogManagerService) => {
    expect(service).toBeTruthy();
  }));
});
