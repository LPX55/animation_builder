import { AppGlobals } from "../../../../global";
import { OsInfoService } from "../operating-system/os-info.service";
import { Subject } from "rxjs";
import { JsxInjectorService } from "../jsx-injector/jsx-injector.service";
import { Injectable } from "@angular/core";
import { UserManagerService } from "../user-manager/user-manager.service";
import { IpcHandlerService } from "../ipc-handler/ipc-handler.service";

@Injectable()
export class VideoProcessorService {
  // ffmpeg exe file path in app data
  public ffmpegPath: string;
  // json files directory path
  public jsonFileDirectory: string;
  // subject for previews if they created or not
  public creatingPreviewSubject: Subject<any> = new Subject<any>();
  // queue of generating spreedsheet
  public spreedSheetQueue: any[];
  // path of queue json file
  public jsonFilePath = "";
  // is job running or not
  public jobRunning = false;
  // count of tiles we want to capture in every spreed sheet
  public tilesPerSpreedSheet = 50;
  // the width of every capture
  public widthOfEveryCapture = 340;
  // the height of every capture
  public heightOfEveryCapture = 191;
  constructor(
    private _jsxInjectorService: JsxInjectorService,
    private _osInfoService: OsInfoService,
    private _appGlobals: AppGlobals,
    private _userManagerService: UserManagerService,
    private _ipcHandlerService: IpcHandlerService
  ) {
    this._ipcHandlerService.connectSubject.subscribe(connected => {
      if (connected) {
        this.ffmpegPath = this._osInfoService.getFFMpegZipPath();
        this.unzipFFMpeg();
        this.unzipDDHelper();
      }
    });
    this._userManagerService.loginSubject.subscribe(isLoggedin => {
      if (true === isLoggedin) {
        this.createSpreadSheetsFolder();
        this.readQueue();
        this.spreedSheetJob();
      }
    });
  }

  /**
   * read queue from db
   * @return {void}
   **/
  readQueue(): void {
    if (!this._appGlobals.userDBConnection.has("videoPreviews").value()) {
      this._appGlobals.userDBConnection.set("videoPreviews", []).write();
    }
    this.spreedSheetQueue = this._appGlobals.userDBConnection
      .get("videoPreviews")
      .filter({ loading: true })
      .value()
      .concat([]);
  }

  /**
   * create spreedsheets folder if it does not exist
   * @return {void}
   **/
  createSpreadSheetsFolder(): void {
    const folderPath =
      this._userManagerService.motionFactoryUserFileDirection() +
      "/spreedsheets";
    if (!fs.existsSync(folderPath)) {
      fs.ensureDirSync(folderPath, "0777", true);
    }
  }

  /**
   * unzip ffmpeg zip file according to os
   * @return {void}
   **/
  unzipFFMpeg(): void {
    if (!fs.existsSync(this.ffmpegPath)) {
      const rootFolder = path.dirname(this.ffmpegPath);
      fs.readdirSync(rootFolder).forEach(file => {
        const filePath = path.join(rootFolder, file);
        if (
          path
            .basename(filePath)
            .split(".")[0]
            .indexOf("ffmpeg") > -1
        ) {
          fs.unlinkSync(filePath);
        }
      });
      const ffmpegInfo = this._osInfoService.getFFMPEGInfo();
      const zipPath = ffmpegInfo.zip;
      const ffmpegFileName = ffmpegInfo.name;
      const zip = new AdmZip(zipPath);
      const data = zip.readFile(ffmpegFileName);
      fs.writeFileSync(this.ffmpegPath, data, {
        mode: "777"
      });
    }
  }

  /**
   * unzip ddhelper zip file according to os
   * @return {void}
   **/
  unzipDDHelper(): void {
    const ddHelperPath = this._osInfoService.getDDHelperZipPath();
    if (!fs.existsSync(ddHelperPath)) {
      const rootFolder = path.dirname(ddHelperPath);
      fs.readdirSync(rootFolder).forEach(file => {
        const filePath = path.join(rootFolder, file);
        if (
          path
            .basename(filePath)
            .split(".")[0]
            .indexOf("ddHelper") > -1
        ) {
          fs.unlinkSync(filePath);
        }
      });
      const ddHelperInfo = this._osInfoService.getDDHelperInfo();
      const { zip: zipPath, name: ddHelperFileName } = ddHelperInfo;
      const zip = new AdmZip(zipPath);
      const data = zip.readFile(ddHelperFileName);
      fs.writeFileSync(ddHelperPath, data, {
        mode: "777"
      });
    }
  }

  /**
   * check if preview exists for a file or not
   * @param {string} originFile - path of file we want to check
   * @param {function} onFound - function is being called with the info of video
   * @return {promise} - return promise of result.
   **/
  previewExistsForFile(originFile: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const searchResult = this._appGlobals.userDBConnection
        .get("videoPreviews")
        .find({ origin: originFile })
        .value();
      if (searchResult) {
        resolve({
          spreedSheetPath: `${this._userManagerService.motionFactoryUserFileDirection()}/spreedsheets/${
            searchResult.id
          }.png`,
          tiles: searchResult.tiles,
          isLoading: searchResult.loading,
          duration: searchResult.duration
        });
      } else {
        reject("notFound");
      }
    });
  }

  /**
   * if creating spreedsheet encountered an error this function will be called
   * @param {string} error - error of proccess
   * @param {string} originPath - file that is being proccessed
   * @return {void}
   **/
  errorCreatingSpreedSeet(queueJob: any, error: string): void {
    this.jobRunning = false;
    this._appGlobals.userDBConnection
      .get("videoPreviews")
      .find({ id: queueJob.id })
      .assign({ loading: false })
      .write();

    this.readQueue();
    this.creatingPreviewSubject.next({
      result: false,
      file: queueJob.origin,
      error: error
    });
    this.spreedSheetJob();
  }

  /**
   * if creating spreedsheet goes right this function will be called
   * @param {string} originPath - file that is being proccessed
   * @return {void}
   **/
  successCreatingSpreedSeet(queueJob: any): void {
    this.jobRunning = false;
    this._appGlobals.userDBConnection
      .get("videoPreviews")
      .find({ id: queueJob.id })
      .assign({
        loading: false,
        tiles: queueJob.tiles,
        duration: queueJob.duration
      })
      .write();
    this.readQueue();
    this.creatingPreviewSubject.next({
      result: true,
      file: queueJob.origin,
      spreedSheetPath: this._osInfoService.convertFileToURL(
        queueJob.outputPath
      ),
      tiles: queueJob.tiles,
      duration: queueJob.duration
    });
    this.spreedSheetJob();
  }

  /**
   * add file to queue of generating spreedsheet
   * @param {string} videoPath - the path of video we want to generate video of
   * @param {string} originFile - the origin file that preview is for
   * @return {void}
   **/
  createSpreadSheet(
    videoPath: string,
    packID: string,
    originFile: string
  ): void {
    this.creatingPreviewSubject.next({
      result: true,
      file: originFile,
      loading: true
    });
    this._appGlobals.userDBConnection
      .get("videoPreviews")
      .insert({
        video: videoPath,
        loading: true,
        origin: originFile,
        packID
      })
      .write();
    this.readQueue();
    this.spreedSheetJob();
  }

  /**
   * cron job of generating spreedsheet
   * @return {void}
   **/
  spreedSheetJob(): void {
    if (this.spreedSheetQueue.length === 0) {
      this.jobRunning = false;
      return;
    }
    if (this.jobRunning) {
      return;
    }
    this.jobRunning = true;
    const queueJob = this.spreedSheetQueue[0];
    queueJob.exe = this.ffmpegPath;
    queueJob.tilesPerSpreedSheet = this.tilesPerSpreedSheet;
    queueJob.widthOfEveryCapture = this.widthOfEveryCapture;
    queueJob.heightOfEveryCapture = this.heightOfEveryCapture;
    this._ipcHandlerService
      .emitEvent("ffmpegSequence", { queueJob })
      .subscribe(data => {
        if (data.success) {
          this.successCreatingSpreedSeet(data.result);
        } else {
          this.errorCreatingSpreedSeet(data.result, data.code);
        }
      });
  }
}
