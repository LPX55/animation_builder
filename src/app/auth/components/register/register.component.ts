import { Router } from "@angular/router";
import { LogManagerService } from "./../../../core/services/log-manager/log-manager.service";
import { UserManagerService } from "./../../../core/services/user-manager/user-manager.service";
import { Component, OnInit } from "@angular/core";
import {
  FormGroup,
  FormControl,
  Validators,
  AbstractControl
} from "@angular/forms";

@Component({
  selector: "mf-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"]
})
export class RegisterComponent implements OnInit {
  public registerLoading = false;
  public errors = [];

  /**
   * @param Object registerForm
   * Tracks the value and validity state of a group
   */
  registerForm = new FormGroup({
    full_name: new FormControl("", [Validators.required]),
    email: new FormControl("", [Validators.required, Validators.email]),
    password: new FormControl("", [
      Validators.required,
      Validators.minLength(6)
    ]),
    subscribe: new FormControl(true)
  });

  constructor(
    private _userManagerService: UserManagerService,
    private _logManagerSerivice: LogManagerService,
    private _router: Router
  ) {}

  ngOnInit() {}

  get fullNameControl(): AbstractControl {
    return this.registerForm.get("full_name");
  }

  get emailControl(): AbstractControl {
    return this.registerForm.get("email");
  }

  get passwordControl(): AbstractControl {
    return this.registerForm.get("password");
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
    e.preventDefault();
    this.registerLoading = true;
    this.errors = [];
    const {
      value: { full_name, email, password, subscribe }
    } = this.registerForm;
    const response = await this._userManagerService.register({
      full_name,
      email,
      password,
      subscribe
    });
    this.registerLoading = false;

    if (response.result) {
      this._logManagerSerivice.trackRegisterEvent(
        response.userID,
        response.email
      );
      this._router.navigate(["auth", "sign", "sign-up", "register", "check"]);
    } else {
      this.errors.push(response.msg);
    }
  }

  backToSocialLogin() {
    this._router.navigate([".."]);
  }
}
