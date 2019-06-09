import { SlideDownAnimation, SlideUpAnimation } from './../../helpers/animations';
import { Component, OnInit, Output, EventEmitter, Input, ElementRef, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'mf-drop-down',
  templateUrl: './drop-down.component.html',
  styleUrls: ['./drop-down.component.scss'],
  animations: [SlideDownAnimation, SlideUpAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropDownComponent implements OnInit {
  // if we want to close the drop down
  public displayDropdownParentDiv = true;
  // animation states go here
  public animationHandler: string;
  // menus of drop down
  @Input() menus: any;
  // max height of drop down
  @Input() maxHeight: any;
  // animation of drop down( up - down )
  @Input() animation: string;
  // drop down position y
  @Input() dropDownPositionY: number;
  // it fires on closing drop down
  @Output() doOnClose: EventEmitter<any> = new EventEmitter();
  // it fires on clicking on drop down
  @Output() doOnClick: EventEmitter<any> = new EventEmitter();
  // reference of main menu element
  @ViewChild('mainMenu') mainMenu: ElementRef;
  // variable that runs sub menu animation
  public showSubMenu = false;
  // variable that holds the height of main menu
  public mainMenuHeight: number;

  constructor(private _changeDetectorRef: ChangeDetectorRef) {

  }

  ngOnInit(): void {
    this.animationHandler = this.animation;
    document.addEventListener('click', this.offClickHandler.bind(this));
  }

  /**
   * it close drop down on call
   * @return {void}
   */
  closeDropDown(): void {
    if (this.displayDropdownParentDiv) {
      this.animationHandler = 'none';
      this.displayDropdownParentDiv = false;
      this._changeDetectorRef.detectChanges();
    }

  }

  /**
   * it is called on animation done
   * @param {string} animation - here we get the animation that it is up or down for comparing
   * @return {void}
   */
  destroyDropDown(animation): void {
    if (!this.displayDropdownParentDiv && animation === this.animation) {
      this.doOnClose.emit();
    }
  }

  /**
   * function is called on click on document
   * @return {void}
   */
  offClickHandler(event: any): void {
    if (!event.path.includes(document.getElementsByTagName('mf-drop-down')[0])) {
      this.closeDropDown();
    }
  }

  /**
   * Fired on clicked on a menu
   * @fire DropDownComponent#doOnClick
   * @param {number} id - this is id of that item in menu returned
   * @param {number} hasSubMenu - when drop down has sub menu will set to true
   * @return {void}
   */
  clickedOnMenu(id, hasSubMenu): void {
    if (!hasSubMenu) {
      this.closeDropDown();
      this.doOnClick.emit({ menuId: id });
    } else {
      this.mainMenuHeight = this.mainMenu.nativeElement.clientHeight;
      let subMenuHeight = this.mainMenu.nativeElement.querySelector('.submenu').clientHeight;
      /*
      * 177 is menu item height(44) * 4 + 1px border
      * 265 is menu item height(44) * 6 + 1px border
      * 133 is menu item height(44) * 3 + 1px border
      */
      const availableSpace = window.innerHeight - this.dropDownPositionY;
      if (availableSpace < 270) {
        subMenuHeight = subMenuHeight > 177 ? 177 : subMenuHeight;
        if (availableSpace < 170) {
          subMenuHeight = subMenuHeight > 133 ? 133 : subMenuHeight;
        }
      } else {
        subMenuHeight = subMenuHeight > 265 ? 265 : subMenuHeight;
      }
      this.mainMenu.nativeElement.style.height = subMenuHeight + 'px';
      this.showSubMenu = true;
      this.mainMenu.nativeElement.addEventListener('transitionstart', this.hiddenOverflow(this), false);
      /*
      * setTimeout is for when drop down transition done then overflow should be auto
      * 350 is time of height transition
      */
      setTimeout(() => {
        this.mainMenu.nativeElement.addEventListener('transitionsend', this.showOverflow(this), false);
      }, 350);
    }
  }

  /**
   * Fires when clicked on sub menu
   * @param {number} menuID - ID of main menu
   * @param {string} subMenuID - ID of sub menu which is pack ID
   * @return {void}
   */
  clickedOnSubMenu(menuID: number, subMenuID: string): void {
    this.closeDropDown();
    this.doOnClick.emit({ menuId: menuID, subMenuID });
  }

  /**
   * Fires when clicked on back menu in sub menu
   * @param {MouseEvent} $event - mouse event
   * @return {void}
   */
  backToMainMenu($event: MouseEvent): void {
    $event.stopPropagation();
    this.mainMenu.nativeElement.style.height = this.mainMenuHeight + 'px';
    this.showSubMenu = false;
    this.mainMenu.nativeElement.addEventListener('transitionstart', this.hiddenOverflow(this), false);
    /*
     * setTimeout is for when drop down transition done then overflow should be auto
     * 350 is time of height transition
     */
    setTimeout(() => {
      this.mainMenu.nativeElement.addEventListener('transitionend', this.showOverflow(this), false);
    }, 350);

  }
  /**
   * hidden scroll when drop down height is change it use when transition start
   * @return {void}
   */
  hiddenOverflow($this): void {
    $this.mainMenu.nativeElement.style.overflowY = 'hidden';
  }
  /**
 * show scroll when drop down height is change it use when transition end
 * @return {void}
 */
  showOverflow($this): void {
    $this.mainMenu.nativeElement.style.overflowY = 'auto';
  }
}
