import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, HostBinding, OnInit } from '@angular/core';
import { ControllerType } from '../../../../shared/models/controller-types';
import { SettingControllerService } from '../../../services/setting-controller.service';

@Component({
  selector: 'mf-group-controller',
  templateUrl: './group-controller.component.html',
  styleUrls: ['./group-controller.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupControllerComponent implements OnInit {
  // emits when change occurs in iner controllers in group
  @Output() valueChange = new EventEmitter<any>();
  // name of group
  @Input() name: string;
  // index of group property
  @Input() groupIndex: number;
  // group has fx button
  @Input() hasFx: boolean;
  // fx value is true or false
  @Input() fx: boolean;
  // group should be recursive or not
  @Input() recursive: boolean;
  // content of group show be visible or not
  @Input() showContent: boolean;
  @Input() description: string;
  @Input() hasRTL = false;
  @Input() rtl = false;

  @Input() isMain: boolean;
  @Input() padding = 0;
  @HostBinding('class.main-group') mainGroup: boolean;
  public ControllerType = ControllerType;
  constructor(private _settingControllerService: SettingControllerService) {
  }
  ngOnInit(): void {
    this.mainGroup = this.isMain;
  }
  toggleContent(): void {
    this.showContent = !this.showContent;
  }

  /**
  * handles change of each controller in group
  * @param {controller} any an object of controller
  * @return {void}
  */
  handleChange($event, controller): void {
    this.valueChange.emit({ value: $event.value, index: $event.index, controller, key: $event.key });
  }
  /**
* handles change of group
* @return {void}
*/
  handleGroupChange($event): void {
    this.valueChange.emit({ value: $event.value, index: $event.index, controller: $event.controller, key: $event.key });
  }

  /**
* handles click event on fx checkbox of group
* @return {void}
*/
  handleFXClick(e): void {
    e.cancelBubble = true;
    this.fx = !this.fx;
    this.valueChange.emit({ value: this.fx, index: this.groupIndex, controller: {} });
  }

  /**
* generate an array of keys from an object
* @return {any[]} an array of keys in object
*/
  getObjectKeys(value: any): string[] {
    return Object.keys(value).map((item) => {
      const result = item === '0' ? 'X' : item === '1' ? 'Y' : item === '2' ? 'Z' : item;
      return result;
    });
  }
  get controllers(): any[] {
    return this._settingControllerService.settingData.controllers;
  }

  /**
 * search all controllers and returns child controllers of given group
 * @param {number} groupIndex index of group property
 * @return {any[]} an array controllers that have parentIndex equal to groupIndex
 */
  getGroupInnerControllers(groupIndex): any[] {
    let controllers = this._settingControllerService.settingData.controllers.filter(controller => {
      return controller.parentIndex === groupIndex;
    });
    if (this._settingControllerService.settingData.controllers[groupIndex].isABProperty) {
      controllers = controllers.filter(controller => controller.type !== 201 ||
        (controller.name !== 'www.pixflow.net' && controller.name !== '-----------------------------'));
    }
    return controllers;
  }
  /**
* check group have only description
* @param {number} groupIndex index of group property
* @return {boolean} boolean - is group have only description or not
*/
  checkEmptyGroup(groupIndex): boolean {
    if (this.getGroupInnerControllers(groupIndex).length === 1) {
      if (this.getGroupInnerControllers(groupIndex)[0].type === 202) {
        return false;
      } else {
        return true;
      }
    } else {
      return true;

    }
  }
  /**
  * Collects color controllers and return them as an array
  * @param {any} controller the controller object
  *
  * @return {any[]} - Array of color controllers
  */
  getGroupedColorControllers(controllers): any[] {
    return this._settingControllerService.getGroupedColorControllers(controllers);
  }
  /**
* group title padding when call group
* @return {string} - String of group title padding
*/
  get groupPadding(): string {
    return `${this.padding}px`;
  }
  /**
* add padding to controller title when create in group
* @return {string} - String of controller padding
*/
  controllersPadding(controllerHasKey): string {
    if (controllerHasKey) {
      return this.hasFx ? `${this.padding + 50}px` : `${this.padding + 26}px`;
    } else {
      return this.hasFx ? `${this.padding + 69}px` : `${this.padding + 26}px`;
    }


  }

  /**
  * remove current group
  * @return {void}
  */
  removeFx(): void {
    this._settingControllerService.removeEffect(this.groupIndex);
  }

  changeRTLStatus(): void {
    this.rtl = !this.rtl;
    this._settingControllerService.changeRTLStatus(this.groupIndex);
  }
}
