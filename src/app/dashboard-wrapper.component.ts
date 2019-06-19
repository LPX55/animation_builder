import { routerAnimation } from "./shared/helpers/animations";
import { Component, OnInit } from "@angular/core";

@Component({
  template: `
    <mf-header></mf-header>
    <div class="body" [@routerAnimation]="getRouteAnimation(route)">
      <router-outlet #route="outlet"></router-outlet>
    </div>
  `,
  selector: "mf-dashboard-wrapper",
  styles: [
    `
      .body {
        display: flex;
        flex-direction: column;
        background-color: #262626;
        height: 100%;
      }
    `
  ],
  animations: [routerAnimation]
})
export class DashboardWrapperComponent implements OnInit {
  routeAnimation = "template";
  constructor() {}

  ngOnInit() {}
  // change the animation state
  getRouteAnimation(outlet): any {
    return outlet.activatedRouteData.animation;
  }
}
