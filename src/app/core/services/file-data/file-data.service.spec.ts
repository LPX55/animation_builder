import { TestBed, inject } from '@angular/core/testing';

import { FileDataService } from './file-data.service';

describe('MogrtDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FileDataService]
    });
  });

  it('should be created', inject([FileDataService], (service: FileDataService) => {
    expect(service).toBeTruthy();
  }));
});
