import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { SettingControllerService } from '../../../services/setting-controller.service';

@Component({
  selector: 'mf-multiline-text-controller',
  templateUrl: './multiline-text-controller.component.html',
  styleUrls: ['./multiline-text-controller.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultilineTextControllerComponent implements OnInit {
  @Input() value: string;
  @Input() name: string;
  @Input() index: number;
  @Input() padding: number;
  @Input() hasKey = false;
  @Input() key = false;
  @Output() valueChange = new EventEmitter<any>();

  constructor(private _settingControllerService: SettingControllerService) { }

  ngOnInit(): void {
  }
  handleInput(): void {
    this.valueChange.emit({ index: this.index, value: this.value.replace(/(\r\n)+|\r+|\n+|\\r+|\\n+/g, '\r'), key: this.key });
  }
  handleClockValueChange(value: boolean): void {
    this.key = value;
    if (true === value) {
      this.valueChange.emit({ index: this.index, value: this.value.replace(/(\r\n)+|\r+|\n+|\\r+|\\n+/g, '\r'), key: this.key });
    } else {
      this._settingControllerService.removeAllKeys(this.index);
    }
  }

}
