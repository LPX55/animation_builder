import { AnimationBuilderItemType } from './../../../shared/helpers/animationBuilder-item';
import { AnimationCoreService } from './../../services/animation-core.service';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'mf-drop-area',
  templateUrl: './drop-area.component.html',
  styleUrls: ['./drop-area.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropAreaComponent implements OnInit {

  constructor(private _animationCoreService: AnimationCoreService) { }

  ngOnInit(): void {
  }
  mouseEnter(): void {
    const preview = document.querySelector('.cdk-drag-preview');
    if (preview) {
      if (preview.classList.contains('small')) { return; }
      preview.classList.add('small');
    }
  }
  mouseLeave(): void {
    const preview = document.querySelector('.cdk-drag-preview');
    if (preview) { preview.classList.remove('small'); }
  }
  get allTypes(): AnimationBuilderItemType[] {
    return this._animationCoreService.dropAreaOptions.allTypes;
  }
  show(type: number): boolean {
    return this.allTypes.some(t => t.type === type);
  }
  get showBoth(): boolean {
    return this.show(AnimationBuilderItemType.types.In) && this.show(AnimationBuilderItemType.types.Out);
  }
  handleMouseUp(type: number): void {
    if (type !== AnimationBuilderItemType.types.Both) {
      const ItemType = this.allTypes.find((t) => (t.type === type &&
        t.direction === this._animationCoreService.dropAreaOptions.activeType.direction));
      console.log([ItemType.presetPath], type);
      this._animationCoreService.applyPreset([ItemType.presetPath], type);
    } else {
      const ItemType = this.allTypes.filter((t) => ((t.type === AnimationBuilderItemType.types.In
        || t.type === AnimationBuilderItemType.types.Out) &&
        t.direction === this._animationCoreService.dropAreaOptions.activeType.direction));
      this._animationCoreService.applyPreset(ItemType.map(t => t.presetPath), type);
    }
  }
}
