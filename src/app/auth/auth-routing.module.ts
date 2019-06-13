import { ForgotChangePasswordComponent } from "./components/forgot-change-password/forgot-change-password.component";
import { RequestForgotPasswordComponent } from "./components/request-forgot-password/request-forgot-password.component";
import { AuthGuard } from "./../guards/auth-guard.service";
import { AuthCheckInboxComponent } from "./components/auth-check-inbox/auth-check-inbox.component";
import { NoInternetComponent } from "./components/no-internet/no-internet.component";
import { QuestionsComponent } from "./components/questions/questions.component";
import { RegisterComponent } from "./components/register/register.component";
import { EmailLoginComponent } from "./components/email-login/email-login.component";
import { AuthWrapperComponent } from "./components/auth-wrapper/auth-wrapper.component";
import { SocialLoginComponent } from "./components/social-login/social-login.component";
import { AuthContainerComponent } from "./components/auth-container/auth-container.component";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

const routes: Routes = [
  {
    path: "",
    component: AuthContainerComponent,
    children: [
      {
        path: "sign",
        component: AuthWrapperComponent,
        children: [
          {
            path: "sign-up",
            children: [
              { path: "", component: SocialLoginComponent },
              { path: "social", component: SocialLoginComponent },
              {
                path: "register",
                children: [
                  { path: "", component: RegisterComponent },
                  { path: "check", component: AuthCheckInboxComponent }
                ]
              }
            ]
          },
          {
            path: "login",
            children: [
              { path: "", component: EmailLoginComponent },
              {
                path: "forgot-password",
                children: [
                  { path: "", component: RequestForgotPasswordComponent },
                  {
                    path: "change-password",
                    component: ForgotChangePasswordComponent
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        path: "questions",
        component: QuestionsComponent,
        canActivate: [AuthGuard]
      },
      { path: "no-internet", component: NoInternetComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {}
