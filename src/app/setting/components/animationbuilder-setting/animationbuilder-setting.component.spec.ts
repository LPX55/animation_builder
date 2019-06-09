import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimationbuilderSettingComponent } from './animationbuilder-setting.component';

describe('AnimationbuilderSettingComponent', () => {
  let component: AnimationbuilderSettingComponent;
  let fixture: ComponentFixture<AnimationbuilderSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnimationbuilderSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimationbuilderSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
