import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface ResponsiveParams {
  windowWidth: number;
  columnNumber: number;
  parentPadding: number;
  borderWidth?: number;
}

@Injectable()
export class ResponsiveService {
  // window width which changes with resize
  public windowWidth = new BehaviorSubject(window.innerWidth);

  /* template fields */
  // default template item width
  private _templateDefaultWidth = 170;
  // default template item height
  private _templateDefaultHeight = 140;
  // default template item preview height
  private _templateDefaultItemPreviewHeight = 95;
  // minimum zoom
  private _minZoom = 1;
  // maximum zoom
  private _maxZoom = 2;
  // dynamic template item width
  public templateItemWidth = new BehaviorSubject(this._templateDefaultWidth);
  // dynamic template item height
  public templateItemHeight = new BehaviorSubject(this._templateDefaultHeight);
  // dynamic template item preview height
  public templateItemPreviewHeight = new BehaviorSubject(this._templateDefaultItemPreviewHeight);
  // dynamic template item margin
  public templateItemMargin = new BehaviorSubject(3);
  // dynamic template item zoom
  public templateItemZoom = new BehaviorSubject(1);

  /* market fields */
  // dynamic market item width
  public marketItemWidth = new BehaviorSubject(260);
  // dynamic market item margin
  public marketItemMargin = new BehaviorSubject(2);

  constructor() {}

  /**
   *  calculates the number of template list columns and calls calculateTemplateItemMargin with calculated params
   * @since 0.0.1
   * @public
   * @return {void}
   */
  templateListItemsResponsive(): void {
    this.windowWidth.subscribe(windowWidth => {
      const parentPadding = 8,
        borderWidth = 2,
        minMargin = 0,
        scrollWidth = 3,
        minItemSpace = (this.templateItemWidth.getValue() + borderWidth + minMargin);
      let columnNumber;
      if (windowWidth < minItemSpace * 2 + parentPadding + scrollWidth) {
        columnNumber = 1;
      } else if (windowWidth < minItemSpace * 3 + parentPadding + scrollWidth) {
        columnNumber = 2;
      } else if (windowWidth < minItemSpace * 4 + parentPadding + scrollWidth) {
        columnNumber = 3;
      } else if (windowWidth < minItemSpace * 5 + parentPadding + scrollWidth) {
        columnNumber = 4;
      } else if (windowWidth < minItemSpace * 6 + parentPadding + scrollWidth) {
        columnNumber = 5;
      } else {
        columnNumber = 6;
      }
      this.calculateTemplateItemMargin({ windowWidth, columnNumber, parentPadding, borderWidth });
    });
  }

  /**
   *  calculates the number of market list columns and calls calculateTemplateItemMargin with calculated params
   * @since 0.0.1
   * @public
   * @return {void}
   */
  marketListItemsResponsive(): void {
    this.windowWidth.subscribe(windowWidth => {
      const parentPadding = 2 * 5;
      let columnNumber;
      if (windowWidth <= 537) {
        columnNumber = 1;
      } else if (windowWidth <= 800) {
        columnNumber = 2;
      } else if (windowWidth <= 1063) {
        columnNumber = 3;
      } else if (windowWidth <= 1326) {
        columnNumber = 4;
      } else if (windowWidth <= 1589) {
        columnNumber = 5;
      } else {
        columnNumber = 6;
      }
      this.calculateMarketItemMargin({ windowWidth, columnNumber, parentPadding });
    });
  }

  /**
   *  calculates the margin of market list columns and assigns margin value to marketItemMargin
   * @since 0.0.1
   * @param {ResponsiveParams} parameters - an interface forming all required parameters
   * @public
   * @return {void}
   */
  calculateMarketItemMargin(parameters: ResponsiveParams): void {
    const totalColumnsWidth = parameters.columnNumber * this.marketItemWidth.getValue();
    const freeSpace = parameters.windowWidth - parameters.parentPadding - totalColumnsWidth;
    this.marketItemMargin.next(freeSpace / parameters.columnNumber / 2);
  }

  /**
   *  calculates the margin of template list columns and assigns margin value to templateItemMargin
   * @since 0.0.1
   * @param {ResponsiveParams} parameters - an interface forming all required parameters
   * @public
   * @return {void}
   */
  calculateTemplateItemMargin(parameters: ResponsiveParams): void {
    const totalColumnsWidth = parameters.columnNumber * this.templateItemWidth.getValue() +
      (parameters.columnNumber * parameters.borderWidth);
    const freeSpace = parameters.windowWidth - parameters.parentPadding - totalColumnsWidth;
    this.templateItemMargin.next(freeSpace / parameters.columnNumber / 2);
  }

  /**
   * changes templateItemZoom and calculates new dimensions based on zoom value
   * @since 0.0.1
   * @param {number} newValue - passed to this method from resize component
   * @public
   * @return {void}
   */
  changeZoom(newValue: number): void {
    let zoom;
    if (this._minZoom <= newValue && newValue <= this._maxZoom) {
      zoom = newValue;
    } else if (newValue < this._minZoom) {
      zoom = this._minZoom;
    } else if (newValue > this._maxZoom) {
      zoom = this._maxZoom;
    }
    this.templateItemWidth.next(this._templateDefaultWidth * zoom);
    this.templateItemHeight.next(this._templateDefaultHeight * zoom);
    this.templateItemPreviewHeight.next(this._templateDefaultItemPreviewHeight * zoom);
    this.templateItemZoom.next(zoom);
    this.templateListItemsResponsive();
  }

}
