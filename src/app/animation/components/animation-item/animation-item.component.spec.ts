import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimationItemComponent } from './animation-item.component';

describe('AnimationItemComponent', () => {
  let component: AnimationItemComponent;
  let fixture: ComponentFixture<AnimationItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnimationItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimationItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
