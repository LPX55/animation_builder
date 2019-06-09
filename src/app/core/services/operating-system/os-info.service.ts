import { JsxInjectorService } from './../jsx-injector/jsx-injector.service';
import { Injectable } from '@angular/core';
import { AppGlobals } from '../../../../global';

@Injectable()
export class OsInfoService {
  /**
   * @public
   * @var currentPlatform Determines current platform
   * MAC for osx and WIN for windows
   */
  public currentPlatform: string;
  constructor(
    private _jsxInjectorService: JsxInjectorService,
    private _appGlobals: AppGlobals
  ) {
    this.checkCurrentPlatform();
  }

  private checkCurrentPlatform(): void {
    if ('darwin' === os.platform()) {
      this.currentPlatform = 'MAC';
    } else {
      this.currentPlatform = 'WIN';
    }
  }

  /**
   * Return all or single user info from OS
   * @param { string } userData Which info
   *
   * @example getOSUserInfo() return all data or getOSUserInfo('username') return os username
   * @return { Mixed }
   */
  getOSUserInfo(userData?: string): string | object {
    const OSUser = os.userInfo();
    if (userData) {
      return OSUser[userData];
    }

    return OSUser;
  }

  /**
   * Return the directory path of folder
   * @return { string }
   */
  getMotionFactoryAppDataFolder(): string {
    let jsonFileDirectory;
    if ('MAC' === this.currentPlatform) {
      jsonFileDirectory = `/Users/${this.getOSUserInfo(
        'username'
      )}/Library/Application Support/MotionFactory`;
    } else {
      jsonFileDirectory = `${path.parse(this.getOSUserInfo('homedir'))['root']}/Users/${this.getOSUserInfo(
        'username'
      )}/AppData/Roaming/MotionFactory`;
    }
    this.createMotionFactoryAppDataFolder(jsonFileDirectory);
    return jsonFileDirectory;
  }

  /**
   * Create app data folder
   * @return { string }
   */
  createMotionFactoryAppDataFolder(jsonFileDirectory): void {
    if (!fs.existsSync(jsonFileDirectory)) {
      fs.mkdirSync(jsonFileDirectory);
    }
  }

  /**
   * Return the path of database
   * @return { string }
   */
  getMotionFactoryDatabasePath(): string {
    return `${this.getMotionFactoryAppDataFolder()}/database.json`;
  }

  /**
   * Return the path of ffmpeg ziped
   * @return { string }
   */
  getFFMpegZipPath(): string {
    let ffmpegPath;
    if (this.currentPlatform === 'WIN') {
      ffmpegPath = `${this.getMotionFactoryAppDataFolder()}/ffmpeg${
        this._appGlobals.APPVersion
        }.exe`;
    } else {
      ffmpegPath = `${this.getMotionFactoryAppDataFolder()}/ffmpeg${
        this._appGlobals.APPVersion
        }`;
    }

    return ffmpegPath;
  }


  /**
   * Return the path of ddHelper ziped
   * @return { string }
   */
  getDDHelperZipPath(): string {
    let ddHelperPath;
    if (this.currentPlatform === 'WIN') {
      ddHelperPath = `${this.getMotionFactoryAppDataFolder()}/ddHelper${
        this._appGlobals.APPVersion
        }.exe`;
    } else {
      ddHelperPath = `${this.getMotionFactoryAppDataFolder()}/ddHelper${
        this._appGlobals.APPVersion
        }`;
    }

    return ddHelperPath;
  }

  /**
   * Return the path of essential graphics
   * @return { string }
   */
  getEssentialGraphicsPath(): string {
    let essentialGraphicsPath;
    if ('MAC' === this.currentPlatform) {
      essentialGraphicsPath = `/Users/${this.getOSUserInfo(
        'username'
      )}/Library/Application Support/Adobe/Common/Motion Graphics Templates`;
    } else {
      const appDataPath = this._appGlobals.processEnv['env']['APPDATA'];
      essentialGraphicsPath = `${appDataPath}/Adobe/Common/Motion Graphics Templates`;
    }
    return essentialGraphicsPath;
  }

  /**
   * Convert file path to uri
   * @param {string} filePath  Windows file path
   * @return { string }
   */
  convertFileToURL(filePath: string): string {
    if ('MAC' === this.currentPlatform) {
      return filePath;
    }
    let pathName = path.normalize(filePath).replace(/\\/g, '/');
    if (pathName[0] !== '/') {
      if (-1 === pathName.search('file:')) {
        pathName = `file://${pathName}`;
      }
    }
    return encodeURI(pathName);
  }

  /**
   * Return the file name and info path of ffmepg
   * @return { array }
   */
  getFFMPEGInfo(): any {
    if ('WIN' === this.currentPlatform) {
      return {
        zip: `${
          this._jsxInjectorService.defualtPath
          }/dist/assets/ffmpeg/ffmpeg_win.zip`,
        name: `ffmpeg.exe`
      };
    } else {
      return {
        zip: `${
          this._jsxInjectorService.defualtPath
          }/dist/assets/ffmpeg/ffmpeg_mac.zip`,
        name: `ffmpeg`
      };
    }
  }

  /**
   * Return the file name and info path of ddHelper
   * @return { array }
   */
  getDDHelperInfo(): any {
    if ('WIN' === this.currentPlatform) {
      return {
        zip: `${
          this._jsxInjectorService.defualtPath
          }/dist/assets/ddHelpers/ddHelper_win.zip`,
        name: `ddHelper.exe`
      };
    } else {
      return {
        zip: `${
          this._jsxInjectorService.defualtPath
          }/dist/assets/ddHelpers/ddHelper_mac.zip`,
        name: `ddHelper`
      };
    }
  }
}
