import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LayerSettingComponent } from './layer-setting.component';

describe('LayerSettingComponent', () => {
  let component: LayerSettingComponent;
  let fixture: ComponentFixture<LayerSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LayerSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LayerSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
