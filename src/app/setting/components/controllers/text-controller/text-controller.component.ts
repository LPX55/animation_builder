import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { SettingControllerService } from '../../../services/setting-controller.service';

@Component({
  selector: 'mf-text-controller',
  templateUrl: './text-controller.component.html',
  styleUrls: ['./text-controller.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextControllerComponent implements OnInit {
  @Input() value: string;
  @Input() name: string;
  @Input() index: number;
  @Input() padding: number;
  @Input() hasKey = false;
  @Input() key = false;
  @Output() valueChange = new EventEmitter<any>();
  innerValue: string;
  constructor(private _settingControllerService: SettingControllerService) { }

  ngOnInit(): void {
    this.innerValue = this.value;
  }
  handleInput(): void {
    this.valueChange.emit({ index: this.index, value: this.innerValue, key: this.key });
  }

  handleClockValueChange(value: boolean): void {
    this.key = value;
    if (true === value) {
      this.valueChange.emit({ index: this.index, value: this.innerValue, key: this.key });
    } else {
      this._settingControllerService.removeAllKeys(this.index);
    }
  }
}
