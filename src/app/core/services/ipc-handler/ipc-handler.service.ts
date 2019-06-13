import { Injectable, isDevMode } from "@angular/core";
import { Subject, BehaviorSubject, Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { AppGlobals } from "../../../../global";
import { OsInfoService } from "../operating-system/os-info.service";

@Injectable()
export class IpcHandlerService {
  // address of http server
  public _serverAddress = "http://127.0.0.1:";
  public ipcPort = 0;

  // events that user subscribed
  private _events: any;
  // connect to server subscribe
  public connectSubject: BehaviorSubject<boolean> = new BehaviorSubject<
    boolean
  >(false);

  constructor(
    private _httpClient: HttpClient,
    private _appGlobals: AppGlobals,
    private _osInfoService: OsInfoService
  ) {
    this.connectToIPC();
  }

  connectToIPC(): void {
    this.emitEvent("fetchNodeEnv", {}).subscribe(
      data => {
        if (data.result) {
          this.setIPCParams().subscribe(result => {
            if (result["success"]) {
              this.connectSubject.next(true);
            }
          });
          if (this._osInfoService.currentPlatform !== "MAC") {
            data.result["env"]["APPDATA"] = data.result["env"][
              "APPDATA"
            ].replace(/\\/g, "/");
            this._appGlobals.processEnv = data.result;
          }
        }
      },
      error => {
        setTimeout(() => {
          this.connectToIPC();
        }, 100);
      }
    );
  }

  /**
   * send app info to ipc
   * @return {Observable}
   */
  setIPCParams(): Observable<any> {
    const { appId, appVersion, appLocale } = JSON.parse(
      window["__adobe_cep__"].getHostEnvironment()
    );
    return this.emitEvent("setIPCParams", {
      ffmpegPath: this._osInfoService.getFFMpegZipPath(),
      extensionPath: extensionPath,
      host: appId,
      hostVersion: appVersion,
      language: appLocale,
      appVersion: this._appGlobals.APPVersion,
      devMode: isDevMode()
    });
  }

  /**
   * listen to a event and subscribe
   * @param {string} eventName  name of event
   * @return {Subject}
   */
  listenToEvent(eventName: string): Subject<any> {
    const eventSubject: Subject<any> = new Subject<any>();
    this._events[eventName].then(data => {
      eventSubject.next(data);
    });
    return eventSubject;
  }

  /**
   * emit a event to http server
   * @param {string} eventName  name of event
   * @param {any} data - data that we want to emit
   * @return {Observable}
   */
  emitEvent(eventName: string, data: any): Observable<any> {
    return this._httpClient.post(`${this._serverAddress}/${eventName}`, data);
  }

  getIPCPath(): string {
    let ipcPath = path.join(
      this._osInfoService.getMotionFactoryAppDataFolder(),
      `ipc${this._appGlobals.APPVersion}`
    );
    if (this._osInfoService.currentPlatform === "WIN") {
      ipcPath = `${ipcPath}.exe`;
    }
    return ipcPath;
  }

  getBatFileContent(): string {
    let ipcPath = `~/Library/Application Support/MotionFactory/ipc${this._appGlobals.APPVersion}`;

    if (this._osInfoService.currentPlatform === "WIN") {
      ipcPath = `%APPDATA%/MotionFactory/ipc${this._appGlobals.APPVersion}.exe`;
    }
    return ipcPath;
  }

  /**
   * ends ipc server
   * @return {void}
   */
  exitIPC(): Promise<void> {
    return new Promise(resolve => {
      const options = {
        method: "POST",
        host: "localhost",
        port: this.ipcPort,
        path: "/exitIPC"
      };
      const req = http.request(options);
      req.on("error", error => {
        resolve();
      });
      req.end();
    });
  }

  /**
   * starts ipc server
   * @return {void}
   */
  startIPC(): void {
    const options = {
      method: "HEAD",
      host: "localhost",
      port: this.ipcPort,
      path: "/"
    };
    const req = http.request(options);
    req.on("error", error => {
      if (error.toString().indexOf("ECONNREFUSED") >= -1) {
        if (this._osInfoService.currentPlatform === "WIN") {
          fs.writeFileSync(
            `${this._osInfoService.getMotionFactoryAppDataFolder()}/ipcStarter.bat`,
            `"${this.getBatFileContent()}" ${this.ipcPort}`,
            {
              mode: "777"
            }
          );
          child.execFile(
            `${this._osInfoService.getMotionFactoryAppDataFolder()}/ipcStarter.bat`
          );
        } else {
          child.execFile(this.getIPCPath(), [this.ipcPort]);
        }
      }
    });
    req.end();
  }

  findLatestIPC(): Promise<any> {
    return new Promise(resolve => {
      let ipcPath = "";
      let maxVersion = 0;
      let versionString = "";
      const basePath = this._osInfoService.getMotionFactoryAppDataFolder();
      fs.readdir(basePath, (err, files) => {
        files.map(file => {
          if (file.indexOf("ipc") > -1) {
            const version = parseInt(
              file
                .replace(".exe", "")
                .replace("ipc", "")
                .replace(".", ""),
              10
            );
            const versionStr = file.replace(".exe", "").replace("ipc", "");
            if (version > maxVersion) {
              ipcPath = `${basePath}/${file}`;
              maxVersion = version;
              versionString = versionStr;
            }
            if (this._appGlobals.APPVersion !== versionStr) {
              fs.unlinkSync(`${basePath}/${file}`);
            }
          }
        });
        resolve({ ipcPath, versionString });
      });
    });
  }

  unzipIPC(): Promise<void> {
    return new Promise(resolve => {
      this.findLatestIPC().then(ipcLatestInfo => {
        if (this._appGlobals.APPVersion !== ipcLatestInfo.versionString) {
          const zipPath = path.join(
            extensionPath,
            "dist/assets/ipc-server/ipc.zip"
          );
          const zip = new AdmZip(zipPath);
          let zipFileName = "ipc";
          if (this._osInfoService.currentPlatform === "WIN") {
            zipFileName = "ipc.exe";
          }
          const data = zip.readFile(zipFileName);
          fs.writeFileSync(this.getIPCPath(), data, {
            mode: "777"
          });
          resolve();
        } else {
          resolve();
        }
      });
    });
  }
}
