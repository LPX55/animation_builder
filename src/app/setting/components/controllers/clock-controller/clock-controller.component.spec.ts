import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClockControllerComponent } from './clock-controller.component';

describe('ClockControllerComponent', () => {
  let component: ClockControllerComponent;
  let fixture: ComponentFixture<ClockControllerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClockControllerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClockControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
