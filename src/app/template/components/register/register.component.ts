import { UserManagerService } from "../../../core/services/user-manager/user-manager.service";
import { Component, OnInit } from "@angular/core";
import {
  FormGroup,
  FormControl,
  Validators,
  AbstractControl
} from "@angular/forms";
import { LogManagerService } from "../../../core/services/log-manager/log-manager.service";

@Component({
  selector: "mf-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"]
})
export class RegisterComponent {
  registeredSuccessfully = false;
  registerMessage = "";

  /**
   * @param Object registerForm
   * Tracks the value and validity state of a group
   */
  registerForm = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email]),
    password: new FormControl("", [
      Validators.required,
      Validators.minLength(6)
    ]),
    subscribe: new FormControl(true)
  });

  constructor(
    private userManagerService: UserManagerService,
    private _logManagerSerivice: LogManagerService
  ) {}

  get email(): AbstractControl {
    return this.registerForm.get("email");
  }

  get password(): AbstractControl {
    return this.registerForm.get("password");
  }

  get sendingRequest(): boolean {
    return this.userManagerService.sendingRequest;
  }

  /**
   * prevents displaying form errors immediately after user clicks on an empty input and adds value the second time
   * @since 0.0.1
   * @return {void}
   */
  markAsUntouched(): void {
    if (!this.registerForm.dirty) {
      this.registerForm.markAsUntouched();
    }
  }

  async register(e): Promise<void> {
    // e.preventDefault();
    // const response = await this.userManagerService.register(this.registerForm);
    // if (response.result) {
    //   this.registeredSuccessfully = true;
    //   this._logManagerSerivice.trackRegisterEvent(response.userID, response.email);
    // } else {
    //   this.registerMessage = response.msg;
    // }
  }

  goToSignin(e): void {
    e.preventDefault();
    this.userManagerService.currentPage = "login";
  }
}
