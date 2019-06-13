import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthSelectInputComponent } from './auth-select-input.component';

describe('AuthSelectInputComponent', () => {
  let component: AuthSelectInputComponent;
  let fixture: ComponentFixture<AuthSelectInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthSelectInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthSelectInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
