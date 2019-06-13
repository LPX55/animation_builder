import { Component, OnInit, Input, Output } from "@angular/core";

@Component({
  selector: "mf-auth-tabs",
  templateUrl: "./auth-tabs.component.html",
  styleUrls: ["./auth-tabs.component.scss"]
})
export class AuthTabsComponent implements OnInit {
  @Input("tabs") tabs: any[];
  constructor() {}

  ngOnInit() {
    const layerLoadElement: any = document.getElementsByClassName(
      "loadLayer"
    )[0];
    layerLoadElement.style.display = "none";
  }
}
