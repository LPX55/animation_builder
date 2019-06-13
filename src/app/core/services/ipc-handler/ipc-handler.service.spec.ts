import { TestBed, inject } from '@angular/core/testing';

import { IpcHandlerService } from './ipc-handler.service';

describe('IpcHandlerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IpcHandlerService]
    });
  });

  it('should be created', inject([IpcHandlerService], (service: IpcHandlerService) => {
    expect(service).toBeTruthy();
  }));
});
