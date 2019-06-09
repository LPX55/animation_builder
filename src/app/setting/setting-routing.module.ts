import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PremiereSettingContainerComponent } from './components/premiere-setting-container/premiere-setting-container.component';
import {
  AftereffectsSettingContainerComponent
} from './components/aftereffects-setting-container/aftereffects-setting-container.component';


const routes: Routes = [
  { path: 'PPRO', component:  PremiereSettingContainerComponent},
  { path: 'AEFT', component:  AftereffectsSettingContainerComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingRoutingModule { }
