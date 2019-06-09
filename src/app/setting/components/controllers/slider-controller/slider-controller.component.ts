import { Component, OnInit, EventEmitter, Input, Output, ViewChild, AfterViewInit,
   ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { SettingControllerService } from '../../../services/setting-controller.service';

@Component({
  selector: 'mf-slider-controller',
  templateUrl: './slider-controller.component.html',
  styleUrls: ['./slider-controller.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SliderControllerComponent implements OnInit, AfterViewInit {
  /**
* variable for input type range selected
* @public
*/
  inputSelected = false;

  textSelected = false;
  /**
   * Time of timeOut() its use in @function hideAndShowInput
   * @public
   */
  public checkUserMouseFocusTimeOut = 100;
  /**
 * Object that store timeOut() timmer its use in @function hideAndShowInput
 * @public
 */
  public timeOutObject;
  /**
* stroes silder status use in
* @public
*/
  public sliding = false;
  /**
* stroes drag status: positive value means its on drag status, zero or negative means its not on drag status
* @public
*/
  public sliderDragStatus = 0;

  /**
* stroes last Value of slider
* @public
*/
  public lastValue = 0;
  /**
* speed of scroll (step size)
* @public
*/
  public speed = 1;
  /**
* if user move slider ro right it will be true else false
* @public
*/
  public isSlidingRight = false;

  /**
 * market pack list view child
 * @public
 */
  @ViewChild('numberInput') numberInput: ElementRef;
  /**
* time to reset the speed on user idle
* @public
*/
  public resetSpeedTimeOut = 100;
  public hiddenSliderWidth = '0px';
  public hiddenSliderLeft = '0px';
  @ViewChild('mainSlider') mainSlider;
  @Input() name: string;
  @Input() index: number;
  @Input() min: number;
  @Input() max: number;
  @Input() value: number;
  @Input() padding: number;
  @Input() stepSize: number;
  @Input() hideSlider: boolean;
  @Input() hasKey = false;
  @Input() key = false;
  @Output() valueChange = new EventEmitter<any>();
  @Output() inputSelect = new EventEmitter<any>();
  @Output() inputDeselect = new EventEmitter<any>();
  constructor(private settingControllerService: SettingControllerService, private _elRef: ElementRef) {
  }

  ngOnInit(): void {
    this.hiddenSliderWidth = 2 * screen.width + 'px';
    this.hiddenSliderLeft = -1 * screen.width + 'px';
  }
  ngAfterViewInit(): void {
    this.refreshInputStyle();
    this.inputWidth();
  }

  get innerValue(): number {
    return this.settingControllerService.roundToTwo(this.value);
  }
  // controls the value input
  set innerValue(v: number) {
    if (v > this.max) {
      this.value = this.max;
    } else
      if (v < this.min) {
        this.value = this.min;
      } else {
        this.value = this.settingControllerService.roundToTwo(v);
      }
  }
  handleMouseup(e: any): void {
    e.target.select();
    this.textSelected = true;
    this.inputSelect.emit({});
  }

  handleMousedown(e: any): void {

    if (!this.textSelected) {
      window.getSelection().removeAllRanges();
      clearTimeout(this.timeOutObject);
    }
  }

  handleBlur(e: any): void {
    this.textSelected = false;
    this.inputDeselect.emit({});
    e.target.parentElement.querySelector('.hidden-range').style.display = 'block';
  }

  /**
   * change input width dynamic when is multi slider
   * @return void
   */
  inputWidth(): void {
    if (true === this.hideSlider) {
      const inputNumberType = this.numberInput.nativeElement;
      inputNumberType.style.width = ((this.value.toString().length + 1) * 7) + 'px';
    }

  }

  handleChange(): void {
    this.refreshInputStyle();
    this.valueChange.emit({ index: this.index, value: this.innerValue, key: this.key });
    setTimeout(() => {
      this.inputWidth();
    }, 100);

  }
  refreshInputStyle(): void {
    // when input slider is not hide
    if (!this.hideSlider) {
      const val = (this.innerValue - this.min) / (this.max - this.min);
      this.mainSlider.nativeElement.style.backgroundImage = `-webkit-gradient(linear, left top, right top,
        color-stop(${val}, #2A3D6F),
        color-stop(${val}, #303030)
         )`;
    }
  }

  /**
   * Change the display of input range
   * This function also handle the mouse move event out of the browser window
   * @return void
   */
  hideAndShowInput($event: any): void {
    $event.target.style.display = 'none';
    if (this.sliderDragStatus <= 2) {
      const sliderElement = $event.target.parentElement.querySelector('.slider-value');
      sliderElement.dispatchEvent(new CustomEvent('mousedown'));
      sliderElement.dispatchEvent(new CustomEvent('mouseup'));
    }
    this.sliderDragStatus = 0;
    this.timeOutObject = setTimeout(() => {
      if (false === this.textSelected) {
        $event.target.style.display = 'block';
      }
    }, this.checkUserMouseFocusTimeOut);
  }
  /**
  * handle hided slider input and controls stepSize, value...
  * @return void
  */
  handleHidedSliderInput(e: any): void {
    this.sliderDragStatus = this.sliderDragStatus + 1;
    const sliderDirectionIsRight = e.target.value > this.lastValue;
    if (sliderDirectionIsRight !== this.isSlidingRight) {
      this.speed = 1;
      this.isSlidingRight = sliderDirectionIsRight;
    }
    if (this.sliderDragStatus > 1) {
      const difference = sliderDirectionIsRight ? this.speed : -this.speed;
      this.innerValue += Math.floor(difference);
      this.handleChange();
      this.speed = this.speed + 1 > 0.0115 * (this.max - this.min) ? this.speed : this.speed + 1;
    } else {
      this.speed = 1;
    }
    this.lastValue = e.target.value;
    setTimeout((innerSpeed) => {
      if (this.speed === innerSpeed) {
        this.speed = 1;
      }
    }, this.resetSpeedTimeOut, this.speed);
  }
  handleMainMousedown(): void {
    this.sliding = true;
  }
  handleMainMouseup(): void {
    this.sliding = false;
  }
  /**
* change value of inputSelected to true when mouse down in div by class input-value
* @return {void}
*/
  handleInputNumberMousedown(): void {
    this.inputSelected = true;
    document.body.setAttribute('style', 'cursor: ew-resize !important;');
  }
  /**
* change value of inputSelected to false when mouse up in div by class input-value
* @return {void}
*/
  handleInputNumberMouseup(): void {
    this.inputSelected = false;
    document.body.style.cursor = 'default';
  }
  handleClockValueChange(value: boolean): void {
    this.key = value;
    if (true === value) {
      this.valueChange.emit({ index: this.index, value: this.innerValue, key: this.key });
    } else {
      this.settingControllerService.removeAllKeys(this.index);
    }
  }

}
