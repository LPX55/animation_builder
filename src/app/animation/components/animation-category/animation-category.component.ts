import { AnimationBuilderItemType } from './../../../shared/helpers/animationBuilder-item';
import { AnimationBuilderCategory } from './../../../shared/helpers/animationBuilder-category';
import { AnimationCoreService } from './../../services/animation-core.service';
import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'mf-animation-category',
  templateUrl: './animation-category.component.html',
  styleUrls: ['./animation-category.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnimationCategoryComponent implements OnInit {
  @Input() categoryPath: string;
  @Input() categoryName: string;
  categoryItems = [];
  activeCategoryId;
  constructor(private _animationCoreService: AnimationCoreService) { }

  ngOnInit(): void {
    this.categoryItems = this._animationCoreService.getAllCategories(this.categoryPath);
    this.activeCategoryId = this.categoryItems[0].id;
    console.log(this.categoryItems);
  }
  handleCategoryClick(category: AnimationBuilderCategory): void {
    category.opened = !category.opened;
    if (this.activeCategoryId !== category.id) {
      this.activeCategoryId = category.id;
      this._animationCoreService.showCategory.next(category);
    }
  }

}
