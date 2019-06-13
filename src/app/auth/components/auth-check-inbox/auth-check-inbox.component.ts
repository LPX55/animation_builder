import { Router } from "@angular/router";
import { Component, OnInit } from "@angular/core";

@Component({
  selector: "mf-auth-check-inbox",
  templateUrl: "./auth-check-inbox.component.html",
  styleUrls: ["./auth-check-inbox.component.scss"]
})
export class AuthCheckInboxComponent implements OnInit {
  constructor(private _router: Router) {}

  ngOnInit() {}

  goToLogin() {
    this._router.navigate(["auth", "sign", "login"]);
  }
}
