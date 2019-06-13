import { Router } from "@angular/router";
import { fadeAnimation } from "./../../../shared/helpers/fade.animation";
import { Component, OnInit } from "@angular/core";

@Component({
  selector: "mf-auth-container",
  templateUrl: "./auth-container.component.html",
  styleUrls: ["./auth-container.component.scss"],
  animations: [fadeAnimation]
})
export class AuthContainerComponent implements OnInit {
  constructor(private _router: Router) {}

  ngOnInit() {
    document.body.style.backgroundColor = "#fff";
  }

  public getRouterOutletState(outlet) {
    return outlet.isActivated ? outlet.activatedRoute : "";
  }
}
