import { Subscription } from "rxjs";
import { CepHostService } from "./../../../../core/services/cep-host/cep-host.service";
import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy
} from "@angular/core";
import { SettingControllerService } from "../../../services/setting-controller.service";

@Component({
  selector: "mf-color-controller",
  templateUrl: "./color-controller.component.html",
  styleUrls: ["./color-controller.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColorControllerComponent implements OnInit {
  @Input() name: string;
  @Input() controllers: any[];
  @Input() padding: string;
  @Input() hasKey = false;
  @Input() key = false;

  public isHovered = false;
  private _colorPickerSubject: Subscription;
  constructor(
    private settingControllerService: SettingControllerService,
    private _cepHostService: CepHostService
  ) {}

  ngOnInit(): void {}

  /**
   * Opens color picker and sets the color value in mogrt files after user chose a color
   * @param {any} event - click event on a color palette
   * @param {number} controllerIndex - index of color controller
   *
   * @return {void}
   */
  openColorPicker(event, controllerIndex): void {
    this._colorPickerSubject = this._cepHostService
      .getColorPickerSubject()
      .subscribe(colorPickerValues => {
        event.srcElement.style.backgroundColor =
          // tslint:disable-next-line:max-line-length
          `rgb(${Math.floor(colorPickerValues.data.red)},${Math.floor(
            colorPickerValues.data.green
          )},${Math.floor(colorPickerValues.data.blue)})`;
        this.settingControllerService.setColorParameter(controllerIndex, {
          red: colorPickerValues.data.red,
          green: colorPickerValues.data.green,
          blue: colorPickerValues.data.blue
        });
        this._colorPickerSubject.unsubscribe();
      });
    this.settingControllerService.openColorPicker(
      this.getRGBColor(event.srcElement.style.backgroundColor)
    );
  }

  getBackgroundStyle(control): string {
    return this.settingControllerService.hostId === "PPRO"
      ? this.initialSetColor(
          control.clipValue[1],
          control.clipValue[2],
          control.clipValue[3]
        )
      : this.initialSetColor(
          control.value[0] * 255,
          control.value[1] * 255,
          control.value[2] * 255
        );
  }

  getRGBColor(backgroundColor): number[] {
    const digits = /(.*?)rgb\((\d+), (\d+), (\d+)\)/.exec(backgroundColor);
    const r = parseInt(digits[2], 10);
    const g = parseInt(digits[3], 10);
    const b = parseInt(digits[4], 10);
    return [r, g, b];
  }

  /* Calculate collor pallet cells width based on number of cells for responsive improvement */
  calculateMaxWidth(numberOfItems): string {
    if (numberOfItems > 3) {
      const percentage = 100 / numberOfItems;
      return percentage + "%";
    } else {
      return "50px";
    }
  }

  /**
   * Reads color values for each color controller from mogrt files
   * @param {number} red - red value
   * @param {number} green - green value
   * @param {number} blue - blue value
   *
   * @example
   * initialSetColor(255,0,0)
   *
   * @return {string} - CSS syntax for RGB color
   */
  initialSetColor(red, green, blue): string {
    return `rgb(${Math.round(red)},${Math.round(green)},${Math.round(blue)})`;
  }

  /**
   * Function to trigger when we hover on color preview item to show tooltip
   * @param {object} control - ng for item object
   * @return {void}
   */
  toggleHover(control): void {
    control.isHovered = !control.isHovered;
  }
}
