import Host from '../interfaces/host/host';
import General from './general';
import { JsxInjectorService } from '../services/jsx-injector/jsx-injector.service';
import * as cloneDeep from 'lodash/cloneDeep';
import { ControllerType } from '../../shared/models/controller-types';

export default class Aftereffects extends General implements Host {
    public static hostId = 'AEFT';
    public hostName = 'After Effects';
    public scriptPath = 'hosts/ae/common.jsx';
    public hostVersion = this._jsxInjectorService.hostEnvironment.appVersion;
    allowedExtensions = ['aep', 'ffx', 'mogrt'];
    constructor(
        private _jsxInjectorService: JsxInjectorService,
    ) {
        super();
        // eval drag and drop lib
        this._jsxInjectorService.inject(this.ddHelperPath);
    }
    import(itemPath, data, asSequence): void {
        const fileFormat = path.extname(itemPath);
        if (fileFormat === '.aep') {
            this._jsxInjectorService.evalScript(`$._MFAfterEffects.importItem("${itemPath}", '${data}')`);
        } else if (fileFormat === '.ffx') {
            this._jsxInjectorService.evalScript(`$._MFAfterEffects.applyPreset("${itemPath}")`);
        } else if (fileFormat === '.mogrt') {
            this.extractMogrt(itemPath);
        } else {
            this._jsxInjectorService.evalScript(`$._MFAfterEffects.importFootage("${itemPath}", ${asSequence})`);
        }
    }

    openProject(itemPath): void {
        this._jsxInjectorService.evalScript(`$._MFAfterEffects.openAEPProject('${itemPath}')`);
    }
    setParameter(parameterIndex, parameterValue, key?): void {
        parameterValue = (typeof parameterValue === 'string' && parameterValue === '') ? ' ' : parameterValue;
        parameterValue = JSON.stringify(parameterValue);
        this._jsxInjectorService.evalScript(`$._MFAfterEffects.setLayerProperty(${parameterIndex}, ${parameterValue}, ${key})`);
    }
    setColorParameter(controllerIndex, { red, green, blue }, key?): void {
        this.setParameter(controllerIndex, this.convertColorBase255RelativeValueToBase1([red, green, blue, 255]), key);
    }
    settingHandler(settingData: any[]): any {
        const data = cloneDeep(settingData);
        const textsGroup = data.controllers.filter(text => text.name === 'Text Inputs' && ControllerType.mainGroup);
        const otherGroups = data.controllers.filter(text => !(text.name === 'Text Inputs' && ControllerType.mainGroup));
        data.controllers = [...textsGroup, ...otherGroups];
        return data;
    }

    removeAllKeys(controllerIndex: number): void {
        this._jsxInjectorService.evalScript(`$._MFAfterEffects.removeAllKeys(${controllerIndex})`);
    }
    /**
     * remove effect by name
     * @param {number} effectIndex - index of effect
     * @return {void}
     */
    removeEffect(effectIndex: number): void {
        this._jsxInjectorService.evalScript(`$._MFAfterEffects.removeEffect('${effectIndex}')`);
    }

    extractMogrt(fileName: string): void {
    }
    openColorPicker(rgbColor): void {
        this._jsxInjectorService.evalScript(`$._MFAfterEffects.openColorPicker('${rgbColor[0]}','${rgbColor[1]}','${rgbColor[2]}',1)`);
    }
}
