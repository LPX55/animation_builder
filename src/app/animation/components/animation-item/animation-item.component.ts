import { AnimationCoreService } from './../../services/animation-core.service';
import { DomSanitizer } from '@angular/platform-browser';
import { CepHostService } from './../../../core/services/cep-host/cep-host.service';
import { AnimationBuilderItem, AnimationBuilderItemType } from './../../../shared/helpers/animationBuilder-item';
import { Component, OnInit, Input, HostListener, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'mf-animation-item',
  templateUrl: './animation-item.component.html',
  styleUrls: ['./animation-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnimationItemComponent implements OnInit {
  // Do not edit this object because its reference to the object,
  // any change you make to this object reflected in the parent Component objec
  @Input() item: AnimationBuilderItem;
  @Input() filter: number;
  public direction;
  public showDropDown = false;
  // dropDownContent = [
  //   {
  //     id: AnimationBuilderItemType.types.In,
  //     thumbnail: '',
  //     title: 'In'
  //   },
  //   {
  //     id: AnimationBuilderItemType.types.Out,
  //     thumbnail: '',
  //     title: 'Out'
  //   },
  //   {
  //     id: AnimationBuilderItemType.types.Both,
  //     thumbnail: '',
  //     title: 'In & Out'
  //   }

  // ];
  get dropDownContent(): any[] {
    return this.directions.map(direction => {
      return {
        id: direction.directionKey,
        thumbnail: '',
        title: direction.directionName,
      };
    });
  }
  @HostListener('cdkDragStarted', ["$event"])
  handleDragStart($event): void {
    console.log($event)
    this._animationCoreService.dropAreaOptions = { activeType: this.currentType, allTypes: this.item.types };
    this._animationCoreService.showDropArea.next(true);
  }
  @HostListener('cdkDragEnded', [])
  handleDragEnd(): void {
    setTimeout(() => {
      this._animationCoreService.showDropArea.next(false);
      this._animationCoreService.dropAreaOptions = { activeType: {}, allTypes: [] };
    }, 150);
  }
  constructor(private _cepHostService: CepHostService, private _domSanitizer: DomSanitizer,
    private _animationCoreService: AnimationCoreService) {
  }
  get previewImage(): any {
    return this.currentType ? this.currentType.previewPath : '';
  }
  get currentType(): AnimationBuilderItemType {
    return this.item.types.find(t => t.type === this.filter &&
      t.direction === this.activeDirection.directionKey);
  }
  ngOnInit(): void {
  }
  get directions(): any[] {
    return this.item.types.filter(t => t.type === this.filter)
      .map(innerTypes => {
        return {
          directionName: AnimationBuilderItemType.directions[innerTypes.direction],
          directionKey: innerTypes.direction
        };
      });
  }
  get activeDirection(): any {

    return this.direction ? this.direction : this.directions[0] ?
      { directionName: this.directions[0].directionName, directionKey: this.directions[0].directionKey } :
      { directionName: '', directionKey: -1 };
  }

  toggleDropDown(e): void {
    event.stopPropagation();
    this.showDropDown = !this.showDropDown;
  }
  onClosedDropDown(): void {
    this.showDropDown = false;

  }
  onClickOnItem($event): void {
    const menuId = $event.menuId;
    this.direction = { directionName: AnimationBuilderItemType.directions[menuId], directionKey: menuId };
    this.showDropDown = false;
  }
  ondblclick(): void {
    if (this._animationCoreService.animationTypeFilter !== AnimationBuilderItemType.types.Both) {
      console.log([this.currentType.presetPath], this._animationCoreService.animationTypeFilter)
      this._animationCoreService.applyPreset([this.currentType.presetPath], this._animationCoreService.animationTypeFilter);
    } else {
      this._animationCoreService.applyPreset(this.item.types.filter(t =>
        (t.type === AnimationBuilderItemType.types.In || t.type === AnimationBuilderItemType.types.Out)
      && t.direction === this.currentType.direction ).map(t => t.presetPath), this._animationCoreService.animationTypeFilter );
    }
  }

}
