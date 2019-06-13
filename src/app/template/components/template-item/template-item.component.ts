import { IpcHandlerService } from './../../../core/services/ipc-handler/ipc-handler.service';
import { UserManagerService } from './../../../core/services/user-manager/user-manager.service';
import { OsInfoService } from './../../../core/services/operating-system/os-info.service';
import { AppGlobals } from './../../../../global';
import { Subject, Subscription } from 'rxjs';
import { JsxInjectorService } from '../../../core/services/jsx-injector/jsx-injector.service';
import { ResponsiveService } from '../../../core/services/responsive/responsive.service';
import { FileDataService } from '../../../core/services/file-data/file-data.service';
import {
  Component,
  OnInit,
  AfterViewInit,
  Input,
  ViewChild,
  ElementRef,
  OnDestroy,
  NgZone,
  HostListener,
  HostBinding,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  AfterContentInit,
  Renderer2
} from '@angular/core';
import { TemplateCoreService } from '../../services/template-core.service';
import { FileSelectorService } from '../../../core/services/file-selector/file-selector.service';
import { CepHostService } from '../../../core/services/cep-host/cep-host.service';
import { LogManagerService } from '../../../core/services/log-manager/log-manager.service';
import { log } from 'util';

@Component({
  selector: 'mf-template-item',
  templateUrl: './template-item.component.html',
  styleUrls: ['./template-item.component.scss']
})
export class TemplateItemComponent implements OnInit, AfterViewInit, OnDestroy {
  // thumbnail path of item
  public thumbnail: string;
  // title of item
  public title: string;
  // size on disk
  public space: string;
  // path of item
  public path: string;
  // used fonts in file
  public usedFonts: string;
  // is file locked
  public isLocked: boolean;
  // data of file
  public data: [any];
  // is preview loading or not
  public isLoading: boolean;
  // file duration
  public duration: string;
  // default background
  public defaultBackground = './assets/transparent.png';
  // file type
  public fileType: string;
  // is Draggable
  public isDragable = true;
  // item detail
  @Input() item;
  // height of item preview
  @Input() previewHeight: number;
  // pack id
  public packID: string;
  // category Name
  @Input() categoryName: string;
  // buy button clicked
  @Output() buyClick = new EventEmitter();
  // title of item
  @ViewChild('previewImg') previewImage: ElementRef;
  // bar div element
  @ViewChild('barDiv') barDiv: ElementRef;
  // parent div element
  @ViewChild('parentDiv') parentDiv: ElementRef;

  public loadingPreviewVideo = false;
  // is item has video preview or not
  public hasVideoPreview = false;
  // subscription of preview that if generating preview finished or not
  private _previewSubscription: Subscription;
  // path of preview to show in dom
  public previewPath = './assets/transparent.png';
  // thumb type if its multi or single ...
  private _thumbType = 'image';
  // if item had video preview we store the spreed sheet path here
  private _spreedSheetPath = '';

  /**
   * determines if we are in drag status or not then it will and a class for animation
   * @public
   */
  @Output() isMissingIconClicked: EventEmitter<any> = new EventEmitter();
  public draged = false;
  // missing tooltip show
  public showMissTooltip;
  // first time to load missing box
  public firstLoadMissing = false;
  private _fileSelectSubscription: Subscription;
  // item index in current page
  public index = 0;
  // Item missing status
  public isMissing = false;
  // title hover stauts
  public isHover = false;
  // video preview duration in seconds
  private _videoPreviewDuration = 0;
  // cached frames in video preview
  private _loadedSeconds = [];
  // is user hovering mouse and are we caching preview frames
  private _isCachingPreview = false;
  // last frame shown in video preview
  private _lastSecond = 0;
  // video preview frame size
  private _videoPreviewDimensions = [300, 191];
  // max frames to cache in video preview
  private _previewMaxFrames = 20;
  public videoLivePreview;
  // Item extension
  public itemExtension: string;
  // Item name without extension
  public itemNameWithoutExtension: string;
  // video element for preview

  public sequence: any;
  private _videoElement: any;
  public showDisabledToolTip = false;
  private _mogrtDimensions = [1920, 1080];
  private _sequenceDimensions = [1920, 1080];
  private _mouseIsDown = false;
  private _dragImageThumb;
  private _destroyed = false;
  private _holderName = '';
  private _dragData = '';

  // determines if item is selected or not
  @HostBinding('class.selected') selected = false;
  // determines if item is missed or not and pass a class to parent component
  @HostBinding('class.itemMissed') itemMissed = this.isMissing;
  completeSubscription: Subscription;
  // item has video preview
  private _loadVideo = false;
  // video play hover timeout
  public videoHoveredTimeOut: any;
  // is item disabled
  public disabled = true;
  // host name
  public hostName = '';
  private documentMouseUpHandler = this.handleDocumentMouseUp.bind(this);

  constructor(
    private _templateCoreService: TemplateCoreService,
    private _fileDataService: FileDataService,
    private _osInfoService: OsInfoService,
    private _responsiveService: ResponsiveService,
    private _jsxInjectorService: JsxInjectorService,
    private _fileSelectorService: FileSelectorService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _cepHostService: CepHostService,
    private _userManagerService: UserManagerService,
    private _appGlobals: AppGlobals,
    private _logManagerService: LogManagerService,
    private _ipcHandlerService: IpcHandlerService,
    private _renderer: Renderer2,
    private _elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this._changeDetectorRef.detach();
    this.hostName = this._cepHostService.host.hostName;
    this.path = this.item.itemPath;
    this.packID = this._fileDataService.fileBrowserStack.length
      ? this._fileDataService.fileBrowserStack[0].packID
      : '';
    this.fileType = this.item.itemDetail.fileType;
    this.title = this.item.itemDetail.fileName;
    this.itemNameWithoutExtension = this.title.replace(/\.[^/.]+$/, '');
    this.itemExtension = this.item.itemDetail.fileName.split('.').pop();
    if (
      this._fileDataService.allowedExtensions
        .concat(this._fileDataService.allSupportedExtensions.video)
        .concat(this._fileDataService.allSupportedExtensions.image)
        .includes(this.itemExtension.toLowerCase())
    ) {
      this.disabled = false;
    }
    this.thumbnail = this.item.itemDetail.thumb;
    this.space = this.formatBytes(this.item.itemDetail.size);
    this.duration = this.processDuration(this.item.itemDetail.duration);
    this.usedFonts = this.item.itemDetail.usedFonts;
    this.isLocked = this.item.itemDetail.locked;
    this.data = this.item.itemDetail.data;
    this.sequence = this.item.itemDetail.sequence;
    this.isLoading = this.item.isLoading;
    if ('' === this.packID) {
      this.index = this._templateCoreService.countIndexRoot++;
    } else {
      this.index = this._templateCoreService.countIndexPack++;
    }

    this.item.itemDetail.packID = this.packID;

    this._fileSelectSubscription = this._fileSelectorService.selectedItemsIndex$.subscribe(
      selectedItems => {
        if (
          this.packID === this._fileDataService.currentPackDetail.id ||
          !this._fileDataService.currentPackDetail
        ) {
          if (-1 < selectedItems.indexOf(this.index)) {
            this.addToSelectedItems();
          } else {
            this.removeFromSelectedItems();
          }
        }
        this._changeDetectorRef.markForCheck();
      }
    );
    if (true === this.isLocked) {
      this.title = this.item.itemDetail.fileName.replace('.mp4', '.mogrt');
    } else {
      this.title = this.item.itemDetail.fileName;
    }

    this._changeDetectorRef.detectChanges();

    this._responsiveService.templateItemHeight.subscribe(() => {
      setTimeout(() => {
        this._changeDetectorRef.detectChanges();
      });
    });
    // checking item exist and show missing item message box
    if (!fs.existsSync(this.item.itemPath)) {
      this.firstLoadMissing = true;
      this.itemMissed = true;
      this.isMissing = true;
      this._fileDataService.haveMissFile = true;
      this._fileDataService.missingList.push([
        this.item.itemPath,
        this.item.itemDetail.fileName,
        this.item
      ]);
    }
  }

  /**
   * adds this item to selected item array in item selector service
   * @return {void}
   */
  addToSelectedItems(): void {
    this._elementRef.nativeElement.classList.add('selected');
    if (
      0 ===
      this._fileSelectorService.selectedItemsDetail.filter(
        itemObject => itemObject.item.itemPath === this.item.itemPath
      ).length
    ) {
      this._fileSelectorService.selectedItemsDetail.push({
        packID: this.packID,
        item: this.item
      });
    }
  }

  /**
   * removes this item from selected item array in item selector service
   * @return {void}
   */
  removeFromSelectedItems(): void {
    this._elementRef.nativeElement.classList.remove('selected');
    this._fileSelectorService.selectedItemsDetail = this._fileSelectorService.selectedItemsDetail.filter(
      itemObject => itemObject.item.index !== this.index
    );
  }

  /**
   * Converts mogrt duration to time format and removes hours value if it's 00
   *
   * @param {string} duration - duration of mogrt.
   * @return {string} - assigns calculated duration to this._duration
   */
  processDuration(duration: string): string {
    let processedDuration = '';
    if (this.fileType === 'image') {
      return duration;
    }
    if (duration !== undefined && duration !== '') {
      let calculatedDuration = new Date(parseFloat(duration) * 1000)
        .toISOString()
        .substr(11, 8);
      const durationArray = calculatedDuration.split(':');
      const [hours, minutes, seconds] = durationArray;
      if ('00' === hours) {
        calculatedDuration = `${minutes}:${seconds}`;
      }
      processedDuration = calculatedDuration;
    } else {
      processedDuration = '';
    }
    return processedDuration;
  }

  /**
   * detemine the queue subject from item place if it's in root or in a pack
   * @return {Subject}
   */
  fetchCompleteSubject(): Subject<string> {
    let completeSubject: Subject<string>;
    if (this.packID === '') {
      completeSubject = this._fileDataService.rootThumbnailQueueSubject;
    } else {
      completeSubject = this._fileDataService.thumbnailSubject;
    }
    return completeSubject;
  }

  /**
   * run queue to fetch thumbnail of next item
   * @return {void}
   */
  runNextQueue(): void {
    if (this._destroyed) {
      return;
    }
    this._changeDetectorRef.detectChanges();
    if (this.packID !== '') {
      this._fileDataService.runCompleteQueue();
    } else {
      this._fileDataService.runRootCompleteQueue();
    }
  }

  /**
   * run queue if it's not running
   * @return {void}
   */
  runInitialQueue(): void {
    if (this.packID === '') {
      if (!this._fileDataService.rootThumbnailQueue.includes([this.path])) {
        this._fileDataService.rootThumbnailQueue.push([this.path]);
      }
    } else {
      if (!this._fileDataService.thumbnailQueue.includes([this.path])) {
        this._fileDataService.thumbnailQueue.push([this.path]);
      }
    }
    if (!this._fileDataService.isThumbnailQueueRunning && this.packID !== '') {
      this._fileDataService.isThumbnailQueueRunning = true;
      this._fileDataService.runCompleteQueue();
    }
    if (
      !this._fileDataService.isRootThumbnailQueueRunning &&
      this.packID === ''
    ) {
      this._fileDataService.runRootCompleteQueue();
    }
  }

  /**
   * process headers that we put in thumbnail to fetch duration and ... of item
   * @param {string} itemThumbnailURL - item thumbanil url
   * @param {string} itemInfo - item info got parsed from headers in xhr
   * @return {void}
   */
  processThumbnailHeaders(itemThumbnailURL, itemInfo): void {
    if (this.item.itemDetail.fileType === 'image') {
      this.duration = itemInfo.dimensions;
      if (this.sequence && fs.existsSync(this.path)) {
        const tranition = itemInfo.dimensions.split('*');
        this._sequenceDimensions = [
          parseInt(tranition[0], 10),
          parseInt(tranition[1], 10)
        ];
      }
    } else if (this.item.itemDetail.fileType === 'video') {
      this.item.itemDetail.duration = itemInfo.durationInSeconds;
      this._videoPreviewDuration = itemInfo.durationInSeconds;
      this._spreedSheetPath = itemThumbnailURL;
      this._videoPreviewDimensions = itemInfo.frameSize;
      this.duration = this.processDuration(itemInfo.durationInSeconds);
    } else if (this.item.itemDetail.fileType === 'mogrt') {
      this.duration = this.processDuration(itemInfo.duration);
      this.usedFonts = itemInfo.usedFonts;
      this._mogrtDimensions = [itemInfo.width, itemInfo.height];
    }
  }

  /**
   * load image into view
   * @param {Blob} thumbnailRawContent - content of image
   * @return {void}
   */
  loadImageContent(thumbnailRawContent): void {
    const reader = new FileReader();
    reader.onloadend = () => {
      const imgElement = this.previewImage.nativeElement;
      if (this.sequence && fs.existsSync(this.path)) {
        this.changeImageSequenceToDefault();
      } else {
        imgElement.src = reader.result;
        this._dragImageThumb = reader.result;
      }
      imgElement.style.visibility = 'visible';
    };
    reader.readAsDataURL(thumbnailRawContent);
  }

  /**
   * send xhr to fetch thumbanil and headers of it
   * @return {void}
   */
  ajaxThumbnail(): void {
    const itemThumbnailURL = this._fileDataService.fetchItemThumbnailURL(
      this.item.itemDetail.fileType,
      this.path
    );
    this.thumbnail = itemThumbnailURL;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', itemThumbnailURL, true);
    xhr.responseType = 'blob';
    xhr.onerror = e => {
      if (xhr.status === 0) {
        this.cacheError();
      }
    };
    xhr.onload = () => {
      if (xhr.status !== 200) {
        this.runNextQueue();
      }
      const thumbnailRawContent = xhr.response;
      if (thumbnailRawContent.size !== 0) {
        const itemInfo = JSON.parse(xhr.getResponseHeader('itemInfo'));
        this.processThumbnailHeaders(itemThumbnailURL, itemInfo);

        if (this.item.itemDetail.fileType === 'video') {
          this.item.itemDetail.videoPreview = this.path;
        }

        if (this.item.itemDetail.videoPreview && !itemInfo.hasVideo) {
          this.thumbnail = this._fileDataService.fetchItemThumbnailURL(
            'video',
            this.item.itemDetail.videoPreview
          );
          this.prepareVideoPreview(this.thumbnail, () => {
            if (this.item.itemDetail.fileType !== 'mogrt' && !this.isLocked) {
              this.doPreview();
            } else {
              this._loadVideo = true;
            }
            this.runNextQueue();
          });
        } else {
          if (this.item.itemDetail.fileType === 'mogrt') {
            if (itemInfo.hasVideo) {
              this.loadImageContent(thumbnailRawContent);
              this._loadVideo = true;
              this.item.itemDetail.videoPreview =
                this._fileDataService.fetchItemThumbnailURL(
                  'mogrt',
                  this.path
                ) + '&video=1';
            } else {
              this.loadImageContent(thumbnailRawContent);
            }
            this.runNextQueue();
          } else {
            this.loadImageContent(thumbnailRawContent);
            this.runNextQueue();
          }
        }
      } else {
        this.runNextQueue();
      }
    };
    try {
      xhr.send();
    } catch (e) {
      this.cacheError();
    }
  }

  cacheError() {
    this._appGlobals.DBConnection.set(
      'cacheTime',
      new Date().getTime()
    ).write();
    this.ajaxThumbnail();
  }

  /**
   * send xhr to check if there is any video inside mogrt or not otherwise we will load png inside
   * @param {string} mogrtThumbnailRawContent - png raw content inside of mogrt
   * @return {void}
   */
  loadMogrtPreview(mogrtThumbnailRawContent): void {
    const videoMogrtThumbnail = this._fileDataService.fetchItemThumbnailURL(
      'video',
      this.path
    );
    const videoPath =
      this._fileDataService.fetchItemThumbnailURL('mogrt', this.path) +
      '&video=1';

    const xhr = new XMLHttpRequest();
    xhr.open('GET', videoPath, true);
    xhr.responseType = 'blob';
    xhr.onload = () => {
      if (xhr.response.size !== 0) {
        this.prepareVideoPreview(
          videoMogrtThumbnail,
          success => {
            this._loadVideo = true;
            this.item.itemDetail.videoPreview =
              this._fileDataService.fetchItemThumbnailURL('mogrt', this.path) +
              '&video=1';
            this.runNextQueue();
          },
          false
        );
      } else {
        this.loadImageContent(mogrtThumbnailRawContent);
        this.runNextQueue();
      }
    };
    xhr.send();
  }

  ngAfterViewInit(): void {
    if (
      !['video', 'image', 'mogrt'].includes(this.fileType) &&
      !this.item.itemDetail.videoPreview
    ) {
      return;
    }
    const completeSubject = this.fetchCompleteSubject();
    this.completeSubscription = completeSubject.subscribe(path => {
      if (this.path === path) {
        this.completeSubscription.unsubscribe();
        if (
          this.item.itemDetail.fileType !== 'video' &&
          this.item.itemDetail.fileType !== 'image' &&
          this.item.itemDetail.videoPreview
        ) {
          this.thumbnail = this._fileDataService.fetchItemThumbnailURL(
            'video',
            this.item.itemDetail.videoPreview
          );
          this.prepareVideoPreview(this.thumbnail, () => {
            this._loadVideo = true;
            this.runNextQueue();
          });
          return;
        }
        this.ajaxThumbnail();
      }
    });

    this.runInitialQueue();
  }
  /**
   * change sequence image to default image
   */
  changeImageSequenceToDefault(): void {
    const defaultImage = Math.round(this.item.itemDetail.imagesPath.length / 2);
    const imageTag = this.previewImage.nativeElement;
    imageTag.src = this.item.itemDetail.imagesPath[defaultImage];
  }

  /**
   * send xhr to get preview frame and headers
   * @param {string} videoPreviewPath - preview url
   * @param {function} callback - call back function to detemine its done
   * @return {void}
   */
  prepareVideoPreview(videoPreviewPath, callback, processContent = true): void {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', videoPreviewPath, true);

    xhr.responseType = 'blob';
    xhr.onload = () => {
      if (xhr.status !== 200) {
        callback(false);
        return;
      }
      const previewRawContent = xhr.response;
      if (previewRawContent.size !== 0 && processContent) {
        const itemInfo = JSON.parse(xhr.getResponseHeader('itemInfo'));
        this._videoPreviewDuration = itemInfo.durationInSeconds;
        this._spreedSheetPath = videoPreviewPath;
        this._videoPreviewDimensions = itemInfo.frameSize;
        this.loadImageContent(previewRawContent);
        this._changeDetectorRef.markForCheck();
        callback(true);
      } else if (!processContent && previewRawContent.size !== 0) {
        this.loadImageContent(previewRawContent);
        callback(true);
      } else {
        callback(false);
        return;
      }
    };
    xhr.send();
  }

  /**
   * add event listeners to mouse to build video preview
   * @return {void}
   */
  doPreview(): void {
    this.prepareThumbnailMouseOver();
    this.prepareThumbnailMouseOut();
    const imgElement = this.previewImage.nativeElement;
    imgElement.addEventListener('mousemove', (event: any) => {
      const mouseX = event.offsetX;
      const itemWidth = this._responsiveService.templateItemWidth.getValue();
      this.itemShowBar(event);
      const ofMax = Math.floor((mouseX / itemWidth) * this._previewMaxFrames);
      let percent = (mouseX / itemWidth) * this._videoPreviewDuration;
      if (percent < 0) {
        percent = 0;
      }
      if (this._lastSecond !== ofMax && this._loadedSeconds.includes(ofMax)) {
        // tslint:disable-next-line:max-line-length
        const imgURL =
          this._spreedSheetPath +
          '&second=' +
          (ofMax / this._previewMaxFrames) * this._videoPreviewDuration +
          '&videoWidth=' +
          this._videoPreviewDimensions[0] +
          '&videoHeight=' +
          this._videoPreviewDimensions[1];
        this._lastSecond = ofMax;
        imgElement.src = imgURL;
      }
    });
  }

  /**
   * add mouse over event to mouse on video preview
   * @return {void}
   */
  prepareThumbnailMouseOver(): void {
    const imgElement = this.previewImage.nativeElement;
    imgElement.addEventListener('mouseover', (event: any) => {
      this._isCachingPreview = true;
      // step step video preview building 5 to 20 (max)
      this.cacheSecond(0, this._videoPreviewDuration / 5, () => {
        this.cacheSecond(
          0,
          this._videoPreviewDuration / this._previewMaxFrames,
          () => {}
        );
      });
    });
  }

  /**
   * add mouse out event to mouse on video preview
   * @return {void}
   */
  prepareThumbnailMouseOut(): void {
    const imgElement = this.previewImage.nativeElement;
    imgElement.addEventListener('mouseout', (event: any) => {
      this.spreedSheetPreviewStop();
    });
  }

  /**
   * cache frame of video preview
   * @param {number} second - second of video to fetch frame
   * @param {number} step - step of progressing caching
   * @param {function} callback - if caching is finished
   * @return {void}
   */
  cacheSecond(second, step, callback): void {
    if (!this._isCachingPreview) {
      return;
    }
    if (
      this._loadedSeconds.includes(
        Math.floor(
          (second / this._videoPreviewDuration) * this._previewMaxFrames
        )
      )
    ) {
      if (second + step <= this._videoPreviewDuration) {
        this.cacheSecond(second + step, step, callback);
      } else {
        callback();
      }
      return;
    }
    const xhr = new XMLHttpRequest();
    // tslint:disable-next-line:max-line-length
    xhr.open(
      'GET',
      this._spreedSheetPath +
        '&second=' +
        second +
        '&videoWidth=' +
        this._videoPreviewDimensions[0] +
        '&videoHeight=' +
        this._videoPreviewDimensions[1],
      true
    );
    xhr.onload = oEvent => {
      this._loadedSeconds.push(
        Math.floor(
          (second / this._videoPreviewDuration) * this._previewMaxFrames
        )
      );
      if (second + step <= this._videoPreviewDuration) {
        this.cacheSecond(second + step, step, callback);
      } else {
        callback();
      }
    };
    xhr.send();
  }

  ngOnDestroy(): void {
    this._destroyed = true;
    this._fileDataService.thumbnailQueue = this._fileDataService.thumbnailQueue.filter(
      item => {
        if (item[0] !== this.path) {
          return true;
        }
      }
    );
    this._changeDetectorRef.detach();
    this._fileSelectSubscription.unsubscribe();
    if (this.completeSubscription) {
      this.completeSubscription.unsubscribe();
    }
  }

  get itemType(): string {
    return this._thumbType;
  }

  /**
   * if mouse up on document
   * @return {void}
   */
  handleDocumentMouseUp(e: any): void {
    this.draged = false;
    if (!this.isPPro()) {
      document.removeEventListener('mouseup', this.documentMouseUpHandler);
    }
    this.handleDragend(e);
  }

  /**
   * if mouse up on this item
   * @return {void}
   */
  handleViewMouseUp(e: any): void {
    if (e.button !== 0 || this.isMissing || this.isLocked) {
      return;
    }
    this.draged = false;
    if (!this.isPPro()) {
      this.handleDragend(e);
    }
  }

  /**
   * if mouse down on this item
   * @return {void}
   */
  handleViewMouseDown(e: any): void {
    if (e.button !== 0 || this.isMissing || this.isLocked) {
      return;
    }
    if (!this.isPPro()) {
      this.handleDragstart(e);
    }
  }

  /**
   * if user drags an item outside of extension then it will replace holder with item source
   * @return {void}
   */
  handleDragend(e: any): void {
    if (this.isMissing || this.isLocked) {
      return;
    }
    if (!this.isPPro()) {
      this._templateCoreService.hideDDPanel();
    }
    this._elementRef.nativeElement.getElementsByTagName(
      'mf-tooltip'
    )[0].style.display = 'block';
    this.videoStoped();
    this.draged = false;
    const body = document.body;
    if (
      body != null &&
      !(
        e.clientX > 0 &&
        e.clientX < body.clientWidth &&
        (e.clientY > 0 && e.clientY < body.clientHeight)
      )
    ) {
      this.addItem();
    }
    this._elementRef.nativeElement.style.opacity = '1';
    this._changeDetectorRef.detectChanges();
  }

  get isMac(): boolean {
    return this._osInfoService.currentPlatform === 'MAC';
  }

  /**
   * handle add item event
   * @return {void}
   */
  handleAddItemEvent(): void {
    this.videoStoped();
    this.addItem();
    this._changeDetectorRef.detectChanges();
  }

  /**
   * handle drags to reduce item opacity
   * @return {void}
   */
  handleDrag(e: any): void {
    this._elementRef.nativeElement.style.opacity = '0.7';
  }

  /**
   * create a canvas and add every element of view of item to it manually and return base64 data url
   * @return {string}
   */
  createImageofItem(): Promise<any> {
    return new Promise(resolve => {
      const canvas = this._appGlobals.dragAndDropCanvas;
      const ctx = this._appGlobals.dragAndDropContext;
      ctx.save();
      ctx.fillStyle = '#191919';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, 170, 95);
      ctx.font = '20px Open Sans-regular';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      const extensionThumbnailWidth = ctx.measureText(
        this.getItemExtension().toUpperCase()
      ).width;
      ctx.fillText(
        this.getItemExtension().toUpperCase(),
        (canvas.width - extensionThumbnailWidth) / 2,
        60
      );
      let dWidth = 170;
      let dHeight = 95;
      const sRatio =
        this.previewImage.nativeElement.naturalWidth /
        this.previewImage.nativeElement.naturalHeight;
      const dRatio = 170 / 95;
      if (sRatio > dRatio) {
        dHeight =
          (170 / this.previewImage.nativeElement.naturalWidth) *
          this.previewImage.nativeElement.naturalHeight;
      } else {
        dWidth =
          (95 / this.previewImage.nativeElement.naturalHeight) *
          this.previewImage.nativeElement.naturalWidth;
      }
      const img = new Image();
      img.src =
        this.previewImage.nativeElement.src === ''
          ? './assets/transparent.png'
          : this.previewImage.nativeElement.src;
      img.onload = () => {
        ctx.drawImage(
          img,
          (170 - dWidth) / 2,
          (95 - dHeight) / 2,
          dWidth,
          dHeight
        );
        ctx.font = '10px Open Sans-regular';
        ctx.fillStyle = '#fff';
        ctx.fillText(this.getItemName(), 5, 112);
        ctx.font = '9px Open Sans-regular';
        ctx.fillText(this.duration, 7, 132);
        ctx.textAlign = 'right';
        const extensionTextWidth = ctx.measureText(
          this.getItemExtension().toUpperCase()
        ).width;
        ctx.strokeStyle = '#1E5BFF';
        ctx.shadowColor = '#1E5BFF';
        ctx.shadowBlur = 1.75;
        this.drawCurveRect(ctx, extensionTextWidth);
        ctx.stroke();
        ctx.fillText(this.getItemExtension().toUpperCase(), 161, 112);
        const dataUrl = canvas.toDataURL();
        ctx.restore();
        resolve(dataUrl);
      };
    });
  }
  /**
   * draw rect in context with radius
   * @return {void}
   */
  drawCurveRect(ctx, extensionTextWidth): void {
    ctx.beginPath();
    const rectX = 161 - extensionTextWidth - 4.5;
    const rectY = 101;
    const rectWidth = extensionTextWidth + 9;
    const rectHeight = 15;
    const rectRadius = 2.5;
    ctx.moveTo(rectX + rectRadius, rectY);
    ctx.lineTo(rectX + rectWidth - rectRadius, rectY);
    ctx.quadraticCurveTo(
      rectX + rectWidth,
      rectY,
      rectX + rectWidth,
      rectY + rectRadius
    );
    ctx.lineTo(rectX + rectWidth, rectY + rectHeight - rectRadius);
    ctx.quadraticCurveTo(
      rectX + rectWidth,
      rectY + rectHeight,
      rectX + rectWidth - rectRadius,
      rectY + rectHeight
    );
    ctx.lineTo(rectX + rectRadius, rectY + rectHeight);
    ctx.quadraticCurveTo(
      rectX,
      rectY + rectHeight,
      rectX,
      rectY + rectHeight - rectRadius
    );
    ctx.lineTo(rectX, rectY + rectRadius);
    ctx.quadraticCurveTo(rectX, rectY, rectX + rectRadius, rectY);
    ctx.closePath();
  }

  /**
   * stop showing spreedsheets and hide bar
   * @return {void}
   */
  spreedSheetPreviewStop(): void {
    if (this.item.itemDetail.videoPreview && this._spreedSheetPath) {
      const imgElement = this.previewImage.nativeElement;
      this.barDiv.nativeElement.style.display = 'none';
      const imgURL = this._spreedSheetPath;
      imgElement.src = imgURL;
      this._isCachingPreview = false;
    }
  }

  /**
   * add holder image data to datatransfer
   * @return {void}
   */
  handleDragstart(e: any): void {
    if (this.isMissing || this.isLocked) {
      return;
    }
    this.videoStoped(1);
    this.spreedSheetPreviewStop();
    this.isHover = false;
    this.draged = true;
    let imageAddress =
      this._userManagerService.textanimatorUserFileDirection() +
      '/spreedsheets/DragThumb.png';
    document.addEventListener('mouseup', this.documentMouseUpHandler);
    this.createImageofItem().then(imgSrc => {
      if (imgSrc.includes('http://')) {
        fs.writeFileSync(
          imageAddress,
          new Buffer(
            this._dragImageThumb.replace(/^data:image\/\w+;base64,/, ''),
            'base64'
          )
        );
      } else if (imgSrc.includes('data:image')) {
        fs.writeFileSync(
          imageAddress,
          new Buffer(imgSrc.replace(/^data:image\/\w+;base64,/, ''), 'base64')
        );
      } else {
        imageAddress = imgSrc;
      }
      if (imageAddress === '') {
        imageAddress = `${
          this._jsxInjectorService.defualtPath
        }/dist/assets/default-drag-icon.png`;
      }
      if (!this.isPPro() && this.draged) {
        this._templateCoreService.showDDPanel(imageAddress);
      }
    });
    this._elementRef.nativeElement.getElementsByTagName(
      'mf-tooltip'
    )[0].style.display = 'none';
    if ('dataTransfer' in e) {
      e.dataTransfer.clearData();
    }
    let dragData = '';
    const separator = '\\';
    this._changeDetectorRef.detectChanges();
    if (this.sequence && fs.existsSync(this.path)) {
      this._holderName = `MF${this.title.split('.')[0]}-Sequence-${new Date()
        .getMilliseconds()
        .toString()
        .slice(-4)}.png`;
      /*tslint:disable-next-line:max-line-length*/
      dragData = `${this._userManagerService.textanimatorUserFileDirection()}/spreedsheets/${
        this._holderName
      }`;
      const tempImage = document.createElement('canvas');
      tempImage.width = this._sequenceDimensions[0];
      tempImage.height = this._sequenceDimensions[1];
      const base64 = tempImage.toDataURL();
      const data = base64.replace(/^data:image\/\w+;base64,/, '');
      const buf = new Buffer(data, 'base64');
      fs.writeFileSync(dragData, buf);
      if (this._templateCoreService.OSInformation.indexOf('Windows') >= 0) {
        dragData = dragData.replace(/\//g, separator);
      }
      if ('dataTransfer' in e) {
        e.dataTransfer.setData('com.adobe.cep.dnd.file.0', dragData);
        this._dragData = dragData;
      }
      return;
    }
    if (this.fileType === 'mogrt') {
      this._holderName = `MF${this.title.split('.')[0]}-${new Date()
        .getMilliseconds()
        .toString()
        .slice(-4)}.png`;
      dragData = `${this._userManagerService.textanimatorUserFileDirection()}/spreedsheets/${
        this._holderName
      }`;
      const tempImage = document.createElement('canvas');
      tempImage.width = this._mogrtDimensions[0];
      tempImage.height = this._mogrtDimensions[1];
      const base64 = tempImage.toDataURL();
      const data = base64.replace(/^data:image\/\w+;base64,/, '');
      const buf = new Buffer(data, 'base64');
      fs.writeFileSync(dragData, buf);
      if (this._templateCoreService.OSInformation.indexOf('Windows') >= 0) {
        dragData = dragData.replace(/\//g, separator);
      }
      if ('dataTransfer' in e) {
        e.dataTransfer.setData('com.adobe.cep.dnd.file.0', dragData);
        this._dragData = dragData;
      }
      return;
    } else {
      dragData = this.path;
    }

    if (this._templateCoreService.OSInformation.indexOf('Windows') >= 0) {
      dragData = dragData.replace(/\//g, separator);
    }
    if ('dataTransfer' in e) {
      e.dataTransfer.setData('com.adobe.cep.dnd.file.0', dragData);
    }
  }

  // imports an item in premiere
  addItem(): void {
    if (this._templateCoreService.hostId === 'PPRO') {
      if (this.fileType === 'mogrt') {
        const oReq = new XMLHttpRequest();
        oReq.open(
          'GET',
          'http://localhost:' +
            this._ipcHandlerService.ipcPort +
            '/fetchMogrtThumb?c=9&mogrtUrl=' +
            encodeURIComponent(this.path) +
            '&fetchData=1',
          true
        );

        oReq.onload = oEvent => {
          const dataToPass: any = {};
          const data = JSON.parse(oReq.responseText);
          dataToPass.controllers = data;
          dataToPass.holderClipName = this._holderName;
          this._templateCoreService.import(
            this.path,
            JSON.stringify(dataToPass),
            false
          );
        };
        oReq.send();
      } else {
        const asSequence = this.item.itemDetail.sequence ? true : false;
        // tslint:disable-next-line:max-line-length
        this._templateCoreService.import(
          this.path,
          JSON.stringify({ holderClipName: this._holderName }),
          asSequence
        );
      }
    } else {
      const asSequence = this.item.itemDetail.sequence ? true : false;
      this._templateCoreService.import(this.path, '', asSequence);
    }
  }

  /**
   * open pop up of info
   * @return {void}
   **/
  openPopUp(): void {
    this._templateCoreService.openPopUp({
      thumbnail: this.thumbnail,
      title: this.title,
      size: this.space,
      duration: this.duration,
      fonts: this.usedFonts,
      fileType: this.item.itemDetail.fileType
    });
  }

  /**
   * format byte to gb mb ...
   * @return {any} formated string from byte
   **/
  formatBytes(sizeInByte): any {
    if (sizeInByte === 0) {
      return '0 Bytes';
    }
    const oneKiloByte = 1024;
    const decimals = 2;
    const suffixs = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const KiloBytes = Math.floor(Math.log(sizeInByte) / Math.log(oneKiloByte));
    return (
      parseFloat(
        (sizeInByte / Math.pow(oneKiloByte, KiloBytes)).toFixed(decimals)
      ) +
      ' ' +
      suffixs[KiloBytes]
    );
  }

  get sortMode(): string {
    return this._templateCoreService.viewMode;
  }

  /**
   * opens item purchase link in user browser
   * @return {void}
   **/
  openItemLink(): void {
    this.buyClick.emit();
  }

  @HostListener('dblclick', ['$event'])
  doubleClicked($event): void {
    this.addItem();
  }

  /**
   * add right click for file and open file drop down
   **/
  @HostListener('contextmenu', ['$event'])
  rightClicked($event): void {
    if (!this.isLocked) {
      this._fileSelectorService.selectWithRightClick(this.index);
      const pageX = $event.pageX;
      const pageY = $event.pageY;
      this._templateCoreService.openFileDropDown(
        [pageX, pageY],
        this.itemExtension
      );
      this._templateCoreService.showFolderDropDown = false;
      this._templateCoreService.whichPackClicked = this.parentDiv.nativeElement;
    }
  }

  @HostListener('click', ['$event'])
  fileSelect($event: MouseEvent): void {
    if (!this.isLocked) {
      if ($event.shiftKey || ($event.ctrlKey && $event.shiftKey)) {
        this._fileSelectorService.selectWithShiftClick(this.index);
      } else if ($event.ctrlKey) {
        this._fileSelectorService.selectWithCtrlClick(this.index);
      } else {
        this._fileSelectorService.selectWithClick(this.index);
      }
    }
  }
  /**
   * hover on image of item show blue line that move with mouse cursor
   **/
  itemShowBar($event): void {
    const mouseX = $event.offsetX;
    this.barDiv.nativeElement.style.display = 'block';
    const itemWidth = this._responsiveService.templateItemWidth.getValue();
    this.barDiv.nativeElement.style.left = (mouseX / itemWidth) * 100 + '%';
  }

  /**
   * image sequence preview on hover mouse
   **/
  imageSequences($event): void {
    if (this.sequence && fs.existsSync(this.path)) {
      this.itemShowBar($event);
      const currentPosition = $event.layerX;
      const widthOfImage = $event.target.width;
      const step = Math.round(
        this.item.itemDetail.imagesPath.length / widthOfImage
      );
      const imgElement = this.previewImage.nativeElement;
      let arrayPointer = step * currentPosition;
      if (currentPosition < 1) {
        arrayPointer = 0;
      } else if (currentPosition > this.item.itemDetail.imagesPath.length) {
        arrayPointer = this.item.itemDetail.imagesPath.length - 1;
      }
      imgElement.src = this.item.itemDetail.imagesPath[arrayPointer];
    }
  }

  videoHovered(): void {
    this.videoHoveredTimeOut = setTimeout(() => {
      if (this._loadVideo && this.item.itemDetail.videoPreview) {
        Array.from(document.getElementsByClassName('videoPreviewSource')).map(
          videoEl => {
            videoEl.remove();
          }
        );
        const videoElement = document.createElement('video');
        videoElement.setAttribute('autoplay', '1');
        videoElement.setAttribute('loop', '1');
        videoElement.setAttribute('muted', '1');
        videoElement.style.width = '100%';
        videoElement.style.height = '100%';
        videoElement.style.border = 'none';
        videoElement.style.position = 'absolute';
        videoElement.style.top = '0';
        videoElement.style.zIndex = '1';
        videoElement.className = 'videoPreviewSource';
        videoElement.addEventListener('mouseout', this.videoStoped.bind(this));
        const source = document.createElement('source');
        const videoLivePreview = this.item.itemDetail.videoPreview.includes(
          'http'
        )
          ? this.item.itemDetail.videoPreview
          : `file://${this.item.itemDetail.videoPreview}`;
        source.setAttribute(
          'src',
          videoLivePreview
            .split('/')
            .map(pathPart =>
              pathPart.includes(':') ? pathPart : encodeURIComponent(pathPart)
            )
            .join('/')
        );

        videoElement.appendChild(source);

        videoElement.onloadedmetadata = () => {
          this.previewImage.nativeElement.parentNode.insertBefore(
            videoElement,
            this.previewImage.nativeElement.nextSibling
          );
          this._videoElement = videoElement;
          videoElement.style.display = 'block';
        };
      }
    }, 200);
  }

  videoStoped(fromImage = 0): void {
    if (this.sequence && fs.existsSync(this.path)) {
      this.changeImageSequenceToDefault();
      this.barDiv.nativeElement.style.display = 'none';
    }
    if (this._loadVideo) {
      if (fromImage === 1) {
        clearTimeout(this.videoHoveredTimeOut);
        return;
      }
      clearTimeout(this.videoHoveredTimeOut);
      if (this._videoElement) {
        this._videoElement.remove();
        Array.from(document.getElementsByClassName('videoPreviewSource')).map(
          videoElement => {
            videoElement.remove();
          }
        );
      }
    }
  }

  /**
   * Return item name without its extension , alos if the item is longer than 20 character it will add ... to it
   * @public
   * @return {string} - Item name without extension
   */
  getItemName(): string {
    const titleLimit = 20;
    let itemTitle = this.itemNameWithoutExtension;
    if (itemTitle.length > titleLimit) {
      itemTitle = itemTitle.substr(0, titleLimit) + '...';
    }
    return itemTitle;
  }

  /**
   * Return item extension , alos if the item is locked it will convert the mp4 extension string to mgort string
   * @public
   * @return {string} - Item extension without . character
   */
  getItemExtension(): string {
    let itemExtension = this.itemExtension.toLowerCase();
    if (this.isLocked && 'mp4' === itemExtension) {
      itemExtension = 'mogrt';
    }
    if (this.sequence === true) {
      itemExtension = 'sequence';
    }
    return itemExtension;
  }

  titleMouseEnter(): void {
    this.isHover = true;
    this._changeDetectorRef.detectChanges();
  }

  titleMouseLeave(): void {
    this.isHover = false;
    this._changeDetectorRef.detectChanges();
  }
  /**
   * detect to open missing file popup
   * @public
   * @return {void}
   */
  openMissFilePopUp(): void {
    this._fileDataService.missingList = [];
    this._fileDataService.missingList.push([
      this.item.itemPath,
      this.item.itemDetail.fileName,
      this.item
    ]);
    this._fileDataService.showMissingCheckbox = false;
    this.isMissingIconClicked.emit({ true: true });
    this._fileDataService.missingMessageText = 'This File in Is missing ! ';
  }
  /**
   * showing missing file tool tip
   * @public
   * @return {void}
   */
  showMissFileToolTip(): void {
    this.showMissTooltip = true;
    this.firstLoadMissing = false;
    this._changeDetectorRef.detectChanges();
  }
  /**
   * hide missing file tool tip
   * @public
   * @return {void}
   */
  hideMissFileToolTip(): void {
    this.showMissTooltip = false;
    this._changeDetectorRef.detectChanges();
  }
  /**
   * detect item is missing
   * @public
   * @return {void}
   */
  detectIsMissing(): void {
    if (!fs.existsSync(this.item.itemPath)) {
      this._renderer.addClass(this._elementRef.nativeElement, 'itemMissed');
      this.isMissing = true;
    } else {
      this._renderer.removeClass(this._elementRef.nativeElement, 'itemMissed');
      this.isMissing = false;
    }
  }

  /**
   * Check if we are in premiere to enable the drag and drop functionality
   * @public
   * @return {boolean} - true if we are in premiere otherwise return false;
   */
  isPPro(): boolean {
    if (this.hostName === 'Premiere Pro') {
      this.isDragable = false;
      return true;
    } else {
      return false;
    }
  }
}
