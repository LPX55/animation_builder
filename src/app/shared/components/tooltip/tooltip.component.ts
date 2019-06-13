import { Component, OnInit, Input, ElementRef } from "@angular/core";

@Component({
  selector: "mf-tooltip",
  templateUrl: "./tooltip.component.html",
  styleUrls: ["./tooltip.component.scss"]
})
export class TooltipComponent implements OnInit {
  public _show = false;
  private parentElement;
  private nativeElement;
  @Input() message: string;
  @Input() parentName: string;
  @Input() delay = 0;
  @Input() haveTopArrow: boolean;
  @Input() fontSize: number;
  @Input() maxWidth: number;
  @Input() set show(value: boolean) {
    const that = this;
    if (value) {
      that._show = value;
      that.setParentZindex();
    } else {
      that._show = value;
      that.removeParentZindex();
    }
  }

  get show(): boolean {
    return this._show;
  }

  constructor(private elRef: ElementRef) {
    this.nativeElement = elRef.nativeElement;
  }

  ngOnInit(): void {
    if (this.parentName !== "" && this.parentName !== "NaN") {
      this.parentElement = this.nativeElement.closest(this.parentName);
    }
  }

  /**
   * Calculate the tooltip minimum width base on its message length
   * @param {number} messageLength - Length of message
   * @return {string} string contain minimum number width plus the px postfix
   */
  calculateMinWidth(messageLength): string {
    let minWidth: number;
    if (messageLength > 30) {
      minWidth = messageLength * 5;
    } else {
      minWidth = messageLength * 6;
    }
    return minWidth + "px";
  }

  /**
   * Determine positon of tooltip arrow base on number of message characters
   * @param {number} messageLength - Length of message
   * @return {string} class name which will be first , middle or last which has been styled on css file
   */
  calculateArrowPosition(messageLength): string {
    if (messageLength < 12) {
      return "first";
    }

    if (messageLength >= 12 && messageLength < 30) {
      return "middle";
    }

    if (messageLength >= 30) {
      return "last";
    }
  }

  /* set tooltip parent zindex to solve the issue of item template issue on hover status*/
  setParentZindex(): void {
    if (this.parentElement) {
      this.parentElement.classList.add("tooltip-showing");
    }
  }

  /* remove tooltip parent zindex to solve the issue of item template issue on hover status*/
  removeParentZindex(): void {
    const parentElement = this.parentElement;
    if (parentElement) {
      /* We used settimeout as the transition for tooltip is 300ms in css and removing class is instant which cause the overlapping issue */
      setTimeout(function(): void {
        parentElement.classList.remove("tooltip-showing");
      }, 0);
    }
  }

  /**
   * Check if the delay has been set by user or not so we can set a class for styling
   *  @return {boolean} return true if the user set the delay value manually
   */
  isDelaySet(): boolean {
    if (this.delay > 0) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Set transition delay style for the element
   * @return {string} style string which set the delay for the element
   */
  setTransitionDelay(): string {
    if (this.delay === 0 || !this._show) {
      return "";
    } else {
      return this.delay + "s";
    }
  }
}
