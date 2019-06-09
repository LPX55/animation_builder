import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimationHeaderComponent } from './animation-header.component';

describe('AnimationHeaderComponent', () => {
  let component: AnimationHeaderComponent;
  let fixture: ComponentFixture<AnimationHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnimationHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimationHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
