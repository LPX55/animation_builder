import { JsxInjectorService } from '../../../core/services/jsx-injector/jsx-injector.service';
import { generateAPI } from '../../../shared/helpers/helper-functions';
import { Subscription } from 'rxjs';
import { ScrollStoreProvider } from '../../../shared/helper/reuse-strategy/scroll-reuse';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import {
  LeftToRightSlideIn,
  RightToLeftSlideOut,
  slideDownList,
  slideUpLlist
} from '../../../shared/helpers/animations';
import { MarketDataService } from '../../services/market-data.service';
import { ResponsiveService } from '../../../core/services/responsive/responsive.service';
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  AfterViewChecked,
  HostListener
} from '@angular/core';

@Component({
  selector: 'mf-market-list',
  templateUrl: './market-list.component.html',
  styleUrls: ['./market-list.component.scss'],
  animations: [
    LeftToRightSlideIn,
    RightToLeftSlideOut,
    slideDownList,
    slideUpLlist
  ]
})
export class MarketListComponent
  implements OnInit, AfterViewInit, AfterViewChecked {
  /**
   * variable for check in detail page  its use in @function openDetails , changeToMarketPack
   * @public
   */
  public checkDetailPage = '';
  /**
   * current category filter
   * @public
   */
  public currentCategory = 'new';

  /**
   * variable for scroll store provider its use in @function changeCategoryByRoute
   * @private
   */
  private _scrollStoreProvider: ScrollStoreProvider;

  /**
   * subscription to router events
   * @public
   */
  public routerEventSubscription: Subscription;

  /**
   * market pack list view child
   * @public
   */
  @ViewChild('marketPackList') marketPackList: ElementRef;
  /**
   * sufflejs instance
   * @public
   */
  public shuffle: any;
  /**
   * is data recieved from db or online?
   * @public
   */
  public gotData = false;
  /**
   * if market filter runed for first time
   * @public
   */
  packFiltered = false;
  /**
   * time out for removing shuffle transition goes here
   * @public
   */
  shuffleTimeout: any;

  /**
   * boolean for adding disable-shuffle CSS class
   * @public
   */
  disableShuffle = false;

  /**
   * boolean for close banner in market
   * @public
   */
  public closeBanner = false;

  constructor(
    private _marketDataService: MarketDataService,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _responsiveService: ResponsiveService,
    private _jsxInjectorService: JsxInjectorService
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize($event: any): void {
    this.disableShuffle = true;

    if (this.shuffleTimeout) {
      clearTimeout(this.shuffleTimeout);
      this.shuffleTimeout = undefined;
    }
    this.shuffleTimeout = setTimeout(() => {
      this.disableShuffle = false;
    }, 500);
  }

  get marketItemMargin(): number {
    let itemMargin = this._responsiveService.marketItemMargin.getValue();
    itemMargin = itemMargin > 3 ? itemMargin : 3;
    return itemMargin;
  }

  get marketItemWidth(): number {
    return this._responsiveService.marketItemWidth.getValue();
  }

  /**
   * get market pack from json.
   * @since 0.0.1
   * @public
   * @return {Array} - array of all object in market json
   */
  get packs(): Array<{}> {
    return this._marketDataService.packs;
  }

  get animationMode(): string {
    return this._marketDataService.animationMode;
  }

  set animationMode(value: string) {
    this._marketDataService.animationMode = value;
  }

  /**
   * get market pack details from json.
   * @since 0.0.1
   * @public
   * @return {Array} - array of details object in market json
   */
  get marketObject(): Array<{}> {
    return this._marketDataService.marketObject[0];
  }

  ngOnInit(): void {
    document.body.style.backgroundColor = '#262626';

    this._marketDataService.getData().then(() => {
      this.gotData = true;
    });
    this._scrollStoreProvider = new ScrollStoreProvider({
      compContext: this,
      router: this._router,
      route: '/market'
    });
    this._responsiveService.marketListItemsResponsive();
  }

  get carouselItems(): any {
    return this._marketDataService.tags;
  }

  ngAfterViewInit(): void {
    this._scrollStoreProvider.handleScroll(
      'MarketList',
      '.market-category-container'
    );
  }

  get currentMarketPage(): string {
    return this._marketDataService.currentMarketPage;
  }

  ngAfterViewChecked(): void {
    if (this.shuffle) {
      this.shuffle.update();
    }
  }
  /**
   * show error when can't connect to json.
   * @since 0.0.1
   * @public
   * @return {boolean} - return true/false of connect to json.
   */
  get showError(): boolean {
    return this._marketDataService.showError;
  }

  /**
   * Resend request to connect to json
   * @since 0.0.1
   * @public
   * @return {void}
   */
  refreshPage(): void {
    this.shuffle = false;
    this.gotData = false;
    this.packFiltered = false;
    this._marketDataService.getData().then(() => {
      this.gotData = true;
    });
  }

  /**
   * switch from detail to market.
   * @since 0.0.1
   * @param {string} id - id of market pack
   * @public
   */
  changeToMarketPack(): void {
    if (this.animationMode === 'RightToLeftSlideOut') {
      this._marketDataService.currentMarketPage = 'detail';
      this.animationMode = '';
      this.checkDetailPage = '';
    }
  }
  /**
   * when user clicked on a tag of carousel
   * @return void
   */
  onTagClicked($event): void {
    const caption = $event.caption;
    if (this._marketDataService.activedTags.includes(caption)) {
      this._marketDataService.activedTags = this._marketDataService.activedTags.filter(
        tag => {
          return tag !== caption;
        }
      );
    } else {
      this._marketDataService.activedTags.push(caption);
    }
    this.carouselItems.map(item => {
      if (item.caption === caption) {
        item.active = !item.active;
      }
      return item;
    });
    this.filterShuffle();
  }

  /**
   * filter items on selected tags
   * @return void
   */
  filterShuffle(): void {
    if (this.shuffle) {
      this.shuffle.filter(this._marketDataService.activedTags);
    }
  }

  /**
   * get slide mode animation.
   * @since 0.0.1
   * @public
   * @return {string} - string of type of animation slide-up or slide-down
   */
  get slideMode(): string {
    return this._marketDataService.sideUpDownAnimation;
  }

  /**
   * set slide mode animation.
   * @since 0.0.1
   * @public
   * @return {void}
   */
  set slideMode(value: string) {
    this._marketDataService.sideUpDownAnimation = value;
  }

  /**
   * when we want to go to a pack detail
   * @since 0.0.1
   * @public
   * @return {void}
   */
  goToPack(id, details): void {
    this._marketDataService.currentMarketDetail = details;
    this.animationMode = 'RightToLeftSlideOut';
    this.shuffle.disable();
  }

  /**
   * we user is going back from pack detail
   * @since 0.0.1
   * @public
   * @return {void}
   */
  onPackGoBack(): void {
    this.animationMode = 'LeftToRightSlideIn';
    setTimeout(() => {
      this.shuffle.enable();
    });
  }

  /**
   * filter by category
   * @since 0.0.1
   * @public
   * @return {void}
   */
  filterPacks(): void {
    if (this.packFiltered) {
      this._marketDataService.getDataByCategory(
        this._marketDataService.filterToRoute
      );
      this.slideMode = 'slideUpList';
      this.currentCategory = this._marketDataService.filterToRoute;
      if (this.shuffle) {
        this.shuffle.destroy();
      }
      this.initiateShuffle();
      this.carouselItems.map(item => {
        item.active = false;
      });
      Array.from(document.querySelectorAll('.placeholder')).map(element => {
        this.shuffle.remove([element]);
      });
      Array.from(document.querySelectorAll('mf-market-pack')).map(
        (element: HTMLElement) => {
          element.style.width = '49%';
        }
      );
      this._marketDataService.activedTags = [];
    }
    this.packFiltered = true;
  }
  /**
   * starts shuffle js
   * @since 0.0.1
   * @public
   * @return {void}
   */
  initiateShuffle(): void {
    const Shuffle = window['Shuffle'];
    this.shuffle = new Shuffle(document.querySelector('.market-pack-list'), {
      itemSelector: 'mf-market-pack',
      filterMode: Shuffle.FilterMode.ALL,
      throttleTime: 0,
      staggerAmount: 0
    });
  }
  /**
   * link text banner to https://creator.pixflow.net/
   * @return {void}
   */
  openBannerLink(): void {
    this._jsxInjectorService.openUrlInBrowser('https://creator.pixflow.net/');
  }
}
