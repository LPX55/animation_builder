import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultilineTextControllerComponent } from './multiline-text-controller.component';

describe('MultilineTextControllerComponent', () => {
  let component: MultilineTextControllerComponent;
  let fixture: ComponentFixture<MultilineTextControllerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MultilineTextControllerComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultilineTextControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
