import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimationFilterComponent } from './animation-filter.component';

describe('AnimationFilterComponent', () => {
  let component: AnimationFilterComponent;
  let fixture: ComponentFixture<AnimationFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnimationFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimationFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
