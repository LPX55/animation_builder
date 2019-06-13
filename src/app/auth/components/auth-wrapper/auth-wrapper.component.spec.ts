import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthWrapperComponent } from './auth-wrapper.component';

describe('AuthWrapperComponent', () => {
  let component: AuthWrapperComponent;
  let fixture: ComponentFixture<AuthWrapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthWrapperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
