import { LogManagerService } from "./../../../core/services/log-manager/log-manager.service";
import { CepHostService } from "./../../../core/services/cep-host/cep-host.service";
import { JsxInjectorService } from "./../../../core/services/jsx-injector/jsx-injector.service";
import { UserManagerService } from "../../../core/services/user-manager/user-manager.service";
import { FileDataService } from "./../../../core/services/file-data/file-data.service";
import { Router } from "@angular/router";
import { ScrollStoreProvider } from "../../../shared/helper/reuse-strategy/scroll-reuse";
import {
  Component,
  OnInit,
  HostListener,
  NgZone,
  ViewChild,
  ElementRef,
  AfterViewInit,
  AfterContentInit
} from "@angular/core";
import { TemplateCoreService } from "../../services/template-core.service";
import { zooming } from "../../../shared/helpers/animations";
import { ResponsiveService } from "../../../core/services/responsive/responsive.service";
import { FileSelectorService } from "../../../core/services/file-selector/file-selector.service";
import { AppGlobals } from "../../../../global";

@Component({
  selector: "mf-template-list",
  templateUrl: "./template-list.component.html",
  styleUrls: ["./template-list.component.scss"],
  animations: [zooming]
})
export class TemplateListComponent
  implements OnInit, AfterViewInit, AfterContentInit {
  public zoomAnimation;
  // current pack that we are browsing
  public currentPack = "";
  // scroll reuse provider
  private _scrollStoreProvider: ScrollStoreProvider;
  private _loginValue = false;
  @ViewChild("itemsHolder") itemsHolder: ElementRef;
  @ViewChild("packDetail") packDetail;
  constructor(
    private _templateCoreService: TemplateCoreService,
    private _fileDataService: FileDataService,
    private _userManagerService: UserManagerService,
    private _router: Router,
    private _responsiveService: ResponsiveService,
    private _fileSelectorService: FileSelectorService,
    private _jsxInjectorService: JsxInjectorService,
    private _logManagerService: LogManagerService,
    private _appGlobals: AppGlobals,
    private _cepHostService: CepHostService
  ) {
    this._scrollStoreProvider = new ScrollStoreProvider({
      compContext: this,
      router: this._router,
      route: "/dashboard/template"
    });
  }

  ngOnInit(): void {
    document.body.style.backgroundColor = "#262626";
    this._loginValue = this._userManagerService.isLoggedin;
    this._responsiveService.templateListItemsResponsive();
    const layerLoadElement: any = document.getElementsByClassName(
      "loadLayer"
    )[0];
    layerLoadElement.style.display = "none";
  }

  //  'Some files are missing ! Select File to relocate'

  get missingMessageText(): string {
    return this._fileDataService.missingMessageText;
  }

  get templateItemMargin(): number {
    let itemMargin = this._responsiveService.templateItemMargin.getValue();
    itemMargin = itemMargin > 3 ? itemMargin : 3;
    return itemMargin;
  }

  get templateItemWidth(): number {
    return this._responsiveService.templateItemWidth.getValue();
  }

  get templateItemHeight(): number {
    return this._responsiveService.templateItemHeight.getValue();
  }

  get templateItemPreviewHeight(): number {
    return this._responsiveService.templateItemPreviewHeight.getValue();
  }

  get packsAndFiles(): any {
    if (this._fileDataService.packsAndFiles) {
      return this._fileDataService.packsAndFiles;
    } else {
      return { packs: [], files: [] };
    }
  }

  get fileDropDownPositionY(): Number {
    return this._templateCoreService.dropDownPositionY;
  }
  // check missing icon is clicked
  get isMissingIconClick(): any {
    return this._fileDataService.isMissingIconClick;
  }

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
      this._scrollStoreProvider.handleScroll("MainProject", ".items");
    });
    // }
    // });
  }
  /**
   * when init extension then if have miss file show missing message box
   * @return {void}
   **/
  ngAfterContentInit(): void {
    setTimeout(() => {
      const missingCheckBoxCLick = this._appGlobals.DBConnection.get(
        "userSetting.missingCheckBoxCLicked"
      ).value();
      if (missingCheckBoxCLick && this._fileDataService.haveMissFile) {
        this._fileDataService.isMissingIconClick = true;
        this._fileDataService.missingMessageText =
          "Some files are missing ! Select File to relocate";
      }
    }, 3000);
  }

  /**
   * browse a pack
   * @return {void}
   **/
  browsePack($event, { packID, packPath, packName, buyLink }): void {
    if (fs.existsSync(packPath) || "" === packPath) {
      this._templateCoreService.countIndexPack = 0;
      this.browsingPack = true;
      this._fileDataService.navigateToFolder({
        packID,
        packPath,
        packName,
        buyLink
      });
    }
  }

  buyClick(): void {
    this._logManagerService.track("Template Buy Click", {
      Source: "Template Item",
      "Pack Name": this._fileDataService.fileBrowserStack[0].packName,
      "Pack Link": this._fileDataService.globalBuyLink
    });
    this._jsxInjectorService.openUrlInBrowser(
      this._fileDataService.globalBuyLink,
      "locked-items"
    );
  }

  goBack() {
    this._templateCoreService.countIndexPack = 0;
    this.browsingPack = this._fileDataService.goOneStepBack();
  }

  goToPart(index) {
    this._templateCoreService.countIndexPack = 0;
    this.browsingPack = this._fileDataService.navigateToPart(index);
  }

  /**
   * if user clicked on back in pack detail
   * @return {void}
   **/
  backToPacks(): void {
    this._fileDataService.currentPackDetail = false;
    this.browsingPack = false;
    this._scrollStoreProvider.handleScroll(
      "MainProject",
      this.itemsHolder.nativeElement
    );
  }

  get browsingPack(): boolean {
    return this._templateCoreService.browsingPack;
  }

  set browsingPack(value: boolean) {
    this._templateCoreService.browsingPack = value;
  }

  /**
   * open info pop up for item
   * @return {void}
   **/
  openPopUp(details: any): void {
    this._templateCoreService.openPopUp(details);
  }

  get isPopUpOpen(): boolean {
    return this._templateCoreService.isPopUpOpen;
  }

  get popUpDetails(): any {
    return this._templateCoreService.popUpDetails;
  }

  get isLoggedin(): boolean {
    return this._userManagerService.isLoggedin;
  }

  get currentPage(): string {
    return this._userManagerService.currentPage;
  }
  get addedFolder(): boolean {
    return this._templateCoreService.addedFolder;
  }

  addFolder(): void {
    this.zoomAnimation = "zooming";
    this._templateCoreService.addedFolder = true;
  }

  get showFolderDropDown(): boolean {
    return this._templateCoreService.showFolderDropDown;
  }

  get folderDropDownContent(): any {
    return this._templateCoreService.folderDropDownContent.filter(
      menu => !menu.disabled
    );
  }

  get folderDropDownPosition(): any {
    return this._templateCoreService.folderDropDownPosition;
  }

  get showFileDropDown(): boolean {
    return this._templateCoreService.showFileDropDown.getValue();
  }

  get fileDropDownContent(): any {
    return this._templateCoreService.fileDropDownContent;
  }

  get fileDropDownPosition(): any {
    return this._templateCoreService.fileDropDownPosition;
  }
  // list of missing file and folder
  get missingFileAndFolderList(): any {
    return this._fileDataService.missingList;
  }

  get fileBrowserStack(): any {
    return this._fileDataService.fileBrowserStack;
  }

  /**
   * if user clicked on a item in folder drop down
   * @return {void}
   **/
  onClickFolderDropDown($event): void {
    const menuId = $event.menuId;
    switch (menuId) {
      case 1:
        this._fileDataService.setPackViewMode(
          this._templateCoreService.packRightClickedID,
          "multi"
        );
        break;
      case 2:
        this._templateCoreService.folderRenameSubject.next(
          this._templateCoreService.packRightClickedID
        );
        break;
      case 3:
        this._fileDataService.removePack(
          this._templateCoreService.packRightClickedID
        );
        break;
      case 4:
        this._fileDataService.setPackViewMode(
          this._templateCoreService.packRightClickedID,
          "single"
        );
        break;
      default:
        break;
    }
  }

  /**
   * if user clicked on a item in file drop down
   * @param {any} $event - contains information about clicked menu
   * @return {void}
   **/
  onClickFileDropDown($event: any): void {
    const menuId = $event.menuId;
    switch (menuId) {
      case 0:
        const {
          itemPath,
          itemDetail
        } = this._fileSelectorService.selectedItemsDetail[0].item;
        if ("aep" === itemDetail.fileType || "prproj" === itemDetail.fileType) {
          this._templateCoreService.openProject(itemPath);
        }
        break;
      case 1:
        this._fileDataService.moveMultipleItems(
          this._fileSelectorService.selectedItemsDetail,
          $event.subMenuID
        );
        this._fileSelectorService.clearAndUpdateSelectedItems();

        break;
      case 2:
        this._fileDataService.removeMultipleItems(
          this._fileSelectorService.selectedItemsDetail
        );
        this._fileSelectorService.clearAndUpdateSelectedItems();

        break;
      case 3:
        this._templateCoreService.whichPackClicked.dispatchEvent(
          new CustomEvent("addItem")
        );
        break;
      default:
        break;
    }
  }

  /**
   * if user clicked outside of dropdown in order to close it
   * @return {void}
   **/
  onFolderDropDownClosed(): void {
    this._templateCoreService.showFolderDropDown = false;
  }

  /**
   * if user clicked outside of drop-down in order to close file drop down
   * @return {void}
   **/
  onFileDropDownClosed(): void {
    this._templateCoreService.showFileDropDown.next(false);
  }
  /**
   * clicked in missing icon in root missing item
   * @return {void}
   **/
  missingIconClicked(): void {
    this._fileDataService.isMissingIconClick = true;
  }
}
