import { TestBed, inject } from '@angular/core/testing';

import { FileSelectorService } from './file-selector.service';

describe('FileSelectorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FileSelectorService]
    });
  });

  it('should be created', inject([FileSelectorService], (service: FileSelectorService) => {
    expect(service).toBeTruthy();
  }));
});
