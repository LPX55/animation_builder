import { TestBed, inject } from '@angular/core/testing';

import { VideoProcessorService } from './video-processor.service';

describe('VideoProcessorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VideoProcessorService]
    });
  });

  it('should be created', inject([VideoProcessorService], (service: VideoProcessorService) => {
    expect(service).toBeTruthy();
  }));
});
