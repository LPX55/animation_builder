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
  selector: "mf-email-login",
  templateUrl: "./email-login.component.html",
  styleUrls: ["./email-login.component.scss"]
})
export class EmailLoginComponent implements OnInit {
  public loginLoading = false;
  public resendLoading = false;
  public displayResendActivationEmail = false;
  public errors = [];

  /**
   * @param Object registerForm
   * Tracks the value and validity state of a group
   */
  loginForm = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email]),
    password: new FormControl("", [Validators.required])
  });

  constructor(
    private _userManagerService: UserManagerService,
    private _logManagerSerivice: LogManagerService,
    private _router: Router
  ) {}

  ngOnInit() {}

  get emailControl(): AbstractControl {
    return this.loginForm.get("email");
  }

  get passwordControl(): AbstractControl {
    return this.loginForm.get("password");
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

  async login(e): Promise<void> {
    e.preventDefault();
    this.loginLoading = true;
    this.errors = [];
    const {
      value: { email, password }
    } = this.loginForm;
    const response = await this._userManagerService.login(email, password);
    this.loginLoading = false;
    if (response.result) {
      this._logManagerSerivice.trackRegisterEvent(
        response.userID,
        response.email
      );
      this._router.navigate(["auth", "questions"]);
    } else {
      if (
        false === response.result &&
        "not verified" === response["verifiedStatus"]
      ) {
        this.displayResendActivationEmail = true;
      }
      this.errors.push(response.msg.replace("\n", "<br/>"));
    }
  }

  async resendActivationEmail(): Promise<void> {
    this.resendLoading = true;
    this.errors = [];
    const {
      value: { email }
    } = this.loginForm;
    const response = await this._userManagerService.resendActivationEmail(
      email
    );
    this.resendLoading = false;
    this.displayResendActivationEmail = false;
    this.errors.push(response.msg);
  }
}
