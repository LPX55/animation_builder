import { Injectable } from '@angular/core';
import { JsxInjectorService } from '../../core/services/jsx-injector/jsx-injector.service';
import { ControllerType } from '../../shared/models/controller-types';
import { CepHostService } from '../../core/services/cep-host/cep-host.service';
import * as cloneDeep from 'lodash/cloneDeep';
import { Location } from '@angular/common';
@Injectable()
export class SettingControllerService {

  constructor(private jsxInjectorService: JsxInjectorService, private cepHostService:
    CepHostService, private location: Location
  ) { }
  get settingData(): any {
    return this.cepHostService.settingData;
  }
  /**
 * search in array and foreach controller that is between 2 comments push it to a group
 * and the return grouped controllers.
 *
 * @return {array} grouped controllers
 */
  get groupedControllers(): any[] {
    const result = [];
    if (!this.settingData.controllers) {
      return result;
    }
    let index = -1;
    const controllers = [...this.settingData.controllers];
    controllers.forEach((value) => {
      if (value.type === ControllerType.comment) {
        index++;
        value.controllers = [];
        result[index] = value;
      } else {
        if (index > -1) { result[index].controllers.push(value); }
      }
    });
    return result;
  }

  /**
 * search in array and return ungrouped controllers
 *
 * @return {array} ungrouped controllers
 */
  get nonGroupedControllers(): any[] {
    if (this.settingData.controllers) {
      const index = this.settingData.controllers.findIndex(item => item.type === ControllerType.comment);
      if (index < 0) { return this.settingData.controllers; }
      return this.settingData.controllers.slice(0, index);
    } else {
      return [];
    }
  }
  /**
  * Collects color controllers and return them as an array
  *
  * @return {Array} - Array of color controllers
  */
  getGroupedColorControllers(controllers): any[] {
    const colorControllers = controllers.filter((controller) => {
      return controller.type === ControllerType.color;
    });
    return colorControllers;
  }
  setParameter(parameterIndex, parameterValue, key, controller, withDelay = false, delayTime = 30): void {
    return this.cepHostService.setParameter(parameterIndex, parameterValue, key, controller, withDelay, delayTime);
  }
  roundToTwo(number: number): number {
    return this.cepHostService.general.roundToTwo(number);
  }
  openColorPicker(rgbColor: number[]): void {
    return this.cepHostService.openColorPicker(rgbColor);
  }
  setColorParameter(controllerIndex, { red, green, blue }): void {
    return this.cepHostService.setColorParameter(controllerIndex, { red, green, blue });
  }
  removeAllKeys(controllerIndex: number): void {
    return this.cepHostService.removeAllKeys(controllerIndex);
  }
  /**
  * remove a effect
  * @param {string} groupIndex - index of group that is index of effect
  * @return {void}
  */
  removeEffect(groupIndex: number): void {
    return this.cepHostService.removeEffect(groupIndex);
  }
  changeRTLStatus(groupIndex: number): void {
    return this.jsxInjectorService.evalScript(`$._MFAfterEffects.changeRTLStatus(${groupIndex})`);
  }
  locationBack(): void {
    this.location.back();
    this.jsxInjectorService.settingData = {};
  }

  get hostId(): string {
    return this.cepHostService.hostId;
  }


}
