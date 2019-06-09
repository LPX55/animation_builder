import { TestBed, inject } from '@angular/core/testing';

import { JsxInjectorService } from './jsx-injector.service';

describe('JsxInjectorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JsxInjectorService]
    });
  });

  it('should be created', inject([JsxInjectorService], (service: JsxInjectorService) => {
    expect(service).toBeTruthy();
  }));
});
