import { UserManagerService } from "../../../core/services/user-manager/user-manager.service";
import { Component, OnInit } from "@angular/core";
import {
  FormGroup,
  FormControl,
  Validators,
  AbstractControl
} from "@angular/forms";

@Component({
  selector: "mf-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
})
export class LoginComponent {
  loginMessage = "";
  loggedinSuccessfully = false;
  /**
   * @param Object registerForm
   * Tracks the value and validity state of a group
   */
  loginForm = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email]),
    password: new FormControl("", [
      Validators.required,
      Validators.minLength(6)
    ])
  });

  constructor(private userManagerService: UserManagerService) {}

  get email(): AbstractControl {
    return this.loginForm.get("email");
  }

  get password(): AbstractControl {
    return this.loginForm.get("password");
  }

  get sendingRequest(): boolean {
    return this.userManagerService.sendingRequest;
  }

  get displayResendActivationEmail(): boolean {
    return this.userManagerService.displayResendActivationEmail;
  }

  async login(e): Promise<void> {
    // e.preventDefault();
    // const response = await this.userManagerService.login(this.loginForm);
    // if (response.result) {
    //   this.loggedinSuccessfully = true;
    // } else {
    //   this.loginMessage = response.msg;
    // }
  }

  /**
   * uses resendActivationEmail method in user manager service to get the result
   * @public
   * @since 0.0.1
   */
  async resendActivationEmail(): Promise<void> {
    this.loginMessage = "";
    const response = await this.userManagerService.resendActivationEmail(
      this.loginForm.value.email
    );
    this.loginMessage = response.msg;
  }

  goToSignup(e): void {
    e.preventDefault();
    this.userManagerService.currentPage = "register";
  }

  goToForgotPassword(e): void {
    e.preventDefault();
    this.userManagerService.currentPage = "forgot-password";
  }

  /**
   * prevents displaying form errors immediately after user clicks on an empty input and adds value the second time
   * @since 0.0.1
   * @return {void}
   */
  markAsUntouched(): void {
    if (!this.loginForm.dirty) {
      this.loginForm.markAsUntouched();
    }
  }
}
