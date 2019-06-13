import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class FileSelectorService {

  public selectedItemsIndex = [];
  public selectedItemsIndex$ = new BehaviorSubject(this.selectedItemsIndex);
  public selectedItemsDetail = [];
  public lastItemIndex = 0;

  constructor() { }

  /**
   * cleans selected items array and updates it with current selected item index
   * @param {Number} itemIndex - index of selected item
   * @return {void}
   */
  selectWithClick(itemIndex: number): void {
    this.clearAndUpdateSelectedItems();
    this.addAndUpdateSelectedItems(itemIndex);
    this.updateLastItemIndex(itemIndex);
  }

  /**
   * adds or removes the current selected item index in selected items array
   * @param {Number} itemIndex - index of selected item
   * @return {void}
   */
  selectWithCtrlClick(itemIndex: number): void {
    if (-1 < this.selectedItemsIndex.indexOf(itemIndex)) {
      this.selectedItemsIndex = this.selectedItemsIndex.filter(index => index !== itemIndex);
      this.selectedItemsIndex$.next(this.selectedItemsIndex);
    } else {
      this.addAndUpdateSelectedItems(itemIndex);
    }
    this.updateLastItemIndex(itemIndex);
  }

  /**
   * cleans selected items array and updates it with current selected items index
   * @param {Number} itemIndex - index of selected item
   * @return {void}
   */
  selectWithShiftClick(itemIndex: number): void {
    this.clearAndUpdateSelectedItems();
    if (itemIndex < this.lastItemIndex) {
      for (let index = itemIndex; index <= this.lastItemIndex; index++) {
        this.selectedItemsIndex.push(index);
      }
    } else if (this.lastItemIndex < itemIndex) {
      for (let index = this.lastItemIndex; index <= itemIndex; index++) {
        this.selectedItemsIndex.push(index);
      }
    } else {
      this.selectWithClick(itemIndex);
    }
    this.selectedItemsIndex$.next(this.selectedItemsIndex);
  }

  /**
   * if current selected item index is not in selected items array, runs @function selectWithClick
   * @param {Number} itemIndex - index of selected item
   * @return {void}
   */
  selectWithRightClick(itemIndex: number): void {
    if (-1 === this.selectedItemsIndex.indexOf(itemIndex)) {
      this.selectWithClick(itemIndex);
    }
  }

  /**
   * updates selected items array with current item index
   * @param {Number} itemIndex - index of selected item
   * @return {void}
   */
  addAndUpdateSelectedItems(itemIndex): void {
    this.selectedItemsIndex.push(itemIndex);
    this.selectedItemsIndex$.next(this.selectedItemsIndex);
  }

  /**
   * cleans and updates selected items array
   * @return {void}
   */
  clearAndUpdateSelectedItems(): void {
    this.selectedItemsIndex = [];
    this.selectedItemsDetail = [];
    this.selectedItemsIndex$.next(this.selectedItemsIndex);
  }

  /**
   * updates latest selected item index for shift click functionality
   * @param {Number} itemIndex - index of selected item
   * @return {void}
   */
  updateLastItemIndex(itemIndex): void {
    this.lastItemIndex = itemIndex;
  }

}
