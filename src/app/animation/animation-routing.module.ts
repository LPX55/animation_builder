import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AnimationHomeComponent } from './components/animation-home/animation-home.component';

const routes: Routes = [
  { path: '', component: AnimationHomeComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnimationRoutingModule { }

