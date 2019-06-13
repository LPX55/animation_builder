import { Component, OnInit } from "@angular/core";
import {
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  ValidatorFn
} from "@angular/forms";
import { UserManagerService } from "../../../core/services/user-manager/user-manager.service";

@Component({
  selector: "mf-forgot-password",
  templateUrl: "./forgot-password.component.html",
  styleUrls: ["./forgot-password.component.scss"]
})
export class ForgotPasswordComponent implements OnInit {
  // forgot password step
  public changePasswordStep = 1;
  // token of forgot password
  private _forgotPasswordToken: string;
  // message of forgot password
  public forgotPasswordMessage: string;
  /**
   * @param Object forgot password step one form
   * Tracks the value and validity state of a group
   */
  forgotPasswordFirstForm = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email])
  });

  /**
   * @param Object forgot password step 2 form
   * Tracks the value and validity state of a group
   */
  forgotPasswordSecondForm = new FormGroup({
    code: new FormControl("", [Validators.required]),
    password: new FormControl("", [
      Validators.required,
      Validators.minLength(6)
    ]),
    repassword: new FormControl("", [
      Validators.required,
      Validators.minLength(6),
      this.matchOtherValidator("password")
    ])
  });

  constructor(private userManagerService: UserManagerService) {}

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

  get email(): AbstractControl {
    return this.forgotPasswordFirstForm.get("email");
  }

  get code(): AbstractControl {
    return this.forgotPasswordSecondForm.get("code");
  }

  get password(): AbstractControl {
    return this.forgotPasswordSecondForm.get("password");
  }

  get repassword(): AbstractControl {
    return this.forgotPasswordSecondForm.get("repassword");
  }

  get sendingRequest(): boolean {
    return this.userManagerService.sendingRequest;
  }

  /**
   * Sends a token request for changing password to server
   *
   * @example requestToken($event)
   *
   * @param {$event} - an event
   * @return {void}
   */
  async requestToken(e): Promise<void> {
    e.preventDefault();
    this.forgotPasswordMessage = "";
    const response = await this.userManagerService.forgotPasswordRequestToken(
      this.forgotPasswordFirstForm.value.email
    );
    if (response.result) {
      this._forgotPasswordToken = response.token;
      this.changePasswordStep = 2;
    } else {
      this.forgotPasswordMessage = response.msg;
    }
  }

  /**
   * Sends new password to server
   *
   * @example sendPassword($event)
   *
   * @param {$event} - an event
   * @return {void}
   */
  async sendPassword(e): Promise<any> {
    // e.preventDefault();
    // this.forgotPasswordMessage = '';
    // const response = await this.userManagerService.setNewPassword(this._forgotPasswordToken, this.forgotPasswordSecondForm);
    // if (response.result) {
    //   this.backToSignin();
    // } else {
    //   this.forgotPasswordMessage = response.msg;
    // }
  }

  /**
   * changes view to login form
   *
   * @example backToSignin()
   *
   * @return {void}
   */
  backToSignin(): void {
    this.userManagerService.currentPage = "login";
  }

  ngOnInit(): void {}
}
