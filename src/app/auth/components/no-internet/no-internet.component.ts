import { Router } from "@angular/router";
import { Component, OnInit } from "@angular/core";

@Component({
  selector: "mf-no-internet",
  templateUrl: "./no-internet.component.html",
  styleUrls: ["./no-internet.component.scss"]
})
export class NoInternetComponent implements OnInit {
  constructor(private _router: Router) {}

  ngOnInit() {}
  tryAgain() {
    this._router.navigate(["auth", "questions"]);
  }
  skipToTemplate() {
    this._router.navigate(["dashboard", "animation"]);
  }
}
