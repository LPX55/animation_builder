import { DashboardWrapperComponent } from "./dashboard-wrapper.component";
import { AuthGuard } from "./guards/auth-guard.service";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

const routes: Routes = [
  {
    path: "",
    redirectTo: "auth/questions",
    pathMatch: "full"
  },
  {
    path: "auth",
    loadChildren: "./auth/auth.module#AuthModule",
    data: { animation: "template" }
  },
  {
    path: "dashboard",
    component: DashboardWrapperComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "template",
        loadChildren: "./template/template.module#TemplateModule",
        data: { animation: "template" }
      },
      {
        path: "market",
        loadChildren: "./market/market.module#MarketModule",
        data: { animation: "market" }
      },
      {
        path: "setting",
        loadChildren: "./setting/setting.module#SettingModule"
      },
      {
        path: "animation",
        loadChildren: "./animation/animation.module#AnimationModule"
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
