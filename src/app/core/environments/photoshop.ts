import { IpcHandlerService } from '../services/ipc-handler/ipc-handler.service';
import HostImage from '../interfaces/host/host.image';
import General from './general';
import { JsxInjectorService } from '../services/jsx-injector/jsx-injector.service';
import {  isDevMode } from '@angular/core';

export default class Photoshop extends General implements HostImage {
    public static hostId = 'PHXS';
    public hostName = 'photoshop';
    public scriptPath = 'hosts/ps/common.jsx';
    allowedExtensions = [];
    public ipcPort = isDevMode ? 45012 : 45014;

    constructor(
        private _jsxInjectorService: JsxInjectorService,
        private _ipcHandlerService: IpcHandlerService
    ) {
        super();
        this._jsxInjectorService.inject(this.ddHelperPath);
    }
    import(itemPath, data): void {
        this._jsxInjectorService.evalScript(`$._MFPhotoShop.importItem("${itemPath}", '${data}', ${false})`);

    }
    openProject(itemPath): void {}


}
