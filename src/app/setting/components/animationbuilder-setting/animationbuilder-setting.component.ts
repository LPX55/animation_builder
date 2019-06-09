import { ControllerType } from '../../../shared/models/controller-types';
import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { SettingControllerService } from '../../services/setting-controller.service';

@Component({
  selector: 'mf-animationbuilder-setting',
  templateUrl: './animationbuilder-setting.component.html',
  styleUrls: ['./animationbuilder-setting.component.scss']
})
export class AnimationbuilderSettingComponent implements OnInit {

  @Input() controllers;
  @Output() change = new EventEmitter<any>();
  showContent = true;
  constructor(private _settingControllerService: SettingControllerService) { }

  ngOnInit() {
    console.log(this.controllers);
  }


  /**
* detect change and wait till new change or 50ms to apply change
* @param {event} event - change event
* @param {any} controller the controller object
* @return {void}
*/
  handleChange(event: any): void {
    this.change.emit({ index: event.index, value: event.value, key: event.key, controller: event.controller });
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
  * search all controllers and returns main groups
  * @return {any[]} an array of main groups
  */
  get mainGroups(): any[] {
    return this.controllers ?
      this.controllers.filter(controller => {
        return controller.type === ControllerType.mainGroup && controller.isABProperty;
      }) : [];
  }

  /**
 * search all controllers and returns child controllers of given group
 * @param {number} groupIndex index of group property
 * @return {any[]} an array controllers that have parentIndex equal to groupIndex
 */
  getGroupInnerControllers(groupIndex): any[] {
    return this.controllers ?
      this.controllers.filter(controller => {
        return controller.parentIndex === groupIndex;
      }) : [];
  }

}
