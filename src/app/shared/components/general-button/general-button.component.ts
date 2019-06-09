import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'mf-general-button',
  templateUrl: './general-button.component.html',
  styleUrls: ['./general-button.component.scss']
})
export class GeneralButtonComponent implements OnInit {

  private _type = '';
  private _text = '';
  private _backgroundColor = '';
  private _borderColor = '';
  private _fontSize = '';
  private _lineHeight = '';
  private _padding = '';
  private _boxShadow = '';

  @Input() disabled = false;

  /**
   * set type of button.
   * @since 0.0.1
   */
  @Input() set type(type: string) {
    this._type = type ? type : 'link';
  }
  get type(): string { return this._type; }

  /**
   * set text for button.
   * @since 0.0.1
   */
  @Input() set text(text) {
    this._text = text ? text : 'button';
  }
  get text(): string { return this._text; }

  /**
   * set background color for button.
   * @since 0.0.1
   */
  @Input() set backgroundColor(backgroundColor: string) {
    if (this._type === 'link') {
      this._backgroundColor = 'transparent';
    } else {
      this._backgroundColor = backgroundColor ? backgroundColor : '#204BE6';
    }
  }
  get backgroundColor(): string { return this._backgroundColor; }

  /**
  * set border color for button.
  *  @since 0.0.1
  */
  @Input() set borderColor(borderColor: string) {
    if (this._type === 'border') {
      this._borderColor = borderColor ? borderColor : '#204BE6';
    }
  }
  get borderColor(): string { return this._borderColor; }

  /**
* set box shadow for button.
*  @since 0.0.1
*/
  @Input() set boxShadow(borderColor: string) {
    if (this._type === 'border') {
      this._boxShadow = `inset 0 0 5px ${borderColor}, 0 0 5px ${borderColor} `;
    }
  }
  get boxShadow(): string { return this._boxShadow; }

  /**
  * set font size for button.
  * @since 0.0.1
  */
  @Input() set fontSize(fontSize: string) {
    this._fontSize = fontSize ? fontSize : '11px';

  }
  get fontSize(): string { return this._fontSize; }

  /**
  * set padding for button.
  * @since 0.0.1
  */
  @Input() set padding(padding: string) {
    this._padding = padding ? padding : '11px';

  }
  get padding(): string { return this._padding; }


  @Output() clicked: EventEmitter<any> = new EventEmitter();

  constructor() {
  }

  ngOnInit(): void {
  }

  /**
    * click event for buttton.
    *
    * @fires GeneralButtonComponent#click
    * @since 0.0.1
    * @return {void}
    */
  clickEvent(): void {
    this.clicked.emit();
  }

  mouseOverEffect($event): void {
    const buttonHtml = ($event.target.classList.contains('general-button')) ? $event.target : $event.target.parentElement;
    const boxShadowColor = this.borderColor;
    if (this.borderColor) {
      buttonHtml.style.backgroundColor = boxShadowColor;
    }
  }

  mouseOutEffect($event): void {
    const buttonHtml = ($event.target.classList.contains('general-button')) ? $event.target : $event.target.parentElement;
    const boxShadowColor = this.borderColor;
    if (this.borderColor) {
      buttonHtml.style.backgroundColor = 'transparent';
    }
  }

}
