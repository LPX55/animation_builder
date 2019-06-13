import { Component, OnInit } from '@angular/core';
import { ResponsiveService } from '../../../core/services/responsive/responsive.service';

@Component({
  selector: 'mf-resize',
  templateUrl: './resize.component.html',
  styleUrls: ['./resize.component.scss']
})
export class ResizeComponent implements OnInit {
  /**
  * current value of zoom
  * @public
  */
  currentValue = this._responsiveService.templateItemZoom.getValue();

  constructor(private _responsiveService: ResponsiveService) { }

  ngOnInit(): void {
  }

  /**
  *  This function detects zoom changes and calls changeZoom method in responsive service
  * @since 0.0.1
  * @public
  * @param {any} value - value of resize slider, can be string or number
  * @return {void}
  */
  changeSliderValue(value: any): void {
    this._responsiveService.changeZoom(parseFloat(value));
    this.currentValue = this._responsiveService.templateItemZoom.getValue();
  }
}
