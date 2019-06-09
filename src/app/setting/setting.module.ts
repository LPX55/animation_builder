import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingRoutingModule } from './setting-routing.module';
import { SettingControllerService } from './services/setting-controller.service';
import { SliderControllerComponent } from './components/controllers/slider-controller/slider-controller.component';
import { FormsModule } from '@angular/forms';
import { CheckboxControllerComponent } from './components/controllers/checkbox-controller/checkbox-controller.component';
import { TextControllerComponent } from './components/controllers/text-controller/text-controller.component';
import { SharedModule } from '../shared/shared.module';
import { GroupControllerComponent } from './components/controllers/group-controller/group-controller.component';
import { ColorControllerComponent } from './components/controllers/color-controller/color-controller.component';
import { MultiSliderComponent } from './components/controllers/multi-slider/multi-slider.component';
import { DegreeControllerComponent } from './components/controllers/degree-controller/degree-controller.component';
import { PremiereSettingContainerComponent } from './components/premiere-setting-container/premiere-setting-container.component';
import { AftereffectsSettingContainerComponent} from './components/aftereffects-setting-container/aftereffects-setting-container.component';
import { MultilineTextControllerComponent } from './components/controllers/multiline-text-controller/multiline-text-controller.component';
import { ClockControllerComponent } from './components/controllers/clock-controller/clock-controller.component';
import { DropDownControllerComponent } from './components/controllers/drop-down-controller/drop-down-controller.component';
import { LayerSettingComponent } from './components/layer-setting/layer-setting.component';
import { AnimationbuilderSettingComponent } from './components/animationbuilder-setting/animationbuilder-setting.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SettingRoutingModule,
    SharedModule
  ],
  providers: [
    SettingControllerService
  ],
  declarations: [
    PremiereSettingContainerComponent,
    AftereffectsSettingContainerComponent,
    SliderControllerComponent,
    CheckboxControllerComponent,
    TextControllerComponent,
    ColorControllerComponent,
    GroupControllerComponent,
    MultiSliderComponent,
    DegreeControllerComponent,
    MultilineTextControllerComponent,
    ClockControllerComponent,
    DropDownControllerComponent,
    LayerSettingComponent,
    AnimationbuilderSettingComponent
  ]
})
export class SettingModule { }
