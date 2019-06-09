import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimationCategoryComponent } from './animation-category.component';

describe('AnimationCategoryComponent', () => {
  let component: AnimationCategoryComponent;
  let fixture: ComponentFixture<AnimationCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnimationCategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimationCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
