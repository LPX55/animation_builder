import { Component, OnInit, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { SettingControllerService } from '../../../services/setting-controller.service';

@Component({
  selector: 'mf-checkbox-controller',
  templateUrl: './checkbox-controller.component.html',
  styleUrls: ['./checkbox-controller.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckboxControllerComponent implements OnInit {
  @Input() value: boolean;
  @Input() name: string;
  @Input() index: number;
  @Input() padding: string;
  @Input() hasKey = false;
  @Input() key = false;
  @Output() valueChange = new EventEmitter<any>();
  constructor(private _settingControllerService: SettingControllerService) { }

  ngOnInit(): void {
  }
  handleClick(): void {
    this.value = !this.value;
    this.valueChange.emit({ index: this.index, value: this.value, key: this.key });
  }
  handleClockValueChange(value: boolean): void {
    this.key = value;
    if (true === value) {
      this.valueChange.emit({ index: this.index, value: this.value, key: this.key });
    } else {
      this._settingControllerService.removeAllKeys(this.index);
    }
  }

}
