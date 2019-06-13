import { AppGlobals } from "../../../../global";
import { Injectable, NgZone } from "@angular/core";
import { CSInterface, SystemPath } from "csinterface-ts/dist/csinterface-ts";
import { Router } from "@angular/router";
import { Location } from "@angular/common";
import { Subject } from "rxjs";

@Injectable()
/**
 * general class for access jsx functions, execute, and get data from them
 */
export class JsxInjectorService {
  public _csi: CSInterface;
  private _defualtPath: string;
  private _settingData: any[];
  private _isInAdobeApp = false;
  public showPluginMessageBox = false;
  private _vulcanEventListeners: any = {};
  // function that execute and modify setting when data come from host
  settingHandlerFunction: (executionResult: any[]) => any[];
  settingPath = "/dashboard/setting";
  backSetTimeout;
  constructor(
    private _zone: NgZone,
    private _router: Router,
    private _location: Location,
    private _appGlobals: AppGlobals
  ) {
    // if we are in premiere this if block will execute
    this._isInAdobeApp = window.hasOwnProperty("__adobe_cep__");
    if (this._isInAdobeApp) {
      this._csi = new CSInterface();
      // get extension path
      this._defualtPath = this._csi.getSystemPath(SystemPath.EXTENSION);
      this.listenForChanges();
      this.listenForErrors();
      this.listenForVulcanEvents();
    }
  }
  /**
   * inject a jsx file into motion factory
   * @param {string} relativePathToJsx  relative path to jsx file
   *
   * @example
   * inject('core.jsx')
   *
   * @return {void}
   */
  inject(relativePathToJsx: string): void {
    const jsxRunnerCommand = `
        var mfJsxFile = new File("${
          this._defualtPath
        }/dist/assets/${relativePathToJsx}");
        $.evalFile(mfJsxFile);
        `;
    this.evalScript(jsxRunnerCommand);
  }
  /**
   *   execute a script in premiere and return the result.
   * @param {string} script  specific script that should run in premiere
   * @param {string} callbackFuntion the callbackfuntion that executes when premiere returned the result.
   * @return {void}
   */
  evalScript(
    script: string,
    callbackFunction?: (executionResult: any) => void
  ): void {
    if (this._isInAdobeApp) {
      this._csi.evalScript(
        `try{${script}} catch(e){
        var externalObjectName;
        if (Folder.fs === 'Macintosh') {
            externalObjectName = "PlugPlugExternalObject";
        } else {
            externalObjectName = "PlugPlugExternalObject.dll";
        }
        var mylib = new ExternalObject('lib:' + externalObjectName);
        var csxsEvent = new CSXSEvent();
        csxsEvent.type = 'triggerError';
        csxsEvent.data = JSON.stringify(e);
        csxsEvent.dispatch(); }`,
        result => {
          if (undefined !== callbackFunction) {
            callbackFunction(result);
          }
        }
      );
    }
  }

  listenForChanges(): void {
    this._csi.addEventListener("showPluginMessage", (event: any) => {
      this.showPluginMessageBox = true;
    });

    this._csi.addEventListener("LayerChanged", (event: any) => {
      // recieved changed layer event and data
      if (
        event.data.controllers instanceof Array &&
        event.data.controllers.length > 0
      ) {
        if (1 === this._appGlobals.DBConnection.get("user.status").value()) {
          if (event.data && event.data.controllers.length) {
            console.log(event.data);
            this.settingData = this.settingHandlerFunction(event.data);
            this._zone.run(() => this._router.navigate([this.settingPath]));
          } else if (this._router.url.indexOf("/dashboard/setting") > -1) {
            this._location.back();
            this.settingData = {};
          }
        }
      } else if (this._router.url.indexOf("/dashboard/setting") > -1) {
        if (this.backSetTimeout) clearTimeout(this.backSetTimeout);
        this.backSetTimeout = setTimeout(() => {
          this._location.back();
        }, 10);
        this.settingData = {};
      }
    });
  }

  /**
   * listen for errors from jsx
   * @return {void}
   */
  listenForErrors(): void {
    this._csi.addEventListener("triggerError", (event: any) => {
      console.error("JSX Error", event.data);
    });
  }

  get defualtPath(): string {
    return this._defualtPath;
  }

  /**
   * returns os information
   * @return {string}
   */
  get OSInformation(): string {
    return this._csi.getOSInformation();
  }

  get settingData(): any {
    return this._settingData;
  }
  set settingData(value) {
    this._settingData = value;
  }

  get hostEnvironment(): any {
    return this._csi.getHostEnvironment();
  }

  /**
   * opens a link in user default browser
   * @param {string} url - specific url
   * @param {string} subId3 - subld3 parameter
   * @return {void}
   */
  openUrlInBrowser(url: string, subId3 = ""): void {
    let linkUrl = url;
    if (subId3 !== "") {
      const urlTemp = new URL(url.split("?")[0]);
      linkUrl = this.formatReferralLink(urlTemp.toString(), subId3);
    }
    this._csi.openURLInDefaultBrowser(linkUrl);
  }

  /**
   * format link and add ref to url
   * @param {string} url - specific url
   * @param {string} subId3 - subld3 parameter
   * @return {string} formated link
   */
  formatReferralLink(link: string, subId3: string): string {
    // tslint:disable-next-line:max-line-length
    return `https://1.envato.market/c/1248194/275988/4415?subId1=textanimator&subId2=premiere-app&subId3=${subId3}&u=${encodeURIComponent(
      link
    )}`;
  }

  /**
   * reads all installed extensions
   * @return {string} array of installed extensions
   */
  get installedExtensionsList(): any[] {
    return this._csi.getExtensions([]);
  }
  /**
   * dispatch a event to other hosts
   * @param {string} eventName - name of event
   * @param {object} message - the payload to send
   * @return {void}
   */
  dispatchVulcanMessage(eventName, message): void {
    const payload = new VulcanMessage(
      VulcanMessage.TYPE_PREFIX + "com.pixflow.textanimator.events"
    );
    payload.setPayload(
      JSON.stringify({
        eventName,
        message,
        app: `${this.hostEnvironment.appName}-${
          this.hostEnvironment.appVersion
        }`
      })
    );
    VulcanInterface.dispatchMessage(payload);
  }

  /**
   * listen for all events in vulcan event listener
   * @return {void}
   */
  listenForVulcanEvents(): void {
    VulcanInterface.addMessageListener(
      VulcanMessage.TYPE_PREFIX + "com.pixflow.textanimator.events",
      payload => {
        const eventPayload = JSON.parse(VulcanInterface.getPayload(payload));
        const payloadEventName = eventPayload.eventName;
        if (
          Object.keys(this._vulcanEventListeners).includes(payloadEventName)
        ) {
          const payloadMessage = eventPayload.message;
          if (
            `${this.hostEnvironment.appName}-${
              this.hostEnvironment.appVersion
            }` !== eventPayload.app
          ) {
            this._vulcanEventListeners[payloadEventName].next(payloadMessage);
          }
        }
      }
    );
  }

  /**
   * add listener and return watch subject
   * @param {string} eventName - name of event
   * @return {Subject}
   */
  listenForVulcanEvent(eventName): Subject<any> {
    if (Object.keys(this._vulcanEventListeners).includes(eventName)) {
      return this._vulcanEventListeners[eventName];
    } else {
      const listenerSubject = new Subject<any>();
      this._vulcanEventListeners[eventName] = listenerSubject;
      return listenerSubject;
    }
  }
}
