import Host from '../interfaces/host/host';
import General from './general';
import { ControllerType } from '../../shared/models/controller-types';
import * as cloneDeep from 'lodash/cloneDeep';
import { JsxInjectorService } from '../services/jsx-injector/jsx-injector.service';
import {  isDevMode } from '@angular/core';

export default class Premiere extends General implements Host {
    public static hostId = 'PPRO';
    public hostName = 'Premiere Pro';
    public scriptPath = 'hosts/pr/common.jsx';
    public hostVersion = this._jsxInjectorService.hostEnvironment.appVersion;
    allowedExtensions = ['mogrt', 'prproj', 'aep'];
    public ipcPort = isDevMode ? 45032 : 45033;

    constructor(private _jsxInjectorService: JsxInjectorService) {
        super();
    }
    import(itemPath, data, asSequence): void {
        this._jsxInjectorService.evalScript(`$._MFPremiere.importItem("${itemPath}", '${data}', ${asSequence})`);

    }
    openProject(itemPath): void {
        this._jsxInjectorService.evalScript(`$._MFPremiere.openProject('${itemPath}')`);
    }
    setParameter(parameterIndex, parameterValue, controller): void {
        if (controller.type === ControllerType.point || controller.type === ControllerType.pointPercent) {
            parameterValue = this.convertAbsoluteValueToRelativeValue(parameterValue, controller.frameSize);
        }
        if (typeof parameterValue === 'string') {
            parameterValue = parameterValue ? parameterValue : ' ';
            parameterValue = JSON.stringify(parameterValue);
        } else if (parameterValue instanceof Array || typeof parameterValue === 'object') {
            parameterValue = JSON.stringify(parameterValue);
        }
        this._jsxInjectorService.evalScript(`$._MFPremiere.setClipProperty(${parameterIndex}, ${parameterValue})`);
    }
    setColorParameter(controllerIndex, { red, green, blue }): void {
        this._jsxInjectorService.evalScript(`$._MFPremiere.setColorValue(${controllerIndex}, ${red}, ${green}, ${blue})`);
    }
    settingHandler(settingData: any): any {
        const data = cloneDeep(settingData.controllers);
        settingData.controllers = data.map((item) => {
            if (item.type === ControllerType.point || item.type === ControllerType.pointPercent) {
                let value = this.convertRelativeValueToAbsoluteValue(item.clipValue, item.frameSize);
                value = value.map((valueItem) => {
                    return this.roundToTwo(valueItem);
                });
                item.clipValue = value;
            }
            return item;
        });
        return settingData;
    }

    openColorPicker(rgbColor): void {
        this._jsxInjectorService.evalScript(`$._MFPremiere.openColorPicker('${rgbColor[0]}','${rgbColor[1]}','${rgbColor[2]}',1)`);
    }

}
