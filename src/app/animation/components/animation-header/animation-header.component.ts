import { Component, OnInit } from '@angular/core';
import { JsxInjectorService } from '../../../core/services/jsx-injector/jsx-injector.service';


@Component({
  selector: 'mf-animation-header',
  templateUrl: './animation-header.component.html',
  styleUrls: ['./animation-header.component.scss']
})
export class AnimationHeaderComponent implements OnInit {

  constructor(private _jsxInjectorService: JsxInjectorService) { }

  ngOnInit(): void {}

  /**
   * Redirect users to buy now page for animation builder
   * @return {void}
  */
  buyNowClick(): void {
      this._jsxInjectorService.openUrlInBrowser('https://pixflow.net');
  }

  /**
   * Redirect users to get it now page for animation builder
   * @return {void}
  */
  getItNowClick(): void {
    this._jsxInjectorService.openUrlInBrowser('https://pixflow.net');
  }

}
