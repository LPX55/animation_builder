import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiSliderComponent } from './multi-slider.component';

describe('MultiSliderComponent', () => {
  let component: MultiSliderComponent;
  let fixture: ComponentFixture<MultiSliderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiSliderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
