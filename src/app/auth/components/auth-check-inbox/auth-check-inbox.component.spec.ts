import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthCheckInboxComponent } from './auth-check-inbox.component';

describe('AuthCheckInboxComponent', () => {
  let component: AuthCheckInboxComponent;
  let fixture: ComponentFixture<AuthCheckInboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthCheckInboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthCheckInboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
