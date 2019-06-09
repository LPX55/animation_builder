import { Component, OnInit, EventEmitter, Input, Output, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeStyle } from '@angular/platform-browser';
import { SettingControllerService } from '../../../services/setting-controller.service';

@Component({
  selector: 'mf-degree-controller',
  templateUrl: './degree-controller.component.html',
  styleUrls: ['./degree-controller.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DegreeControllerComponent implements OnInit {
  textSelected = false;
  /**
   * Time of timeOut() its use in @function hideAndShowInput
   * @public
   */
  public checkUserMouseFocusTimeOut = 100;
  /**
 * Object that store timeOut() timer its use in @function hideAndShowInput
 * @public
 */
  public timeOutObject;
  /**
* stores drag status: positive value means its on drag status, zero or negative means its not on drag status
* @public
*/
  public sliderDragStatus = 0;

  /**
* stores last Value of slider
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
  public hiddenSliderWidth = '0px';
  public hiddenSliderLeft = '0px';
  public degreeImageCenterX = 0;
  public degreeImageCenterY = 0;
  public mouseIsDown = false;
  @Input() name: string;
  @Input() index: number;
  @Input() value: number;
  @Input() padding: number;
  @Input() hasKey = false;
  @Input() key = false;
  @Output() valueChange = new EventEmitter<any>();
  @ViewChild('degreeImg') degreeImg: ElementRef;
  @ViewChild('input') degreeInput: ElementRef;
  constructor(private _domSanitizer: DomSanitizer, private settingControllerService: SettingControllerService) { }

  ngOnInit(): void {
    this.hiddenSliderWidth = 2 * screen.width + 'px';
    this.hiddenSliderLeft = -1 * screen.width + 'px';
    this.degreeInput.nativeElement.style.display = 'none';
  }
  /**
* Change the inner value of div
* This function like innervalue get counter value
* @return {string} return value of counter
*/
  get innerDivValue(): SafeHtml {
    if (this.value > 0) {
      const counter = Math.floor(this.value / 360);
      const staticNumber = this.settingControllerService.roundToTwo(this.value - counter * 360);
      return counter === 0 ? `${staticNumber} <span class="degree-sign" > ° </span>` : `${counter} <span class="degree-x-sign"> x </span>
      +${staticNumber} <span class="degree-sign"> ° </span>`;
    } else {
      const counter = Math.ceil(this.value / 360);
      const staticNumber = this.settingControllerService.roundToTwo(this.value - counter * 360);
      return counter === 0 ? `${staticNumber} <span class="degree-sign"> ° </span>` : `${counter} <span class="degree-x-sign"> x </span>
       - ${staticNumber * -1} <span class="degree-sign"> ° </span>`;
    }
  }

  get innerValue(): string {
    if (this.value > 0) {
      const counter = Math.floor(this.value / 360);
      const staticNumber = this.settingControllerService.roundToTwo(this.value - counter * 360);
      return counter === 0 ? `${staticNumber} °` : `${counter} x +${staticNumber} °`;
    } else {
      const counter = Math.ceil(this.value / 360);
      const staticNumber = this.settingControllerService.roundToTwo(this.value - counter * 360);
      return counter === 0 ? `${staticNumber} °` : `${counter} x - ${staticNumber * -1} °`;
    }
  }
  // controls the value input
  set innerValue(v: string) {
    v = v.replace(/[X]/g, 'x');
    v = v.trim();
    let counterTemp = v.substr(0, v.indexOf('x') || 0);
    counterTemp = this.removeNonNumericCharacters(counterTemp, true);
    let counter = counterTemp.length ? parseInt(counterTemp, 10) : 0;
    let staticNumberTemp = v.substr(v.indexOf('x') + 1 || 0, v.length);
    staticNumberTemp = this.removeNonNumericCharacters(staticNumberTemp, true);
    let staticNumber = staticNumberTemp.length ? parseInt(staticNumberTemp, 10) : 0;
    counter = isNaN(counter) ? 0 : counter;
    staticNumber = isNaN(staticNumber) ? 0 : staticNumber;
    this.value = counter * 360 + staticNumber;
  }
  /**
* checking mouse up in degree div
* This function change text selected when mouseup in degree div
* @return {void}
*/
  handleMouseup(e: any): void {
    this.textSelected = true;
  }

  /**
* checking mouse down in degree div
* This function use for double click in input to select all of the value
* @return {void}
*/
  handleMousedown(e: any): void {
    if (!this.textSelected) {
      window.getSelection().removeAllRanges();
      clearTimeout(this.timeOutObject);
    }
  }


  handleBlur(e: any): void {
    this.textSelected = false;
    this.changeInputToDiv(e);
  }

  handleChange(): void {
    this.valueChange.emit({ index: this.index, value: this.value, key: this.key });
  }

  /**
* change degree div to input use it in hideAndShowInput() function
* @return {void}
*/
  changeDivToInput(e: any): void {
    e.target.parentElement.querySelector('.hidden-range').style.display = 'none';
    e.target.parentElement.querySelector('.degree-value').style.display = 'none';
    this.degreeInput.nativeElement.style.display = 'flex';
    e.target.nextElementSibling.select();
  }
  /**
* change input to degree div use it in hideAndShowInput() and handleBlur() function
* @return {void}
*/
  changeInputToDiv(e: any): void {
    e.target.parentElement.querySelector('.hidden-range').style.display = 'block';
    e.target.parentElement.querySelector('.degree-value').style.display = 'flex';
    this.degreeInput.nativeElement.style.display = 'none';
  }
  /**
  * Change the display of input range
  * This function also handle the mouse move event out of the browser window
  * @return void
  */
  hideAndShowInput($event: any): void {

    $event.target.style.display = 'none';
    if (this.sliderDragStatus <= 2) {
      const degreeElement = $event.target.parentElement.querySelector('.degree-value');
      degreeElement.dispatchEvent(new CustomEvent('mousedown'));
      degreeElement.dispatchEvent(new CustomEvent('mouseup'));

    }
    this.sliderDragStatus = 0;
    this.timeOutObject = setTimeout(() => {
      if (false === this.textSelected) {
        this.changeInputToDiv($event);
      } else {
        this.changeDivToInput($event);
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
      this.value += Math.floor(difference);
      this.handleChange();
      this.speed = this.speed + 1 > 20 ? this.speed : this.speed + 1;
    } else {
      this.speed = 1;
    }
    this.lastValue = e.target.value;
    setTimeout((innerSpeed) => {
      if (this.speed === innerSpeed) {
        this.speed = 1;
      }
    }, 100, this.speed);
  }

  get imageTransform(): any {
    return this._domSanitizer.bypassSecurityTrustStyle(`rotate( ${this.value}deg)`);
  }

  /**
* handle change of main input
* @return void
*/
  handleMainSliderChange(e: any): void {
    e.target.value = this.removeNonNumericCharacters(e.target.value);
    this.innerValue = e.target.value;
    this.handleChange();
  }
  /**
* removes non numeric characters from a string
* @param {string} value string parameter
* @param {boolean} removeSpace  if true, space will remove to.
* @return string
*/
  removeNonNumericCharacters(value: string, removeSpace = false): string {
    return removeSpace ? value.replace(/[^0-9.\-\+X]/gi, '') : value.replace(/[^0-9.\-\+X ]/gi, '');
  }
  /**
 * handle what happen when user click(mouseDown) on degree image
 * @return void
 */
  handleDegreeMouseDown(e: any): void {
    this.mouseIsDown = true;
    this.changeValueByEvent(e);
    document.addEventListener('mouseup', this.handleDegreeMouseUp.bind(this));
    document.addEventListener('mousemove', this.handleDocumentMousemove.bind(this));
  }

  handleDocumentMousemove(e: any): void {
    if (this.mouseIsDown) {
      this.changeValueByEvent(e);
    }
  }
  /**
 * changes value of input relative to mouse position
 * @param {any} e event parameter (mousedown, mouseup or mousemove)
 * @return void
 */
  changeValueByEvent(e: any): void {
    const { top, left, width, height } = this.degreeImg.nativeElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    this.degreeImageCenterY = top + height / 2 + scrollTop;
    this.degreeImageCenterX = left + width / 2;
    let degree = (180 / Math.PI * -1) * (Math.atan2((e.pageY - this.degreeImageCenterY), (e.pageX - this.degreeImageCenterX)));
    degree = 90 - degree;
    degree = degree < 0 ? degree + 360 : degree;
    const counter = Math.floor(this.value / 360);
    const staticNumber = this.value - counter * 360;
    const degreeDiff = degree - staticNumber;
    const diff = (degreeDiff) < 0 ? ((staticNumber - degree) > 180 ? (degreeDiff) + 360 :
      ((degreeDiff) > 180 ? - 360 + (degreeDiff) : (degreeDiff))) :
      (degreeDiff) > 180 ? (degreeDiff) - 360 : (degreeDiff);
    this.value = this.settingControllerService.roundToTwo(diff + this.value);
    this.handleChange();
  }
  /**
 * handle what happen when user click(mouseUp) on degree image
 * @return void
 */
  handleDegreeMouseUp(e: any): void {
    this.mouseIsDown = false;
    document.removeEventListener('mousemove', this.handleDocumentMousemove.bind(this));
  }

  handleClockValueChange(value: boolean): void {
    this.key = value;
    if (true === value) {
      this.handleChange();
    } else {
      this.settingControllerService.removeAllKeys(this.index);
    }
  }

}
