import { Component, OnInit, Input, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { SettingControllerService } from '../../../services/setting-controller.service';

@Component({
  selector: 'mf-clock-controller',
  templateUrl: './clock-controller.component.html',
  styleUrls: ['./clock-controller.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClockControllerComponent implements OnInit {
  // clock is on or off
  @Input() clockStatus: boolean;
  @Output() valueChange = new EventEmitter<boolean>();

  constructor(private _settingControllerService: SettingControllerService) { }

  ngOnInit(): void {
  }

  /**
   * Function to run when click icon has been clicked , just toggle the clockStatus property to change the appearance.
   * @return {void}
   */
  toggleClick(): void {
    this.valueChange.emit(!this.clockStatus);
  }

}
