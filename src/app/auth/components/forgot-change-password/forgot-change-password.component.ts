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
  selector: "mf-forgot-change-password",
  templateUrl: "./forgot-change-password.component.html",
  styleUrls: ["./forgot-change-password.component.scss"]
})
export class ForgotChangePasswordComponent implements OnInit {
  public forgotChangePasswordLoading = false;
  public errors = [];

  forgotChangePasswordForm = new FormGroup({
    resetCode: new FormControl("", [Validators.required]),
    password: new FormControl("", [
      Validators.required,
      Validators.minLength(6)
    ]),
    confirmPassword: new FormControl("", [
      Validators.required,
      Validators.minLength(6),
      this.matchOtherValidator("password")
    ])
  });

  constructor(
    private _userManagerService: UserManagerService,
    private _logManagerSerivice: LogManagerService,
    private _router: Router
  ) {}

  ngOnInit() {}

  /**
   * Compares the value of 2 form controls together
   *
   * @example matchOtherValidator('password')
   *
   * @param {string} otherControlName - Name of other control.
   * @return {function} - a function which returns a boolean
   */
  matchOtherValidator(
    otherControlName: string
  ): (control: FormControl) => { matchOther: boolean } {
    let thisControl: FormControl, otherControl: FormControl;

    const innerValidation = (control: FormControl): { matchOther: boolean } => {
      if (!control.parent) {
        return null;
      }

      if (!thisControl) {
        thisControl = control;
        otherControl = control.parent.get(otherControlName) as FormControl;
        if (!otherControl) {
          throw new Error(
            "matchOtherValidator(): other control is not found in parent group"
          );
        }
        otherControl.valueChanges.subscribe(() => {
          thisControl.updateValueAndValidity();
        });
      }

      if (!otherControl) {
        return null;
      }

      if (otherControl.value !== thisControl.value) {
        return {
          matchOther: true
        };
      }
      return null;
    };
    return innerValidation;
  }

  get resetCodeControl(): AbstractControl {
    return this.forgotChangePasswordForm.get("resetCode");
  }

  get passwordControl(): AbstractControl {
    return this.forgotChangePasswordForm.get("password");
  }

  get confirmPasswordControl(): AbstractControl {
    return this.forgotChangePasswordForm.get("confirmPassword");
  }

  /**
   * prevents displaying form errors immediately after user clicks on an empty input and adds value the second time
   * @since 0.0.1
   * @return {void}
   */
  markAsUntouched(): void {
    if (!this.forgotChangePasswordForm.dirty) {
      this.forgotChangePasswordForm.markAsUntouched();
    }
  }

  async setPassword(e): Promise<void> {
    e.preventDefault();
    this.forgotChangePasswordLoading = true;
    this.errors = [];
    const {
      value: { resetCode, password }
    } = this.forgotChangePasswordForm;
    const response = await this._userManagerService.setNewPassword({
      resetCode,
      password
    });

    this.forgotChangePasswordLoading = false;
    if (response.result) {
      this._router.navigate(["auth", "sign", "login"]);
    } else {
      this.errors.push(response.msg.replace("\n", "<br/>"));
    }
  }
}
