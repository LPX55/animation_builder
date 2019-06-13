import { UserManagerService } from "./../core/services/user-manager/user-manager.service";
import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private _userManagerService: UserManagerService,
    private _router: Router
  ) {}

  canActivate(): boolean {
    if (!this._userManagerService.isLoggedin) {
      this._router.navigate(["auth/sign/sign-up/social"]);
      return false;
    }
    return true;
  }
}
