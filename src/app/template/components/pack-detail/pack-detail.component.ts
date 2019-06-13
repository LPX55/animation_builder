import { AppGlobals } from "../../../../global";
import { FileDataService } from "../../../core/services/file-data/file-data.service";
import { Router } from "@angular/router";
import { ScrollStoreProvider } from "../../../shared/helper/reuse-strategy/scroll-reuse";
import { TemplateCoreService } from "./../../services/template-core.service";
import {
  Component,
  AfterContentInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Renderer2
} from "@angular/core";
import { OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import * as smoothScrollPolyfill from "smoothscroll-polyfill";
import { ResponsiveService } from "../../../core/services/responsive/responsive.service";
import { FileSelectorService } from "../../../core/services/file-selector/file-selector.service";
import { JsxInjectorService } from "../../../core/services/jsx-injector/jsx-injector.service";
import { LogManagerService } from "../../../core/services/log-manager/log-manager.service";

@Component({
  selector: "mf-pack-detail",
  templateUrl: "./pack-detail.component.html",
  styleUrls: ["./pack-detail.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PackDetailComponent
  implements AfterContentInit, OnDestroy, OnInit {
  // pack details object
  @Input() currentPack: any;
  // is fired when we want to go back to packs
  @Output() backToPacks: EventEmitter<any> = new EventEmitter();
  public packTitle = "";
  // all items we want to show goes here by lazy loading
  public itemsHolder = [];
  public foldersHolder = [];
  public categories = [];
  // subscription to item lazy loading subject
  private _itemHolderSubscribe: Subscription;
  // subscription to watcher subject
  private _watcherSubscribe: Subscription;
  // is drop down of categories being shown or not
  public showCategoriesDropDown = false;
  // scroll reuse provider
  private _scrollStoreProvider: ScrollStoreProvider;
  categoriesContent = [];
  @ViewChild("packDetail") packContainer: ElementRef;
  @ViewChild("templateItem") templateItem: ElementRef;
  // showing items timeouts
  showingItemsTimeOuts = [];
  constructor(
    private _fileDataService: FileDataService,
    private _templateCoreService: TemplateCoreService,
    private _router: Router,
    private _responsiveService: ResponsiveService,
    private _appGlobals: AppGlobals,
    private _changeDetectorRef: ChangeDetectorRef,
    private _fileSelectorService: FileSelectorService,
    private _jsxInjectorService: JsxInjectorService,
    private _logManagerService: LogManagerService
  ) {
    this._changeDetectorRef.detach();
    this._scrollStoreProvider = new ScrollStoreProvider({
      compContext: this,
      router: this._router,
      route: "/dashboard/template"
    });
  }

  ngAfterContentInit(): void {
    smoothScrollPolyfill.polyfill();
    window["__forceSmoothScrollPolyfill__"] = true;
    this.itemsHolder = [];
    this.foldersHolder = [];
    this.packTitle = this.currentPack.packName;
    this._fileDataService.categoriesLoaded = 0;
    this._fileDataService.currentPackDetail = this.currentPack;
    this._fileDataService.packDetails.categories = [];
    this.startFetchingItems();
    this._responsiveService.templateListItemsResponsive();
    this._responsiveService.templateItemZoom.subscribe(() => {
      this._changeDetectorRef.markForCheck();
    });
    this._responsiveService.templateItemMargin.subscribe(() => {
      this._changeDetectorRef.markForCheck();
    });
    this._changeDetectorRef.detectChanges();
  }

  get templateItemMargin(): number {
    let itemMargin = this._responsiveService.templateItemMargin.getValue();
    itemMargin = itemMargin > 3 ? itemMargin : 3;
    return itemMargin;
  }

  get templateItemWidth(): number {
    return this._responsiveService.templateItemWidth.getValue();
  }

  get templateItemPreviewHeight(): number {
    return this._responsiveService.templateItemPreviewHeight.getValue();
  }

  ngOnInit(): void {
    this._scrollStoreProvider.handleScroll(
      "packDetail",
      this.packContainer.nativeElement
    );
  }

  /**
   * sort categories and move uncategorized to bottom of list
   * @return {void}
   */
  sortCategories(): void {
    if (this.categories.includes(this._fileDataService.categoryAllName)) {
      this.categories = this.categories.filter(
        categoryName => categoryName !== this._fileDataService.categoryAllName
      );
      this.categories.sort();
      this.categories = this.categories.concat([
        this._fileDataService.categoryAllName
      ]);
    } else {
      this.categories.sort();
    }
  }

  /**
   * determine if item has video preview or not
   * @param {any[]} items - list of all items in pack
   * @param {string} fileType - type of item
   * @param {string} filePath - path of item
   * @return {string} preview path if exists
   */
  isItemHasPreview(items, fileType, filePath): string {
    let videoPreview = filePath.split(".")[0] + ".mp4";

    if (fileType !== "image" && fileType !== "video") {
      if (
        items.filter(
          item => item[0].toLowerCase() === videoPreview.toLowerCase()
        ).length === 0
      ) {
        videoPreview = undefined;
      }
    } else {
      videoPreview = undefined;
    }
    return videoPreview;
  }

  /**
   * categorize all items in their category
   * @param {any[]} items - list of all items in pack
   * @param {any[]} removedItems - removed items list in pack
   * @return {any} holder object with key name of their category
   */
  categorizeItems(items, removedItems): any {
    const itemsHolder = [];
    // this.categories.map(categoryNameMenu => {
    //   itemsHolder[categoryNameMenu] = [];
    // });

    items.map(fileDetail => {
      if (!(fileDetail[2] && !removedItems.includes(fileDetail[0]))) {
        return;
      }
      let category = "";

      category = fileDetail[4];
      const fileType = this._fileDataService.fetchFileType(fileDetail[0]);
      let videoPreview = "";
      if (!fileDetail[6]) {
        videoPreview = this.isItemHasPreview(items, fileType, fileDetail[0]);
      } else {
        videoPreview = fileDetail[6];
      }
      itemsHolder.push({
        itemPath: fileDetail[0],
        categoryName: category,
        itemDetail: {
          fileName: fileDetail[0].split("/").pop(),
          size: fileDetail[1],
          thumb: "./assets/transparent.png",
          fileType: fileType,
          locked: fileDetail[3],
          videoPreview,
          sequence: fileDetail[7],
          imagesPath: fileDetail[8]
        }
      });
      this._changeDetectorRef.markForCheck();
    });
    return itemsHolder;
  }

  /**
   * start showing items in view
   * @param {any[]} itemsHolder - categorized items list
   * @return {void}
   */
  showItemsInView(itemsHolder): void {
    let indexItem = 0;
    // this.categories.map((categoryNameMenu, indexMenu) => {
    this.itemsHolder = [];
    // if (itemsHolder[categoryNameMenu].length > 0 && categoryNameMenu !== undefined) {
    //   this.categoriesContent.push({
    //     id: indexMenu + 1,
    //     thumbnail: '',
    //     title: categoryNameMenu
    //   });
    // }
    itemsHolder.sort(this.sortByFileName);
    itemsHolder.map(item => {
      indexItem++;
      this.showingItemsTimeOuts.push(
        setTimeout(() => {
          this.itemsHolder.push(item);
          this._changeDetectorRef.detectChanges();
        }, indexItem * 20)
      );
    });
    // });
  }

  /**
   * start processing data got from ipc
   * @param {any[]} data - the data got from ipc
   * @param {any[]} removedItems - removed items list
   * @return {void}
   */
  processPackDetail(data, removedItems): void {
    this.foldersHolder = this.foldersHolder.concat(
      data.folders.filter(ele => !this.foldersHolder.includes(ele))
    );
    this.sortCategories();
    let itemsHolder = this.categorizeItems(data.items, removedItems);
    this.showItemsInView(itemsHolder);
    itemsHolder.length = 0;
  }

  /**
   * start fetch all items and processing it
   * @return {void}
   */
  startFetchingItems(): void {
    this.watcherSubscriber();
    const removedItems = this._fileDataService.fetchRemovedItems(
      this.currentPack.id
    );
    const addedItems = this._fileDataService.fetchAddedItems(
      this.currentPack.id
    );
    const addeds = [];
    addedItems.map(addedItem => {
      // tslint:disable-next-line:max-line-length
      if (
        !this.categories.includes(addedItem.categoryName) &&
        "" !== addedItem.categoryName
      ) {
        this.categories.push(addedItem.categoryName);
      }

      addeds.push([
        addedItem.itemPath,
        addedItem.itemDetail.size,
        2,
        0,
        "" === addedItem.categoryName
          ? this._fileDataService.categoryAllName
          : addedItem.categoryName,
        addedItem.itemDetail.fileName,
        addedItem.itemDetail.videoPreview,
        addedItem.itemDetail.sequence,
        addedItem.itemDetail.imagesPath
      ]);
    });

    if (this.currentPack.packPath !== "") {
      this._fileDataService.getPackDetails(true);
    }

    this._itemHolderSubscribe = this._fileDataService.categorySubject.subscribe(
      data => {
        data.items = data.items.concat(addeds);

        if (
          addeds.length > 0 &&
          !data.categories.includes(this._fileDataService.categoryAllName)
        ) {
          data.categories = data.categories.concat([
            this._fileDataService.categoryAllName
          ]);
        }
        this._fileDataService.isThumbnailQueueRunning = false;
        this._fileDataService.thumbnailQueue = [];
        this.categoriesContent = [];
        this.processPackDetail(data, removedItems);
      }
    );

    if (this.currentPack.packPath === "") {
      this._fileDataService.categorySubject.next({
        categories: [this._fileDataService.categoryAllName],
        items: []
      });
    }
  }

  /**
   * Sorts files based on their name
   * @param {any} a
   * @param {any} b
   * @return {number} - used by sort function to sort items
   */
  sortByFileName(a, b): number {
    const textA = a.itemDetail.fileName.toUpperCase();
    const textB = b.itemDetail.fileName.toUpperCase();
    return textA < textB ? -1 : textA > textB ? 1 : 0;
  }

  /**
   * subscribe to file watcher subject in file data service to watch for file changes
   * @return {void}
   */
  watcherSubscriber(): void {
    this._watcherSubscribe = this._fileDataService.watchSubject.subscribe(
      data => {
        if (!data.category) {
          data.category = this._fileDataService.categoryAllName;
        }
        if (data.event === "removed") {
          if (data.type === "category") {
            this.removeCategory(data.category);
          } else if (data.type === "item") {
            this.removeItem(data.category, data.item);
          }
        } else if (data.event === "added") {
          if (data.type === "category") {
            this.addCategory(data.category, data.items);
          } else if (data.type === "item") {
            this.addItem(data.category, data.item);
          }
        }
        this._changeDetectorRef.detectChanges();
      }
    );
  }
  /**
   * remove category from holder
   * @return {void}
   */
  removeCategory(categoryName): void {
    // delete this.itemsHolder[categoryName];
  }

  /**
   * remove item from holder
   * @return {void}
   */
  removeItem(categoryName, itemPath): void {
    this.itemsHolder = this.itemsHolder.filter(item => {
      return item.itemPath !== itemPath;
    });

    this.itemsUpdated();
  }

  /**
   * add category to holder
   * @return {void}
   */
  addCategory(CategoryName, items): void {
    // this.itemsHolder[CategoryName] = items;
  }

  /**
   * add item to holder
   * @return {void}
   */
  addItem(categoryName, itemDetail): void {
    this.itemsHolder.push(itemDetail);
    this.itemsHolder.sort(this.sortByFileName);
    this.itemsUpdated();
  }

  ngOnDestroy(): void {
    this._fileDataService.isThumbnailQueueRunning = false;
    this._fileDataService.thumbnailQueue = [];
    this.showingItemsTimeOuts.map(timeout => {
      clearTimeout(timeout);
    });
    this._fileDataService.destroyWatcher();
    if (this._itemHolderSubscribe) {
      this._itemHolderSubscribe.unsubscribe();
    }
    if (this._watcherSubscribe) {
      this._watcherSubscribe.unsubscribe();
    }
  }

  /**
   * runs when user navigates back to pack list
   * @fire PackDetailComponent#backToPacks
   * @return {void}
   */
  goBackToPacks(): void {
    this.backToPacks.emit();
  }

  /**
   * it changes the view mode of items
   * @param {string} mode - the view mode we want
   * @return {void}
   */
  changeViewMode(mode: string): void {
    this._templateCoreService.viewMode = mode;
  }

  /**
   * it shows the drop down of categories by chaning the showing variable
   * @return {void}
   */
  toggleCategories($event): void {
    if (!this.showCategoriesDropDown) {
      this.showCategoriesDropDown = true;
      this._changeDetectorRef.detectChanges();
      $event.stopPropagation();
    }
  }

  /**
   * it is fired when user click on a menu in drop down
   * @return void
   */
  onClickOnCategoriesDropDown($event): void {
    const menuId = $event.menuId;
    document
      .getElementById("category" + menuId)
      .scrollIntoView({ behavior: "smooth" });
  }

  /**
   * this is fired when categories drop down is closed. we want to destroy it
   * @return void
   */
  onCategoriesDropDownClosed(): void {
    this.showCategoriesDropDown = false;
    this._changeDetectorRef.detectChanges();
  }

  /**
   * when items removed or updated
   * @return void
   */
  itemsUpdated(): void {
    this.categoriesContent = [];
    this.categories.map((categoryNameMenu, indexMenu) => {
      if (this.itemsHolder.length > 0) {
        // this.categoriesContent.push({
        //   id: indexMenu + 1,
        //   thumbnail: "",
        //   title: categoryNameMenu
        // });
      }
    });
  }

  buyClick(): void {
    this._logManagerService.track("Template Buy Click", {
      Source: "Template Item",
      "Pack Name": this.packTitle,
      "Pack Link": this.currentPack.buyLink
    });
    this._jsxInjectorService.openUrlInBrowser(
      this.currentPack.buyLink,
      "locked-items"
    );
  }

  /**
   * icon in miss item click
   * @return void
   */
  missingIconClicked(): void {
    this._fileDataService.isMissingIconClick = true;
    this._fileDataService.missingMessageText = "This File in Is missing ! ";
  }
}
