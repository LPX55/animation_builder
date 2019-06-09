import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextControllerComponent } from './text-controller.component';

describe('TextControllerComponent', () => {
  let component: TextControllerComponent;
  let fixture: ComponentFixture<TextControllerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextControllerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
