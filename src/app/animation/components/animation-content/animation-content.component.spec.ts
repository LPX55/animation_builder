import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimationContentComponent } from './animation-content.component';

describe('AnimationContentComponent', () => {
  let component: AnimationContentComponent;
  let fixture: ComponentFixture<AnimationContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnimationContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimationContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
