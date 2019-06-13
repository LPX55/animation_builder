import { rootAPI } from "./../../../shared/helpers/helper-functions";
import { UserManagerService } from "./../../../core/services/user-manager/user-manager.service";
import { Router } from "@angular/router";
import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";

@Component({
  selector: "mf-social-login",
  templateUrl: "./social-login.component.html",
  styleUrls: ["./social-login.component.scss"]
})
export class SocialLoginComponent implements OnInit {
  private _socialLoginEndPoint = `${rootAPI}login/social`;
  @ViewChild("authLoader") authLoader: ElementRef;
  @ViewChild("authLoaderContainer") authLoaderContainer: ElementRef;
  public googleButtonLoading = false;
  public facebookButtonLoading = false;
  public twitterButtonLoading = false;
  private _currentSocialValidator = "";
  private _currentSocialRedirectURL = "";
  public errors = [];
  constructor(
    private _router: Router,
    private _userManagerService: UserManagerService
  ) {}

  ngOnInit() {}

  openIframe(socialURL, urlValidator, redirectURL) {
    this.errors = [];
    this.authLoader.nativeElement.src = socialURL;
    this._currentSocialRedirectURL = redirectURL;
    this._currentSocialValidator = urlValidator;
  }

  onLoadedIframe() {
    if (this._currentSocialValidator !== "") {
      const location = this.authLoader.nativeElement.contentWindow.location
        .href;
      setTimeout(() => {
        this.authLoader.nativeElement.contentWindow.scrollTo(-50, 0);
      }, 500);
      if (location.indexOf(this._currentSocialValidator) > -1) {
        this.redirectedToSocial();
      } else if (
        location.indexOf(this._currentSocialRedirectURL) > -1 &&
        location.replace(this._currentSocialRedirectURL, "").length > 10
      ) {
        this.backFromSocial();
      }
    }
  }

  backFromSocial() {
    this.closeIframe();
    try {
      const result = JSON.parse(
        this.authLoader.nativeElement.contentWindow.document.body.innerText
      );
      if ("token" in result) {
        const { token, email, full_name, id } = result;
        this._userManagerService.loginUserIntoDB({
          token,
          email,
          full_name,
          id
        });
      } else {
        if (result["error"]) {
          this.errors.push(result["message"]);
        }
      }
    } catch (e) {}
  }

  redirectedToSocial() {
    document.body.scrollTop = 0;
    document.body.style.overflow = "hidden";
    setTimeout(
      () => this.authLoaderContainer.nativeElement.classList.add("up"),
      100
    );
  }
  closeIframe() {
    this.authLoader.nativeElement.src = "";
    this.authLoaderContainer.nativeElement.classList.remove("up");
    document.body.style.overflow = "auto";
    this.googleButtonLoading = false;
    this.facebookButtonLoading = false;
    this.twitterButtonLoading = false;
    this._currentSocialRedirectURL = "";
    this._currentSocialValidator = "";
  }
  googleSignIn() {
    this.googleButtonLoading = true;
    this.facebookButtonLoading = false;
    this.twitterButtonLoading = false;
    this.openIframe(
      `${this._socialLoginEndPoint}/google`,
      "https://accounts.google.com",
      `${this._socialLoginEndPoint}/google`
    );
  }

  facebookSignIn() {
    this.facebookButtonLoading = true;
    this.googleButtonLoading = false;
    this.twitterButtonLoading = false;
    this.openIframe(
      `${this._socialLoginEndPoint}/facebook`,
      "https://www.facebook.com",
      "https://pixflow.net/facebook-login"
    );
  }

  twitterSignIn() {
    this.twitterButtonLoading = true;
    this.facebookButtonLoading = false;
    this.googleButtonLoading = false;
    this.openIframe(
      `${this._socialLoginEndPoint}/twitter`,
      "https://api.twitter.com/oauth",
      `${this._socialLoginEndPoint}/twitter`
    );
  }
}
