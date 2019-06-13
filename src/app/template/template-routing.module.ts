import { TemplatePackComponent } from './components/template-pack/template-pack.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TemplateListComponent } from './components/template-list/template-list.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';

const routes: Routes = [
  { path: '', component: TemplateListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TemplateRoutingModule { }
