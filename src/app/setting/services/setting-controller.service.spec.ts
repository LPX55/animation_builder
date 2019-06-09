import { TestBed, inject } from '@angular/core/testing';

import { SettingControllerService } from './setting-controller.service';

describe('SettingControllerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SettingControllerService]
    });
  });

  it('should be created', inject([SettingControllerService], (service: SettingControllerService) => {
    expect(service).toBeTruthy();
  }));
});
