import { Router } from "@angular/router";
import { AppGlobals } from "../../../../global";
import { Injectable } from "@angular/core";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { Subject } from "rxjs";
import {
  generateAPI,
  booleanToNumber
} from "../../../shared/helpers/helper-functions";
import { OsInfoService } from "../operating-system/os-info.service";
import { IpcHandlerService } from "../ipc-handler/ipc-handler.service";
import { LogManagerService } from "../log-manager/log-manager.service";

@Injectable()
export class UserManagerService {
  private _isLoggedin = false;
  public sendingRequest = false;
  public currentPage = "";
  public loginSubject: Subject<any> = new Subject<any>();
  public displayResendActivationEmail = false;
  public userID = "";
  public userEmail = "";

  private _forgotPasswordToken = "";

  constructor(
    private _http: HttpClient,
    private _appGlobals: AppGlobals,
    private _osInfoService: OsInfoService,
    private _ipcHandlerService: IpcHandlerService,
    private _logManagerService: LogManagerService,
    private _router: Router
  ) {
    this.checkUserIsLogin();
    this.checkToken();

    // this._ipcHandlerService.connectSubject.subscribe(connected => {
    //   if (connected) {
    //   }
    // });
  }

  get isLoggedin(): boolean {
    return this._isLoggedin;
  }

  set isLoggedin(value) {
    this._isLoggedin = value;
  }

  /**
   * check
   * @since 0.0.1
   * @return {void} - changes isLoggedin if user token exists.
   */
  checkUserIsLogin(): void {
    const userLogin = this._appGlobals.DBConnection.get("user").value();
    if (!userLogin.id || !userLogin.status) {
      this.currentPage = "register";
      this.isLoggedin = false;
      this._appGlobals.DBConnection.set("user.status", 0).write();
    } else {
      if (userLogin.status) {
        this.isLoggedin = true;
        localStorage.setItem("userInfo", JSON.stringify(userLogin));
        this.setUserID(userLogin.id);
        this._ipcHandlerService.connectSubject.subscribe(connected => {
          if (connected) {
            this._ipcHandlerService
              .emitEvent("setIPCParams", {
                userID: userLogin.id,
                userEmail: userLogin.name
              })
              .subscribe(data => {
                this.userEmail = userLogin.name;
                this.loginSubject.next(true);
              });
          }
        });
      }
    }
  }

  /**
   * Generates API URL for different actions
   * @since 0.0.1
   * @return {void} - changes isLoggedin if user token exists.
   */
  checkToken(): void {
    if (1 === this._appGlobals.DBConnection.get("user.status").value()) {
      this.isLoggedin = true;
    }
  }

  /**
   * Handles common form errors.
   * @since 0.0.1
   * @param {any} error
   * @return {string} - Returns a static error message.
   */
  onErrorHandle(error): string {
    let serverMessage = "";
    this.sendingRequest = false;
    if (0 === error.status) {
      serverMessage =
        "The server is not accessible. Please try again in a few minutes.";
    } else {
      serverMessage =
        "An error occurred while connecting to server. Please try again in a few minutes.";
    }
    return serverMessage;
  }

  /**
   * Registers a new user.
   * @since 0.0.1
   * @param {any} data to register
   * @return {promise} - Returns server response as a promise.
   */
  async register({ full_name, email, password, subscribe }): Promise<any> {
    let response: any = {};
    this.sendingRequest = true;
    const body = new FormData();
    body.append("full_name", full_name);
    body.append("email", email);
    body.append("password", password);
    body.append("subscribe", booleanToNumber(subscribe).toString());
    try {
      response = await this._http
        .put(generateAPI("register"), body)
        .toPromise();
      this.sendingRequest = false;
    } catch (error) {
      response = {
        result: false,
        msg: this.onErrorHandle(error)
      };
    }
    return response;
  }

  /**
   * logins an existing user.
   * @since 0.0.1
   * @param {string} email
   * @param {string} password
   * @return {promise} - Returns server response as a promise.
   */
  async login(email, password): Promise<any> {
    let response: any = {};
    this.sendingRequest = true;
    const body = new FormData();
    body.append("email", email);
    body.append("password", password);
    try {
      response = await this._http.post(generateAPI("login"), body).toPromise();
      if (true === response.result) {
        const { token, full_name, last_name, id } = response;
        this.loginUserIntoDB({
          token,
          email,
          full_name,
          id
        });
      } else if (
        false === response.result &&
        undefined !== response.verifiedStatus &&
        "not verified" === response.verifiedStatus
      ) {
        this.displayResendActivationEmail = true;
      }
      this.sendingRequest = false;
    } catch (error) {
      response = {
        result: false,
        msg: this.onErrorHandle(error)
      };
    }
    return response;
  }

  loginUserIntoDB({ token, email, full_name, id }) {
    this._appGlobals.DBConnection.set("user", {
      status: 1,
      token: token,
      name: email,
      full_name,
      id
    }).write();

    this._ipcHandlerService
      .emitEvent("setIPCParams", {
        userID: id,
        userEmail: email
      })
      .subscribe(() => {
        this.userEmail = email;
        this.setUserID(id);
        this.loginSubject.next(true);
        this.isLoggedin = true;
        this._logManagerService.trackSignInEvent(id, email);
        this._router.navigate(["auth/questions"]);
      });
  }

  /**
   * Return the path of user database
   * @return { string }
   */
  getMotionFactoryUserDatabasePath(): string {
    return `${this._osInfoService.getMotionFactoryAppDataFolder()}/${
      this.userID
    }/database.json`;
  }

  /**
   * Return the path of user file
   * @return { string }
   */
  motionFactoryUserFileDirection(): string {
    return `${this._osInfoService.getMotionFactoryAppDataFolder()}/${
      this.userID
    }`;
  }

  /**
   * set user email and call for database
   * @param {string} id
   * @return { void }
   */
  setUserID(id): void {
    this.userID = id;
    this.createUserDB();
    this._logManagerService.initialize(this.userID, this.userEmail);
  }

  /**
   * create database for each user that log in
   * @return { void }
   */
  createUserDB(): void {
    if (!fs.existsSync(this.motionFactoryUserFileDirection())) {
      fs.ensureDirSync(this.motionFactoryUserFileDirection());
      fs.createWriteStream(this.getMotionFactoryUserDatabasePath());
    }
    const userAdapter = new fileSync(this.getMotionFactoryUserDatabasePath());
    this._appGlobals.userDBConnection = low(userAdapter);
    this._appGlobals.userDBConnection._.mixin(lodashId);
    this._appGlobals.userDBConnection
      .defaults({
        packsAndFiles: {
          packs: [
            // {
            //   id: '12345',
            //   packName: 'Default Files',
            //   packPath: this._osInfoService.getEssentialGraphicsPath(),
            //   packViewMode: '',
            //   packCover: '',
            //   isDefaultFiles: true,
            //   removedItems: [],
            //   addedItems: [],
            //   itemsCount: undefined
            // }
          ],
          files: []
        },
        packsCache: [],
        videoPreviews: []
      })
      .write();
  }

  /**
   * Requests a forgot password token from server.
   * @since 0.0.1
   * @param {string} email
   * @return {promise} - Returns server response as a promise. It includes a token
   */
  async forgotPasswordRequestToken(email: string): Promise<any> {
    let response: any = {};
    try {
      response = await this._http
        .get(generateAPI(`forgot-password/request-token/${email}`))
        .toPromise();
      this._forgotPasswordToken = response.token;
    } catch (error) {
      response = {
        result: false,
        msg: this.onErrorHandle(error)
      };
    }
    return response;
  }

  /**
   * Sends new password to server.
   * @since 0.0.1
   * @param {form} form
   * @param {string} token
   * @return {promise} - Returns server response as a promise.
   */
  async setNewPassword({ resetCode, password }): Promise<any> {
    let response: any = {};
    const body = new FormData();
    body.append("token", this._forgotPasswordToken);
    body.append("code", resetCode);
    body.append("password", password);
    try {
      response = await this._http
        .put(generateAPI("forgot-password/change-password"), body)
        .toPromise();
    } catch (error) {
      response = {
        result: false,
        msg: this.onErrorHandle(error)
      };
    }
    this.sendingRequest = false;
    return response;
  }
  /**
   * send a request to web service for re-sending user activation email
   * @since 0.0.1
   * @param {string} email - user email address
   * @return {promise} - server response
   */
  async resendActivationEmail(email: string): Promise<any> {
    let response: any = {};
    this.sendingRequest = true;
    this.displayResendActivationEmail = false;
    const body = new FormData();
    body.append("email", email);
    try {
      response = await this._http
        .post(generateAPI("resend-activation-email"), body)
        .toPromise();
      this.sendingRequest = false;
    } catch (error) {
      response = {
        result: false,
        msg: this.onErrorHandle(error)
      };
    }
    return response;
  }
}
