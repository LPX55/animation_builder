import { JsxInjectorService } from './../jsx-injector/jsx-injector.service';
import { UserManagerService } from './../user-manager/user-manager.service';
import { IpcHandlerService } from './../ipc-handler/ipc-handler.service';
import { Injectable } from '@angular/core';
import { AppGlobals } from '../../../../global';
import Aftereffects from '../../environments/aftereffects';

@Injectable()
export class AutoUpdateService {
  constructor(
    private _ipcHandlerService: IpcHandlerService,
    private _appGlobals: AppGlobals,
    private _jsxInjectorService: JsxInjectorService
  ) {
    this.startUpdate();
  }

  startUpdate(): void {
    this._ipcHandlerService.connectSubject.subscribe((connected) => {
      if (connected) {
        let runPluginChecker = false;
        if (this._jsxInjectorService.hostEnvironment.appId === Aftereffects.hostId) {
          runPluginChecker = true;
        }
        this._ipcHandlerService
          .emitEvent('autoUpdater', { currentVersion: this._appGlobals.APPVersion, runPluginChecker })
          .subscribe(response => {
            if (response.result) {
              alert(
                // tslint:disable-next-line:max-line-length
                'Text Animator has been updated to the latest version. Please close the app and open it again to use the latest version.'
              );
              this._ipcHandlerService.exitIPC().then(() => {
                this._ipcHandlerService.startIPC();
              });
            }
          });
      }
    });
  }
}
