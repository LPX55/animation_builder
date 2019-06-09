import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimationItemLoaderComponent } from './animation-item-loader.component';

describe('AnimationItemLoaderComponent', () => {
  let component: AnimationItemLoaderComponent;
  let fixture: ComponentFixture<AnimationItemLoaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnimationItemLoaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimationItemLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
