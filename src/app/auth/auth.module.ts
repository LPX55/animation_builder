import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AuthService } from "./services/auth.service";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AuthRoutingModule } from "./auth-routing.module";
import { TopBannerComponent } from "./components/top-banner/top-banner.component";
import { AuthContainerComponent } from "./components/auth-container/auth-container.component";
import { AuthButtonComponent } from "./components/auth-button/auth-button.component";
import { AuthTabsComponent } from "./components/auth-tabs/auth-tabs.component";
import { SocialLoginComponent } from "./components/social-login/social-login.component";
import { EmailLoginComponent } from "./components/email-login/email-login.component";
import { RegisterComponent } from "./components/register/register.component";
import { QuestionsComponent } from "./components/questions/questions.component";
import { AuthSelectInputComponent } from "./components/auth-select-input/auth-select-input.component";
import { NoInternetComponent } from "./components/no-internet/no-internet.component";
import { AuthWrapperComponent } from "./components/auth-wrapper/auth-wrapper.component";
import { AuthFooterComponent } from "./components/auth-footer/auth-footer.component";
import { AuthTextInputComponent } from "./components/auth-text-input/auth-text-input.component";
import { AuthCheckInboxComponent } from "./components/auth-check-inbox/auth-check-inbox.component";
import { AuthErrorComponent } from "./components/auth-error/auth-error.component";
import { RequestForgotPasswordComponent } from "./components/request-forgot-password/request-forgot-password.component";
import { ForgotChangePasswordComponent } from "./components/forgot-change-password/forgot-change-password.component";

@NgModule({
  declarations: [
    TopBannerComponent,
    AuthContainerComponent,
    AuthButtonComponent,
    AuthTabsComponent,
    SocialLoginComponent,
    EmailLoginComponent,
    RegisterComponent,
    QuestionsComponent,
    AuthSelectInputComponent,
    NoInternetComponent,
    AuthWrapperComponent,
    AuthFooterComponent,
    AuthTextInputComponent,
    AuthCheckInboxComponent,
    AuthErrorComponent,
    RequestForgotPasswordComponent,
    ForgotChangePasswordComponent
  ],
  imports: [CommonModule, AuthRoutingModule, FormsModule, ReactiveFormsModule],
  providers: [AuthService]
})
export class AuthModule {}
