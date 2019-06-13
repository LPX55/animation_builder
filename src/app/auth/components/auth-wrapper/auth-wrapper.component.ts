import { fadeAnimation } from "./../../../shared/helpers/fade.animation";
import { Component, OnInit } from "@angular/core";

@Component({
  selector: "mf-auth-wrapper",
  templateUrl: "./auth-wrapper.component.html",
  styleUrls: ["./auth-wrapper.component.scss"],
  animations: [fadeAnimation]
})
export class AuthWrapperComponent implements OnInit {
  public tabsContent = [
    { name: "Sign Up", route: "/auth/sign/sign-up/" },
    { name: "Log In", route: "/auth/sign/login/" }
  ];
  constructor() {}

  ngOnInit() {}
  public getRouterOutletState(outlet) {
    return outlet.isActivated ? outlet.activatedRoute : "";
  }
}
