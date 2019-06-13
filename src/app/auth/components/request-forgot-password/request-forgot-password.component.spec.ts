import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestForgotPasswordComponent } from './request-forgot-password.component';

describe('RequestForgotPasswordComponent', () => {
  let component: RequestForgotPasswordComponent;
  let fixture: ComponentFixture<RequestForgotPasswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestForgotPasswordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
