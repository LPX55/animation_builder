import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { ControllerType } from '../../../shared/models/controller-types';
import { SettingControllerService } from '../../services/setting-controller.service';
import { UserManagerService } from '../../../core/services/user-manager/user-manager.service';

@Component({
  selector: 'mf-aftereffects-setting-container',
  templateUrl: './aftereffects-setting-container.component.html',
  styleUrls: ['./aftereffects-setting-container.component.scss'],

})
export class AftereffectsSettingContainerComponent {
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
* detect change and wait till new change or 50ms to apply change
* @param {event} event - change event
* @param {any} controller the controller object
* @return {void}
*/
  handleChange(event: any): void {
    this.settingControllerService.setParameter(event.index, event.value, event.key, event.controller, false, 0);
  }
  /**
 * back to recent location
 * @return {void}
 */
  handleBackClick(): void {
    this.settingControllerService.locationBack();
  }
}
