import { IpcHandlerService } from "./../ipc-handler/ipc-handler.service";
import { Injectable, isDevMode } from "@angular/core";
import { JsxInjectorService } from "../jsx-injector/jsx-injector.service";
import Aftereffects from "../../environments/aftereffects";
import Premiere from "../../environments/premiere";
import General from "../../environments/general";
import { Subject } from "rxjs";
import Photoshop from "../../environments/photoshop";
import Illustrator from "../../environments/illustrator";

@Injectable()
export class CepHostService {
  // current adobe host that extension runs in
  public host;
  // general property that access general function
  public general = new General();
  // current active host Id
  public hostId: string;
  // timeout property that used in executeWithDelay function
  private timeout: any;
  private timer = 0;
  private interval;
  private _colorPickerEventSet = false;
  private _colorPickerSelectedSubject: Subject<any> = new Subject<any>();
  constructor(
    private _jsxInjectorService: JsxInjectorService,
    private _ipcHandlerService: IpcHandlerService
  ) {
    this.assignHost();
    // depends on host pass its settingHandlerFunction to jsxService to do some control on setting Data.
    this._jsxInjectorService.settingHandlerFunction = setting =>
      this.host.settingHandler(setting);
    this.interval = setInterval(() => {
      this.timer++;
    }, 1000);
  }
  get settingData(): any {
    return this._jsxInjectorService.settingData;
  }
  /**
   * check adobe host and assign it to host property
   *
   * @return  {void}
   **/
  private assignHost(): void {
    switch (this._jsxInjectorService.hostEnvironment.appId) {
      case Aftereffects.hostId: {
        this.host = new Aftereffects(
          this._jsxInjectorService,
          this._ipcHandlerService
        );
        this.hostId = Aftereffects.hostId;
        this._jsxInjectorService.inject(this.host.scriptPath);
        this._jsxInjectorService.inject('hosts/ae/animation-builder.jsx');
        break;
      }
      case Premiere.hostId: {
        this.host = new Premiere(this._jsxInjectorService);
        this.hostId = Premiere.hostId;
        this._jsxInjectorService.inject(this.host.scriptPath);
        break;
      }
      case Photoshop.hostId: {
        this.host = new Photoshop(
          this._jsxInjectorService,
          this._ipcHandlerService
        );
        this.hostId = Photoshop.hostId;
        this._jsxInjectorService.inject(this.host.scriptPath);
        break;
      }
      case Illustrator.hostId: {
        this.host = new Illustrator(
          this._jsxInjectorService,
          this._ipcHandlerService
        );
        this.hostId = Illustrator.hostId;
        this._jsxInjectorService.inject(this.host.scriptPath);
      }
    }
    // depends on current active host, pass its setting module address(route url) to be active when setting data came form host
    this._jsxInjectorService.settingPath = `/dashboard/setting/${this.hostId}`;
    // eval json library
    this._jsxInjectorService.inject(this.general.JSONLibraryPath);
    // eval the current host jsx scripts file
    this._ipcHandlerService._serverAddress += this.host.ipcPort;
    this._ipcHandlerService.ipcPort = this.host.ipcPort;
    if (!isDevMode()) {
      this._ipcHandlerService.unzipIPC().then(() => {
        this._ipcHandlerService.startIPC();
      });
    }
  }

  /**
   * executes adobe host import function
   * @param {string} path  path of selected file
   * @param {string} data  optional data that pass to import function in host
   * @return  {void}
   */
  import(path: string, data: string, asSequence: boolean): void {
    this.host.import(path, this.general.escape(data), asSequence);
  }

  openProject(filePath): void {
    this.host.openProject(filePath);
  }

  /**
   * executes adobe host setParameter function
   * @param {number} parameterIndex  index of parameter to be change
   * @param {any} parameterValue  new value of parameter
   * @param {any} controller object of controller that used in setting
   * @param {boolean} key value of stopwatch, true or false
   * @param {boolean} withDelay execute function with delay or not
   * @param {boolean} delayTime time between each execution
   * @return  {void}
   */
  setParameter(
    parameterIndex,
    parameterValue,
    key,
    controller,
    withDelay = false,
    delayTime = 30
  ): void {
    if (withDelay) {
      this.executeWithDelay(() => {
        this.host.setParameter(parameterIndex, parameterValue, key, controller);
      }, delayTime);
    } else {
      this.host.setParameter(parameterIndex, parameterValue, key, controller);
    }
  }
  /**
   * executes host setColorParameter function
   * @param {number} controllerIndex  index of parameter to be change
   * @param {number} red  red color number
   * @param {number} green  green color number
   * @param {number} blue  blue color number
   * @return  {void}
   */
  setColorParameter(controllerIndex, { red, green, blue }): void {
    this.host.setColorParameter(controllerIndex, { red, green, blue });
  }

  removeAllKeys(controllerIndex): void {
    this.host.removeAllKeys(controllerIndex);
  }

  /**
   * remove remove a effect by index
   * @param {string} groupIndex - index of group that is name of effect
   * @return {void}
   */
  removeEffect(groupIndex): void {
    this.host.removeEffect(groupIndex);
  }

  /**
   * Opens color picker and returns color value as RGB array
   * @param {function} callbackFunction - call back function that returns the value
   *
   * @return {array} or {void}
   */
  openColorPicker(rgbColor): void {
    if (!this._colorPickerEventSet) {
      this._colorPickerEventSet = true;
      this._jsxInjectorService._csi.addEventListener(
        "colorPickerSelected",
        this.colorSelectedCallback.bind(this)
      );
    }
    this.host.openColorPicker(rgbColor);
  }

  /**
   * next color picker subject when colorpicker selected
   * @param {function} colorPickerValues - values of color picker
   * @return {void}
   */
  colorSelectedCallback(colorPickerValues): void {
    this._colorPickerSelectedSubject.next(colorPickerValues);
  }

  /**
   * get color picker Subject
   * @return {Subject}
   */
  getColorPickerSubject(): Subject<any> {
    return this._colorPickerSelectedSubject;
  }

  /**
   * executes host setColorParameter function
   * @param {function} functionToExecute  function to be execute with a delay time
   * @param {number} delayTime  a number in milliSecond for delay
   * @return  {void}
   */
  executeWithDelay(functionToExecute: () => void, delayTime: number): void {
    if (this.timer > delayTime) {
      clearTimeout(this.timeout);
      this.timer = 0;
    }
    this.timeout = setTimeout(() => {
      functionToExecute();
      clearTimeout(this.timeout);
    }, delayTime);
  }

  /**
   * returns allowed File formats in current adobe host app
   * @return  {string[]}
   */
  get allowedExtensions(): string[] {
    return this.host.allowedExtensions;
  }

  /**
   * reads all installed extensions
   * @return {string} array of installed extensions
   */
  get installedExtensionsList(): any[] {
    return this._jsxInjectorService.installedExtensionsList;
  }
}
