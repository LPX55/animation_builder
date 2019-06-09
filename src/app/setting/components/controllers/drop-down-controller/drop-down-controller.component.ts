import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { SettingControllerService } from '../../../services/setting-controller.service';

@Component({
  selector: 'mf-drop-down-controller',
  templateUrl: './drop-down-controller.component.html',
  styleUrls: ['./drop-down-controller.component.scss']
})
export class DropDownControllerComponent implements OnInit, OnDestroy {


  @Input() values;
  @Input() name: string;
  @Input() index: number;
  @Input() padding: number;
  @Input() hasKey = false;
  @Input() key = false;
  @Input() valueOptions: any;
  @Output() valueChange = new EventEmitter<any>();
  // for show drop down is open or not
  public isVisible;
  // current value variable
  private _currentValue;
  constructor(private _settingControllerService: SettingControllerService, private _changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    document.addEventListener('click', this.closeDropDown.bind(this));
  }
  handleInput(): void {
    this.valueChange.emit({ index: this.index, value: this.CurrentValue.index, key: this.key });
  }
  /**
   * remove document click on destroy
   * @return {void}
   */
  ngOnDestroy(): void {
    document.removeEventListener('click', this.closeDropDown.bind(this));
  }

  /**
   * active or deactive clock and change value
   * @param {boolean} value - show or do not show clock
   * @return {void}
   */
  handleClockValueChange(value: boolean): void {
    if (true === value) {
      this.handleInput();
    } else {
      this._settingControllerService.removeAllKeys(this.index);
    }
    this.key = value;
  }
  /**
   * return current value of drop down
   * @return {any} value of drop down
   */
  get CurrentValue(): any {
    if (undefined === this._currentValue) {
      const value = this.valueOptions[0].find((item) => item.index === this.values[0]);
      this._currentValue = value;
    }
    return this._currentValue;
  }

  /**
 * change current value
 * @param {object} item - item of drop down
 * @param {object} event - event
 * @return {void}
 */
  changeCurrentValue(item, event): void {
    event.stopPropagation();
    this._currentValue = item;
    this.handleInput();
    this.isVisible = !this.isVisible;
  }
  /**
  * close controller drop down
  * @return {void}
  */
  closeDropDown(): void {
    if (this.isVisible) {
      this.isVisible = false;
      this._changeDetectorRef.markForCheck();
    }
  }
  /**
* toggle controller drop down
* @return {void}
*/
  toggleDropDown(event): void {
    if (document.querySelector('.show-controller-drop-down')) {
      document.querySelector('.show-controller-drop-down').classList.remove('show-controller-drop-down');
    }
    event.stopPropagation();
    this.isVisible = !this.isVisible;
  }

}
