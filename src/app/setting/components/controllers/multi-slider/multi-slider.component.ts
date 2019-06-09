import { SliderControllerComponent } from './../slider-controller/slider-controller.component';
import { Component, OnInit, EventEmitter, Input, Output, ViewChild, QueryList, ElementRef, ViewChildren,
   ChangeDetectionStrategy } from '@angular/core';
import * as cloneDeep from 'lodash/cloneDeep';
import { SettingControllerService } from '../../../services/setting-controller.service';

@Component({
  selector: 'mf-multi-slider',
  templateUrl: './multi-slider.component.html',
  styleUrls: ['./multi-slider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultiSliderComponent implements OnInit {
  @Input() name: string;
  @Input() innerNames: string[];
  @Input() index: number;
  @Input() padding: number;
  @Input() values: number[];
  @Input() hasKey = false;
  @Input() key = false;
  @Output() valueChange = new EventEmitter<any>();
  /**
    *for all slider component that create in multi slider
    * @public
    */
  @ViewChildren('sliderContent') sliderContents: QueryList<ElementRef>;
  innerValues = [];
  constructor(private _settingControllerService: SettingControllerService) {

  }
  ngOnInit(): void {
    this.innerValues = cloneDeep(this.values);
  }
  handleChange(e: any, innerValueIndex: number): void {
    this.innerValues[innerValueIndex] = e.value;
    this.valueChange.emit({ index: this.index, value: this.innerValues, key: this.key });
  }
  addBorderInSelect(i): void {
    const id = i;
    this.sliderContents.map((child: ElementRef, index) => {
      if (index === id) {
        child.nativeElement.style.border = '1px solid #2D60EB';
      }

    });

  }
  removeBorderInSelect(i): void {
    const id = i;
    this.sliderContents.map((child: ElementRef, index) => {
      if (index === id) {
        child.nativeElement.style.border = '1px solid #393939';
      }

    });
  }
  handleClockValueChange(value: boolean): void {
    this.key = value;
    if (true === value) {
      this.valueChange.emit({ index: this.index, value: this.innerValues, key: this.key });
    } else {
      this._settingControllerService.removeAllKeys(this.index);
    }
  }
}
