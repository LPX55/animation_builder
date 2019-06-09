import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { ControllerType } from '../../../shared/models/controller-types';
import { SettingControllerService } from '../../services/setting-controller.service';
import { UserManagerService } from '../../../core/services/user-manager/user-manager.service';

@Component({
  selector: 'mf-premiere-setting-container',
  templateUrl: './premiere-setting-container.component.html',
  styleUrls: ['./premiere-setting-container.component.scss']

})
export class PremiereSettingContainerComponent {
  public ControllerType = ControllerType;
  public queue = [];
  constructor(private settingControllerService: SettingControllerService,
    private location: Location) {
  }

  get controllers(): any {
    return this.settingControllerService.settingData.controllers;
  }

  get settingHeaderName(): string {
    return this.settingControllerService.settingData.headerName;
  }

  /**
   * search in array and foreach controller that is between 2 comments push it to a group
   * and the return grouped controllers.
   *
   * @return {array} grouped controllers
   */
  get groupedControllers(): any[] {
    return this.settingControllerService.groupedControllers;
  }
  /**
   * search in array and return ungrouped controllers
   *
   * @return {array} ungrouped controllers
   */
  get nonGroupedControllers(): any[] {
    return this.settingControllerService.nonGroupedControllers;
  }
  /**
* detect change and wait till new change or 50ms to apply change
* @param {event} event - change event
* @param {any} controller the controller object
* @return {void}
*/
  handleChange(e: any, controller: any): void {
    this.settingControllerService.setParameter(e.index, e.value, false, controller, true, 30);
  }
  /**
 * back to recent location
 * @return {void}
 */
  handleBackClick(): void {
    this.settingControllerService.locationBack();
  }

  /**
   * Collects color controllers and return them as an array
  * @param {any} controller the controller object
   * @return {Array} - Array of color controllers
   */
  getGroupedColorControllers(controllers): any[] {
    return this.settingControllerService.getGroupedColorControllers(controllers);
  }
  /**
* generate an array of keys from an object
* @return {array} an array of keys in object
*/
  getObjectKeys(value: any): string[] {
    return Object.keys(value).map((item) => {
      const result = item === '0' ? 'X' : item === '1' ? 'Y' : item;
      return result;
    });
  }
}
