import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimationItemPreviewComponent } from './animation-item-preview.component';

describe('AnimationItemPreviewComponent', () => {
  let component: AnimationItemPreviewComponent;
  let fixture: ComponentFixture<AnimationItemPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnimationItemPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimationItemPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
