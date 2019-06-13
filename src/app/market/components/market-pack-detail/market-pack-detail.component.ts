import { FileDropDownContent } from './../../../core/interfaces/file-dropdown/file-dropdown';
import { JsxInjectorService } from './../../../core/services/jsx-injector/jsx-injector.service';
import { leftToRightSlideOut, rightToLeftSlideIn } from './../../../shared/helpers/animations';
import { ScrollStoreProvider } from '../../../shared/helper/reuse-strategy/scroll-reuse';
import { Location } from '@angular/common';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { MarketDataService } from '../../services/market-data.service';
import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { LogManagerService } from '../../../core/services/log-manager/log-manager.service';

@Component({
  selector: 'mf-market-pack-detail',
  templateUrl: './market-pack-detail.component.html',
  styleUrls: ['./market-pack-detail.component.scss'],
  animations: [
    rightToLeftSlideIn, leftToRightSlideOut
  ]
})
export class MarketPackDetailComponent implements OnInit, AfterViewInit {

  /**
* variable for animation mode its use in @function backToMarketPacks
* @public
*/
  public animationMode = 'rightToLeftSlideIn';
  /**
* variable for movie state its use in @function playMovie
* @public
*/
  public movieStatus = 'pause';
  /**
* variable for scroll store provider its use in @function ngOnInit
* @public
*/
  private _scrollStoreProvider: ScrollStoreProvider;

  @Output() goBack: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('marketPackDetail') marketPackDetail: ElementRef;
  constructor(private _marketDataService: MarketDataService, private _activatedRoute: ActivatedRoute, private _location: Location,
    private _router: Router, private _jsxInjectorService: JsxInjectorService, private _logManagerService: LogManagerService) {

  }

  /**
* get market pack from json.
* @since 0.0.1
* @public
* @return {Array} - array of all object in market json
*/
  get packs(): any {
    return this._marketDataService.packs;
  }

  /**
* scroll handler for market pack detail
* @since 0.0.1
* @public
*/
  ngOnInit(): void {
    this._scrollStoreProvider = new ScrollStoreProvider({
      compContext: this,
      router: this._router,
      route: '/market'
    });
  }

  ngAfterViewInit(): void {
    this._scrollStoreProvider.handleScroll('MarketPackDetail', this.marketPackDetail.nativeElement);
    this._logManagerService.track('Market Pack View', {
      'License': this.marketObject.license,
      'Pack Name': this.marketObject.title,
      'Author Name': this.marketObject.authorName,
      'Pack Id': this.marketObject.packId,
      'Author Id': this.marketObject.authorId,
    });
  }

  get currentMarketStatus(): string {
    return this._marketDataService.filterToMarketRoute;
  }

  get marketObject(): any {
    return this._marketDataService.currentMarketDetail;
  }

  /**
  * backing to market pack.
  * @since 0.0.1
  * @public
  * @return {void}
  */
  backToMarketPacks(): void {

    if (this.animationMode === 'leftToRightSlideOut') {
      this.goBack.emit({});
      this._marketDataService.currentMarketPage = 'pack';
    }

  }

  /**
  * set animation variable for back to marjet.
  * @since 0.0.1
  * @public
  * @return {void}
  */
  backTomarketAnimation(): void {
    this.animationMode = 'leftToRightSlideOut';
  }
  /**
* play detail movie.
* @since 0.0.1
* @public
* @return {void}
*/
  playMovie(): void {
    const videoElement: any = document.getElementById('market-pack-video');
    videoElement.setAttribute('controls', 'controls');
    if ('pause' === this.movieStatus) {
      videoElement.play();
      this.movieStatus = 'play';
    } else {
      videoElement.pause();
      this.movieStatus = 'pause';
    }
  }

  /**
   * open link for download free
   * @return {string}
   */
  linkedFree(): void {
    this._jsxInjectorService.openUrlInBrowser(this.marketObject.details.downloadUrl);
    this._logManagerService.track('Market Buy Click', {
      'License': this.marketObject.license,
      'Pack Name': this.marketObject.title,
      'Author Name': this.marketObject.authorName,
      'Pack Id': this.marketObject.packId,
      'Author Id': this.marketObject.authorId,
      'Action': 'Get Free Version'
    });
  }

  /**
   * open link for purchasing this pack
   * @return {string}
   */
  linkedBuy(): void {
    this._jsxInjectorService.openUrlInBrowser(this.marketObject.details.purchaseUrl, 'discover');
    this._logManagerService.track('Market Buy Click', {
      'License': this.marketObject.license,
      'Pack Name': this.marketObject.title,
      'Author': this.marketObject.authorName,
      'Pack Id': this.marketObject.packId,
      'Author Id': this.marketObject.authorId,
      'Action': 'Buy'
    });
  }

  /**
* check if active tab is different with clicked tab call switch tab
* @param {string} newRoute  name of tab that clicked
* @public
* @return {void}
*/
  marketPacksTab(newRoute: string, event): void {
    if (!event.target.classList.contains('active')) {
      this.marketPacksByRoutes(newRoute, event);
    }
  }

  /**
* check image for background of author tab is define or not
* @public
* @return {string} - string of author image url
*/
  checkAuthorImage(): string {
    const authorImage = this.marketObject.authorDetails.authorImage;
    if (undefined !== authorImage && '' !== authorImage) {
      return authorImage;
    } else {
      return `${this._jsxInjectorService.defualtPath}/src/assets/media/author-background.png`;
    }

  }

  /**
* at the end of animation between author and detail
* @param {object} marketDetailContent  market detail html tag
* @param {object} marketAuthorContent  market author html tag
* @param {string} newRoute  name of tab that clicked
* @public
* @return {void}
*/
  marketPackEndAnimation(marketDetailContent, marketAuthorContent, newRoute): void {
    marketDetailContent.addEventListener('webkitAnimationEnd', function (): void {
      marketDetailContent.classList.remove('show');
      marketAuthorContent.classList.remove('hide');
      marketAuthorContent.classList.remove('show');
      marketDetailContent.classList.remove('hide');
      if (newRoute === 'detail') {
        marketAuthorContent.style.transform = 'translateX(0%)';
        marketDetailContent.style.transform = 'translateX(0%)';
        marketDetailContent.style.opacity = '1';
      } else {
        marketAuthorContent.style.transform = 'translateX(-100%)';
        marketDetailContent.style.transform = 'translateX(-100%)';
        marketDetailContent.style.opacity = '0';
      }
    });
  }
  /**
* define with tab is active in market detail
* @public
* @return {void}
*/
  marketHeaderActiveTab(event): void {
    let marketLinks;
    marketLinks = document.querySelector('.market-pack-detail .active');
    marketLinks.classList.remove('active');
    event.currentTarget.classList.add('active');
  }

  /**
* tab for market between detail and author
* @param {string} newRoute  name of tab that clicked
* @public
* @return {void}
*/
  marketPacksByRoutes(newRoute: string, event): void {
    const marketDetailContent = document.getElementById('detail');
    const marketAuthorContent = document.getElementById('author');
    if (newRoute === 'detail') {
      marketDetailContent.classList.remove('hide');
      marketDetailContent.classList.add('show');
      marketAuthorContent.classList.remove('show');
      marketAuthorContent.classList.add('hide');
    } else {
      marketDetailContent.classList.remove('show');
      marketDetailContent.classList.add('hide');
      marketAuthorContent.classList.remove('hide');
      marketAuthorContent.classList.add('show');
    }
    this.marketPackEndAnimation(marketDetailContent, marketAuthorContent, newRoute);
    this.marketHeaderActiveTab(event);
  }

}

