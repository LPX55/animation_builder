import { UserManagerService } from "./../../../core/services/user-manager/user-manager.service";
import { JsxInjectorService } from "./../../../core/services/jsx-injector/jsx-injector.service";
import { IpcHandlerService } from "./../../../core/services/ipc-handler/ipc-handler.service";
import { AppGlobals } from "./../../../../global";
import { MarketDataService } from "./../../../market/services/market-data.service";
import { Router } from "@angular/router";
import { Component, OnInit } from "@angular/core";

@Component({
  selector: "mf-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"]
})
export class HeaderComponent implements OnInit {
  // TODO we will add version to another part of ui later
  currentVersion: any = "";
  public settingIsNotActive = true;
  public showDropDown = false;

  // sign out drop down content
  dropDownContent = [
    {
      id: 1,
      thumbnail: "",
      title: ""
    },
    {
      id: 2,
      thumbnail: "",
      title: "Sign Out"
    }
  ];
  constructor(
    private _route: Router,
    private _jsxInjectorService: JsxInjectorService,
    private _userManagerService: UserManagerService,
    private _appGlobals: AppGlobals,
    private _ipcHandlerService: IpcHandlerService
  ) {}

  ngOnInit(): void {
    this.initMenuAnimation();
    this.handleNavigationChange();
    this._ipcHandlerService.connectSubject.subscribe(connected => {
      if (connected) {
        this.currentVersion = this._appGlobals.APPVersion;
        this.dropDownContent[0].title = `version : ` + this.currentVersion;
      }
    });
    // this._userManagerService.loginSubject.subscribe(loogedIn => {
    //   if (loogedIn) {
    //     this.dropDownContent.push({
    //       id: 2,
    //       thumbnail: "",
    //       title: "Sign Out"
    //     });
    //   } else {
    //     this.dropDownContent.splice(1, 1);
    //   }
    // });
  }

  goToMarket(): void {
    this._route.navigate(["market", "new"]);
  }

  handleNavigationChange(): void {
    this._route.events.subscribe(event => {
      if (this._route.url.match(/\/dashboard\/setting\/*/i)) {
        this.settingIsNotActive = false;
      } else {
        this.settingIsNotActive = true;
      }
    });
  }

  handleMenuClick(): void {
    this.settingIsNotActive = true;
  }

  /**
   * Handle Menu Animation on mouse leave
   * @return {void}
   */
  initMenuAnimation(): void {
    window.addEventListener("resize", this.underlineAnimationResize);
    const activeNode = document.querySelector(".header .active");
    if (null != activeNode) {
      this.updateMenuUnderline(activeNode);
    }
    return;
  }

  /**
   * Handle Menu Animation on mouse enter
   * @return {void}
   */
  menuItemMouseEnter(e): void {
    e = e.target;
    if (!e.classList.contains("active")) {
      this.updateMenuUnderline(e);
    }
    return;
  }

  /**
   * Handle Menu Animation on mouse leave
   * @return {void}
   */
  menuItemMouseLeave(e): void {
    e = e.target;
    if (!e.classList.contains("active")) {
      const activeNode = document.querySelector(".header .active");
      if (null != activeNode) {
        this.updateMenuUnderline(activeNode);
      }
    }
    return;
  }

  /**
   * Handle Menu Animation on window resize
   * @return {void}
   */
  underlineAnimationResize(): void {
    const active = document.querySelector(".header li.active");
    if (active) {
      const left = active.getBoundingClientRect().left + window.pageXOffset;
      const top = active.getBoundingClientRect().top + window.pageYOffset - 3;
      const target: any = document.querySelector(".header-menu-underline");
      target.style.left = `${left}px`;
      target.style.top = `${top}px`;
    }
    return;
  }

  /**
   * Update new position of menu underline
   * @param {object} node - target menu item to set underline
   * @return {void}
   */
  updateMenuUnderline(node): void {
    const left = node.getBoundingClientRect().left + window.pageXOffset;
    const top = node.getBoundingClientRect().top + window.pageYOffset - 3;
    const width = node.getBoundingClientRect().width;
    const height = node.getBoundingClientRect().height;
    const target: any = document.querySelector(".header-menu-underline");
    target.style.width = `${width}px`;
    target.style.height = `${height}px`;
    target.style.left = `${left}px`;
    target.style.top = `${top}px`;
    target.style.transform = "none";
    return;
  }

  /**
   * link join-us button to https://pixflowstudio.typeform.com/to/qEWoKt
   * @return {void}
   */
  linkedToJoinUs(): void {
    this._jsxInjectorService.openUrlInBrowser(
      "https://pixflowstudio.typeform.com/to/qEWoKt"
    );
  }

  /**
   * open sign out drop down
   * @return {void}
   */
  openSignOutDialog($event): void {
    $event.stopPropagation();
    this.showDropDown = true;
  }

  /**
   * closed sign out drop down
   * @return {void}
   */
  onClosedDropDown(): void {
    this.showDropDown = false;
  }
  /**
   * when clicked on a sign-out drop down
   * @return {void}
   */
  onClickOnItem($event): void {
    const menuId = $event.menuId;
    if (menuId === 2) {
      this._userManagerService.currentPage = "register";
      this._userManagerService.isLoggedin = false;
      this._appGlobals.DBConnection.set("user.status", 0).write();
      localStorage.removeItem("userInfo");
      this._userManagerService.loginSubject.next(false);
      this._route.navigate(["auth", "sign", "sign-up", "social"]);
    }
  }

  get isLoggedIn(): boolean {
    return this._userManagerService.isLoggedin;
  }
}
