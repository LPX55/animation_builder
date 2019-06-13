import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthContainerComponent } from './auth-container.component';

describe('AuthContainerComponent', () => {
  let component: AuthContainerComponent;
  let fixture: ComponentFixture<AuthContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
