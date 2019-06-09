import { TestBed, inject } from '@angular/core/testing';

import { OsInfoService } from './os-info.service';

describe('OsInfoService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OsInfoService]
    });
  });

  it('should be created', inject([OsInfoService], (service: OsInfoService) => {
    expect(service).toBeTruthy();
  }));
});
