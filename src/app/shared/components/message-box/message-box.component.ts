import { Component, OnInit, Input, Output, ElementRef, OnDestroy, EventEmitter } from '@angular/core';

@Component({
  selector: 'mf-message-box',
  templateUrl: './message-box.component.html',
  styleUrls: ['./message-box.component.scss']
})
export class MessageBoxComponent implements OnInit, OnDestroy {
  @Input() messageText: string;
  @Input() messageType: string;
  @Input() messageTitle: string;
  @Input() isForce: boolean;
  @Input() buttons = [];
  @Output() messageBoxClosed: EventEmitter<any> = new EventEmitter();
  @Input() set isShowing(value: boolean) {
    if (value) {
      this.showMessageBox();
    } else {
      this.hideMessageBox();
    }
  }

  constructor() { }

  get buttonList(): object {
    return this.buttons;
  }

  /**
   * run a function which set as button click callback function
   * @return {void}
  */
  runCallback(buttonObject): void {
    if (typeof (buttonObject.callBackFunction) === 'function') {
      buttonObject.callBackFunction();
    }
    this.hideMessageBox();
  }


  /**
   * Close MessageBox when user click on modal or buttons ( isForce is for when clicking on modal will not close the messagebox )
   * @return {void}
  */
  closeMessageBox(): void {
    if (!this.isForce) {
      this.hideMessageBox();
    }
  }

  /**
   * Show messagebox , it will first remove animationend event and then it will call showMessageBox modal function
   * @return {void}
  */
  showMessageBox(): void {
    const modal = document.getElementById('mf-messagebox-modal');
    modal.removeEventListener('animationend', this.hideMessageBoxMessage);
    this.showMessageBoxModal();
  }


  /**
   * Start the modal animation ( animation is defined in css file ) and when it's end it will call showMessageBoxMessage function
   * @return {void}
  */
  showMessageBoxModal(): void {
    const modal = document.getElementById('mf-messagebox-modal');
    modal.style.animation = 'showMessageBoxModal 0.1s 1 forwards';
    modal.addEventListener('animationend', this.showMessageBoxMessage);
  }

  /**
   * Start the messagebox animation ( animation is defined in css file )
   * @return {void}
  */
  showMessageBoxMessage(): void {
    const container = document.getElementById('mf-messagebox-container');
    container.style.animation = 'showMessageBoxMessage 0.4s 1 forwards';
  }

  /**
   * function to start the hide animation of messagebox which call hideMessageBoxModal
   * @return {void}
  */
  hideMessageBox(): void {
    this.hideMessageBoxModal();
  }


  /**
   * function to start the hide animation of messagebox modal which call hideMessageBoxMessage
   * @return {void}
  */
  hideMessageBoxModal(): void {
    const modal = document.getElementById('mf-messagebox-modal');
    /* check if animation is not set yet we do not run the hide animation cause it's first time run */
    if (modal.style.animation !== '') {
      modal.style.animation = 'hideMessageBoxModal 0.3s 1 forwards';
      modal.addEventListener('animationend', this.hideMessageBoxMessage.bind(this));
    }
  }


  /**
   * function to start the hide animation of messagebox message
   * @return {void}
  */
  hideMessageBoxMessage(): void {
    const container = document.getElementById('mf-messagebox-container');
    container.style.animation = 'hideMessageBoxMessage 0.4s 1 forwards';
    this.messageBoxClosed.emit({});
  }

  ngOnInit(): void { }
  ngOnDestroy(): void { }
}
