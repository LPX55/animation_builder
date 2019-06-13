import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'mf-no-internet',
  templateUrl: './no-internet.component.html',
  styleUrls: ['./no-internet.component.scss']
})
export class NoInternetComponent implements OnInit {

  @Output() clicked: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {

  }
  retryRequest(): void {
    this.clicked.emit();
  }

}
