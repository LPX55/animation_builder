import { UserManagerService } from './user-manager.service';
import { TestBed, inject } from '@angular/core/testing';


describe('UserManagerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserManagerService]
    });
  });

  it('should be created', inject([UserManagerService], (service: UserManagerService) => {
    expect(service).toBeTruthy();
  }));
});
