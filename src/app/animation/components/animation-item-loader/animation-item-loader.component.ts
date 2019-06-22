import { Router } from '@angular/router';
import { AnimationBuilderCategory } from './../../../shared/helpers/animationBuilder-category';
import { AnimationBuilderItem, AnimationBuilderItemType } from './../../../shared/helpers/animationBuilder-item';
import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { AnimationCoreService } from './../../services/animation-core.service';
import { Subscription } from 'rxjs';
import { ScrollStoreProvider } from "../../../shared/helper/reuse-strategy/scroll-reuse";

@Component({
  selector: 'mf-animation-item-loader',
  templateUrl: './animation-item-loader.component.html',
  styleUrls: ['./animation-item-loader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnimationItemLoaderComponent implements OnInit,AfterViewInit {
  @Input() filter = 0;
  showDropDown = true;
  private _scrollStoreProvider: ScrollStoreProvider;
  private _items = [];
  private itemsSubscibe: Subscription;
  oldFilter = -1;
  get items(): AnimationBuilderItem[] {
    return this._items.filter(item => this.itemHasType(item, this.filter));
  }
  indexTrackFn = (index: number, item: AnimationBuilderItem) => item.id;
  constructor(private _animationCoreService: AnimationCoreService, private _changeDetectorRef: ChangeDetectorRef, private _router: Router) {
    this.itemsSubscibe = this._animationCoreService.showCategory.subscribe((category: AnimationBuilderCategory) => {
      if(!category) return;
      this._items = this._animationCoreService.getCategoryItems(category.categoryPath, category.type);
      console.log('items', this._items);
      if (category.title === 'Text Effects') {
        this.oldFilter = this._animationCoreService.animationTypeFilter;
        this._animationCoreService.animationTypeFilter = AnimationBuilderItemType.types.Effect;
      } else if (this.oldFilter !== -1 && this.oldFilter !== this._animationCoreService.animationTypeFilter) {
        this._animationCoreService.animationTypeFilter = this.oldFilter;
      }
      _changeDetectorRef.markForCheck();
    });
    this._scrollStoreProvider = new ScrollStoreProvider({
      compContext: this,
      router: this._router,
      route: "/dashboard/animation"
    });
  }
  itemHasType(item: AnimationBuilderItem, type: number): boolean {
    return item.types.some(t => t.type === this.filter);
  }
  ngOnInit(): void { }
  ngAfterViewInit(): void {
    // if (this._userManagerService.isLoggedin) {
    // this._scrollStoreProvider.handleScroll(
    //   "MainProject",
    //   this.itemsHolder.nativeElement
    // );
    // }
    // this._userManagerService.loginSubject.subscribe(isLoggedIn => {
    //   if (isLoggedIn && !this._userManagerService.isLoggedin) {
    setTimeout(() => {
      this._scrollStoreProvider.handleScroll("MainProject", ".animation-item-loader-wrap");
    });
    // }
    // });
  }
}
