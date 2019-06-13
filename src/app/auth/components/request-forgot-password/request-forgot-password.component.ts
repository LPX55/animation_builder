import { Router } from "@angular/router";
import { LogManagerService } from "./../../../core/services/log-manager/log-manager.service";
import { UserManagerService } from "./../../../core/services/user-manager/user-manager.service";
import {
  FormGroup,
  Validators,
  FormControl,
  AbstractControl
} from "@angular/forms";
import { Component, OnInit } from "@angular/core";

@Component({
  selector: "mf-request-forgot-password",
  templateUrl: "./request-forgot-password.component.html",
  styleUrls: ["./request-forgot-password.component.scss"]
})
export class RequestForgotPasswordComponent implements OnInit {
  public requestForgotPasswordLoading = false;
  public errors = [];

  /**
   * @param Object registerForm
   * Tracks the value and validity state of a group
   */
  requestForgotPasswordForm = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email])
  });

  constructor(
    private _userManagerService: UserManagerService,
    private _logManagerSerivice: LogManagerService,
    private _router: Router
  ) {}

  ngOnInit() {}

  get emailControl(): AbstractControl {
    return this.requestForgotPasswordForm.get("email");
  }

  /**
   * prevents displaying form errors immediately after user clicks on an empty input and adds value the second time
   * @since 0.0.1
   * @return {void}
   */
  markAsUntouched(): void {
    if (!this.requestForgotPasswordForm.dirty) {
      this.requestForgotPasswordForm.markAsUntouched();
    }
  }

  async requestForgotPassword(e): Promise<void> {
    e.preventDefault();
    this.requestForgotPasswordLoading = true;
    this.errors = [];
    const {
      value: { email }
    } = this.requestForgotPasswordForm;
    const response = await this._userManagerService.forgotPasswordRequestToken(
      email
    );
    this.requestForgotPasswordLoading = false;
    if (response.result) {
      this._router.navigate([
        "auth",
        "sign",
        "login",
        "forgot-password",
        "change-password"
      ]);
    } else {
      this.errors.push(response.msg.replace("\n", "<br/>"));
    }
  }

  backToLogin() {
    this._router.navigate(["auth", "sign", "login"]);
  }
}
