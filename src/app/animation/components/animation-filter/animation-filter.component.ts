import { AnimationCoreService } from './../../services/animation-core.service';
import { AnimationBuilderItemType } from './../../../shared/helpers/animationBuilder-item';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'mf-animation-filter',
  templateUrl: './animation-filter.component.html',
  styleUrls: ['./animation-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnimationFilterComponent implements OnInit {
  dropDownContent = [
    {
      id: AnimationBuilderItemType.types.In,
      thumbnail: '',
      title: 'In'
    },
    {
      id: AnimationBuilderItemType.types.Out,
      thumbnail: '',
      title: 'Out'
    },
    {
      id: AnimationBuilderItemType.types.Both,
      thumbnail: '',
      title: 'In & Out'
    }

  ];
  showDropDown = false;

  constructor(private _animationCoreService: AnimationCoreService) { }
  /**
* closed sign out drop down
* @return {void}
*/
  onClosedDropDown(): void {
    this.showDropDown = false;

  }
  onClickOnItem($event): void {
    const menuId = $event.menuId;
    this._animationCoreService.animationTypeFilter = menuId;
  }
  toggleShowDropDown($event): void {
    $event.stopPropagation();
    this.showDropDown = !this.showDropDown;
  }
  get activeMenu(): any {
    return this.dropDownContent.find(item => item.id === this._animationCoreService.animationTypeFilter);
  }
  ngOnInit(): void {
  }

}
