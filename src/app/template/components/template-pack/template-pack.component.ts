import { ResponsiveService } from "../../../core/services/responsive/responsive.service";
import { DomSanitizer, SafeStyle } from "@angular/platform-browser";
import { FileDataService } from "../../../core/services/file-data/file-data.service";
import { TemplateCoreService } from "../../services/template-core.service";
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  HostListener,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  HostBinding,
  Renderer2,
  ChangeDetectorRef
} from "@angular/core";
import { OsInfoService } from "../../../core/services/operating-system/os-info.service";
import { IpcHandlerService } from "../../../core/services/ipc-handler/ipc-handler.service";
import { AppGlobals } from "../../../../global";
import { timingSafeEqual } from "crypto";

@Component({
  selector: "mf-template-pack",
  templateUrl: "./template-pack.component.html",
  styleUrls: ["./template-pack.component.scss"]
})
export class TemplatePackComponent implements OnInit, AfterViewChecked {
  public allSupportedExtensions = [
    "mogrt",
    "prproj",
    "avi",
    "mov",
    "mp4",
    "aep",
    "png",
    "jpg",
    "jpeg",
    "ffx"
  ];
  // thumbnail of pack
  public packThumbnail: any;
  // files count in pack
  public filesCount = "";
  // title of pack
  public packTitle = "";
  // single or multi view
  public viewMode = "";
  // pack detail we want to show
  @Input() pack: any;
  // variable for check is missing
  public isMissing = false;
  // link to buy item
  @Input() buyLink: string;
  // on click browse event fires
  @Output() browsePack: EventEmitter<any> = new EventEmitter<any>();
  // if pack mode is single or multi view
  public packMode = "";
  // is pack renaming
  public isRenaming = false;
  // temp title name for renaming
  public renamedPackTitle = "";
  // modern view images array
  public modernViewImages: SafeStyle[] = [];
  // is right click drop down shown
  public isContextMenuShown = false;
  // max title size
  private _maxTitleLength = 22;
  public showMissTooltip;
  // add class to host if have missing item
  @HostBinding("class.missing") packMissed = this.isMissing;
  // detect is missing icon clicked
  @Output() isMissingIconClicked: EventEmitter<any> = new EventEmitter();
  @ViewChild("renamingInput") renamingInput: ElementRef;
  @ViewChild("modernViewImage1") modernViewImage1: ElementRef;
  @ViewChild("modernViewImage2") modernViewImage2: ElementRef;
  @ViewChild("modernViewImage3") modernViewImage3: ElementRef;
  constructor(
    private _templateCoreService: TemplateCoreService,
    private _fileDataService: FileDataService,
    private _sanitizer: DomSanitizer,
    private _osInfo: OsInfoService,
    private _responsiveService: ResponsiveService,
    private _ipcHandlerService: IpcHandlerService,
    private _appGlobals: AppGlobals,
    private _renderer: Renderer2,
    private _elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.checkFolderExist();
    this.filesCount = this.pack.itemsCount;
    this.packTitle = this.pack.packName;
    if (this.packTitle.length > this._maxTitleLength) {
      this.packTitle =
        this.packTitle.substring(0, this._maxTitleLength) + "...";
    }
    this.packMode = this.pack.packViewMode;
    this.subscribeForRename();
    this._fileDataService.itemCount.subscribe(data => {
      if (data.packID === this.pack.id) {
        this.filesCount = (
          parseInt(this.filesCount, 10) - data.removedItemsCount
        ).toString();
        this.filesCount = (
          parseInt(this.filesCount, 10) + data.addedItemsCount
        ).toString();
        this.filesCount =
          parseInt(this.filesCount, 10) < 0 ? "0" : this.filesCount;
        if ("0" === this.filesCount) {
          this.pack.packViewMode = "single";
          this.packMode = "single";
        }
        this._appGlobals.userDBConnection
          .get("packsAndFiles.packs")
          .find({ id: this.pack.id })
          .assign({ itemsCount: this.filesCount })
          .write();
      }
    });
    if (this.pack.packPath !== "") {
      this.updateFilesCount();
    } else {
      this.showModernView([]);
    }
    if (this.filesCount === "" || this.filesCount === undefined) {
      this.filesCount = "?";
      if (this.pack.packPath !== "") {
      } else {
        this.updateGeneralPackCount(0);
      }
    } else {
      this.checkExistance();
    }
  }

  /**
   * check folder exist
   * @return {void}
   **/
  checkFolderExist(): void {
    if (!fs.existsSync(this.pack.packPath) && "" !== this.pack.packPath) {
      this.isMissing = true;
      this.packMissed = true;
      this._fileDataService.haveMissFile = true;
      this._fileDataService.missingList.push([
        this.pack.packPath,
        this.pack.packName,
        this.pack
      ]);
    }
  }

  /**
   * check and update filecount indeed
   * @return {void}
   **/
  updateFilesCount(): void {
    this._ipcHandlerService
      .emitEvent("fileCount", {
        path: this.pack.packPath,
        allSupportedExtensions: this._fileDataService.allSupportedExtensions,
        allowedExtensions: this._fileDataService.allSupportedExtensions
      })
      .subscribe(data => {
        if (data.success && data.path === this.pack.packPath) {
          this.updateGeneralPackCount(data.result.fileCount);
          if (
            data.result.haveCover &&
            (this.pack.packViewMode === "single" ||
              this.pack.packViewMode === "cover")
          ) {
            setTimeout(() => {
              this.pack.packViewMode = "single";
              this.packMode = "single";
              this.packThumbnail = data.result.haveCover;
            });
            return;
          }

          const modernViewImages = data.result.firstThree;
          this.setModernViewImage(
            this.modernViewImage1.nativeElement,
            "./assets/transparent.png"
          );
          this.setModernViewImage(
            this.modernViewImage2.nativeElement,
            "./assets/transparent.png"
          );
          this.setModernViewImage(
            this.modernViewImage3.nativeElement,
            "./assets/transparent.png"
          );
          this.showModernView(modernViewImages);
        } else if (!data.success) {
          this._fileDataService.removePack(this.pack.packPath);
        }
      });
  }

  showModernView(modernViewImages): void {
    if (this.pack.packViewMode === "single") {
      this.packMode = "single";
      return;
    }
    const packIDCheck = !this._fileDataService.fileBrowserStack.length
      ? this.pack.id
      : this._fileDataService.fileBrowserStack[0].packID;
    const removedItems = this._fileDataService.fetchRemovedItems(packIDCheck);
    let addeditems = [];
    if (!this._fileDataService.fileBrowserStack.length)
      addeditems = this._fileDataService.fetchAddedItems(packIDCheck);
    if (modernViewImages.length < 3) {
      modernViewImages = modernViewImages
        .concat(
          addeditems.map(item =>
            item.itemDetail.videoPreview
              ? item.itemDetail.videoPreview
              : item.itemPath
          )
        )
        .filter(itemPath => !removedItems.includes(itemPath));
    }
    modernViewImages = modernViewImages.slice(0, 4);
    modernViewImages = modernViewImages.filter(
      (item, index, self) => self.indexOf(item) === index
    );
    if (modernViewImages.length > 0) {
      this._fileDataService
        .processModernViewImages(modernViewImages)
        .then(covers => {
          if (covers.length > 0) {
            setTimeout(() => {
              this.adjustModernView(covers);
            });
          }
        });
    } else {
      this.packMode = "single";
      this.pack.packViewMode = "single";
    }
  }

  /**
   * update general
   * @return {void}
   **/
  updateGeneralPackCount(baseFileCount): void {
    const addedCount = this._fileDataService.fetchAddedItems(this.pack.id);
    if (addedCount) {
      baseFileCount += addedCount.length;
    }
    const removedCount = this._fileDataService.fetchRemovedItems(this.pack.id);
    if (removedCount) {
      baseFileCount -= removedCount.length;
    }
    this.filesCount = baseFileCount;
  }

  checkExistance(): void {
    if (this.pack.packPath !== " ") {
      fs.stat(this.pack.packPath, (err, stat) => {
        if (!err) {
          if (stat.mtime > new Date(this.pack.lastFilesCountUpdate)) {
          }
        } else {
        }
      });
    }
  }

  /**
   * subscribe to rename subject
   * @return {void}
   **/
  subscribeForRename(): void {
    this._templateCoreService.folderRenameSubject.subscribe(id => {
      if (id === this.pack.id && this.isContextMenuShown) {
        this.renamedPackTitle = this.packTitle;
        this.isRenaming = true;
        // we have timeout because input is not on view and we can't focus instantly
        setTimeout(() => {
          this.renamingInput.nativeElement.focus();
          this.renamingInput.nativeElement.select();
          let textWidth = this.calculateTextWidth(this.packTitle) + 10;
          const hostElement: any = document.querySelector("mf-template-pack");
          if (textWidth > hostElement.offsetWidth - 15) {
            textWidth = hostElement.offsetWidth - 15;
          }
          this.renamingInput.nativeElement.style.width = textWidth + "px";
        });
      }
    });
  }

  /**
   * caculate given text width
   * @param {string} text - given text
   * @return {number} width of that text
   **/
  calculateTextWidth(text: string): number {
    const divTemp: HTMLElement = document.createElement("div");
    divTemp.innerText = text;
    divTemp.style.visibility = "none";
    divTemp.style.position = "absolute";
    divTemp.style.fontSize = "11px";
    document.body.appendChild(divTemp);
    const theWidth = divTemp.offsetWidth;
    divTemp.remove();
    return theWidth;
  }

  @HostListener("click", ["$event.target"]) onClick(btn): void {
    if (!this.isRenaming) {
      this.browsePack.emit({ pack: this.pack });
    }
  }

  @HostListener("contextmenu", ["$event"])
  rightClicked($event): void {
    if (!this.isRenaming) {
      this.isContextMenuShown = true;
      const pageX = $event.pageX;
      const pageY = $event.pageY;
      this._templateCoreService.openFolderDropDown(
        this.pack.id,
        [pageX, pageY],
        this.packMode
      );
      this._templateCoreService.showFileDropDown.next(false);
    }
  }

  /**
   * detect user enter on renaming input
   * @return {void}
   **/
  detectEnter($event): void {
    let textWidth = this.calculateTextWidth($event.target.value) + 10;
    const hostElement: any = document.querySelector("mf-template-pack");
    if (textWidth > hostElement.offsetWidth - 15) {
      textWidth = hostElement.offsetWidth - 15;
    }
    this.renamingInput.nativeElement.style.width = textWidth + "px";
    if ($event.keyCode === 13) {
      this.updateNameOfPack();
    }
  }

  /**
   * rename pack on renaming input blur or enter
   * @return {void}
   **/
  updateNameOfPack(): void {
    this.isRenaming = false;
    if (this.renamedPackTitle.trim() !== "") {
      this._fileDataService.renamePack(
        this.pack.id,
        this.renamedPackTitle.trim()
      );
      this.packTitle = this.renamedPackTitle.trim();
      if (this.packTitle.length > this._maxTitleLength) {
        this.packTitle =
          this.packTitle.substring(0, this._maxTitleLength) + "...";
      }
    }
  }

  ngAfterViewChecked(): void {
    const delayForModernView = 100;
    if (
      (this.pack.packViewMode === "single" &&
        (this.packMode === "" || this.packMode === "multi")) ||
      (this.packMode === "single" &&
        (this.pack.packViewMode === "" || this.pack.packViewMode === "multi"))
    ) {
      this.packMode = "updating";
      // we had timeout because if we adjust modern view instantly, the width of images is 0
      setTimeout(() => {
        if (this.pack.packPath !== "") {
          this.updateFilesCount();
        } else {
          this.showModernView([]);
        }
      }, delayForModernView);
    }
    if (!this._templateCoreService.showFolderDropDown) {
      this.isContextMenuShown = false;
    }
  }

  /**
   * create modern view for current pack
   * @return {void}
   **/
  adjustModernView(covers = []): void {
    if (covers.constructor === Array) {
      const imagesElements = [
        this.modernViewImage1,
        this.modernViewImage2,
        this.modernViewImage3
      ];

      covers.map((cover, index) => {
        if (index > 2) {
          return;
        }
        const imgElement = imagesElements[index].nativeElement;
        this.setModernViewImage(imgElement, cover);
      });
      this.packMode = "multi";
      this.pack.packViewMode = "multi";
    }
  }

  /**
   * set one of three modern view image
   * @param {HTMLElement} imgElement - that image element that we want to set cover
   * @param {any} cover - the cover object that is being set to element
   * @param {number} index - index of element 0 to 2
   * @return {void}
   **/
  setModernViewImage(imgElement, cover): void {
    const imageURI = cover.thumbnail;
    imgElement.style.backgroundImage = `url("${imageURI}")`;
    imgElement.style.backgroundSize = "auto 100%";
    imgElement.style.backgroundPosition = "50% 0";
  }
  /**
   * open folder missing list message box
   * @return {void}
   **/
  openFolderMissingList(): void {
    this._fileDataService.missingList = [];
    this._fileDataService.missingList.push([
      this.pack.packPath,
      this.pack.packName,
      this.pack
    ]);
    this._fileDataService.showMissingCheckbox = false;
    this.isMissingIconClicked.emit({ true: true });
    this._fileDataService.missingMessageText = "This Folder Is missing ! ";
  }
  /**
   * detect pack is missing
   * @return {void}
   **/
  detectIsMissing(): void {
    if (!fs.existsSync(this.pack.packPath) && this.pack.packPath !== "") {
      this._renderer.addClass(this._elementRef.nativeElement, "missing");
      this.isMissing = true;
    } else {
      this._renderer.removeClass(this._elementRef.nativeElement, "missing");
      this.isMissing = false;
    }
  }
  /**
   * when hover in icon show missing tooltip
   * @return {void}
   **/
  showMissFolderToolTip(): void {
    this.showMissTooltip = true;
    this._changeDetectorRef.detectChanges();
  }
  /**
   * when move out in icon hide missing tooltip
   * @return {void}
   **/
  hideMissFolderToolTip(): void {
    this.showMissTooltip = false;
    this._changeDetectorRef.detectChanges();
  }
}
