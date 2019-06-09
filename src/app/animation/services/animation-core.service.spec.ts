import { TestBed, inject } from '@angular/core/testing';

import { AnimationCoreService } from './animation-core.service';

describe('AnimationCoreService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AnimationCoreService]
    });
  });

  it('should be created', inject([AnimationCoreService], (service: AnimationCoreService) => {
    expect(service).toBeTruthy();
  }));
});
