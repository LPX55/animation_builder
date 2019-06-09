import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimationSidebarComponent } from './animation-sidebar.component';

describe('AnimationSidebarComponent', () => {
  let component: AnimationSidebarComponent;
  let fixture: ComponentFixture<AnimationSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnimationSidebarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimationSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
