import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorControllerComponent } from './color-controller.component';

describe('ColorControllerComponent', () => {
  let component: ColorControllerComponent;
  let fixture: ComponentFixture<ColorControllerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ColorControllerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
