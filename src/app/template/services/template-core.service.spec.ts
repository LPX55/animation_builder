import { TestBed, inject } from '@angular/core/testing';

import { TemplateCoreService } from './template-core.service';

describe('TemplateCoreService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TemplateCoreService]
    });
  });

  it('should be created', inject([TemplateCoreService], (service: TemplateCoreService) => {
    expect(service).toBeTruthy();
  }));
});
