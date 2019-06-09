import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SliderControllerComponent } from './slider-controller.component';

describe('SliderControllerComponent', () => {
  let component: SliderControllerComponent;
  let fixture: ComponentFixture<SliderControllerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SliderControllerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SliderControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
