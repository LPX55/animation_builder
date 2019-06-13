import { AppGlobals } from './../../../global';
import { IpcHandlerService } from './../../core/services/ipc-handler/ipc-handler.service';
import { OsInfoService } from './../../core/services/operating-system/os-info.service';
import { Injectable } from '@angular/core';
import { JsxInjectorService } from '../../core/services/jsx-injector/jsx-injector.service';
import { Subject, BehaviorSubject } from 'rxjs';
import { CepHostService } from '../../core/services/cep-host/cep-host.service';
import { FileDataService } from '../../core/services/file-data/file-data.service';
import { FileDropDownContent } from '../../core/interfaces/file-dropdown/file-dropdown';

@Injectable()
export class TemplateCoreService {
  private _ddMouseLocator;
  public isPopUpOpen = false;
  public popUpDetails: any;
  public viewMode = 'box';
  // is folder right click drop down open or not
  public showFolderDropDown = false;
  // drop down position y
  public dropDownPositionY: Number = 0;

  public whichPackClicked;
  // content of folder right click drop down
  public folderDropDownContent = [
    {
      id: 1,
      thumbnail: './assets/modern-view-icon.svg',
      title: 'Modern View',
      disabled: false
    },
    {
      id: 2,
      thumbnail: './assets/rename-icon.svg',
      title: 'Rename',
      disabled: false
    },
    {
      id: 3,
      thumbnail: './assets/remove-icon.svg',
      title: 'Remove',
      disabled: false
    }
  ];

  // current right clicked pack path
  public packRightClickedID = '';
  // current position of folder drop down
  public folderDropDownPosition = [0, 0];
  // is file right click drop down open or not
  public showFileDropDown = new BehaviorSubject(false);

  // variable for check footer drop down is open or not
  public showUploadDropDown = false;

  // content of file right click drop down
  public fileDropDownContent: FileDropDownContent[] = [
    {
      id: 1,
      thumbnail: './assets/move-to.svg',
      title: 'Move to',
      subMenu: []
    },
    {
      id: 2,
      thumbnail: './assets/remove-icon.svg',
      title: 'Remove'
    },
    {
      id: 3,
      thumbnail: './assets/add-to-project.svg',
      title: 'Add to project'
    }
  ];
  // current position of file drop down
  public fileDropDownPosition = [0, 0];
  // rename of a pack subject
  public folderRenameSubject: Subject<string> = new Subject<string>();
  // variable for checking new folder added or no
  public addedFolder = false;
  // is a pack browsed or not
  public browsingPack = false;
  // current right clicked pack path
  public fileRightClickedDetails: any;
  // index of items in root folder
  public countIndexRoot = 0;
  // index of items in pack folders
  public countIndexPack = 0;
  // cached images list
  public cachedItems = [];
  // ddHelper Path file
  private _ddHelperPath = '';
  // is dd panel shown or not
  private _isDDPanelShown = false;

  constructor(
    private _fileDataService: FileDataService,
    private cepHostService: CepHostService,
    private _osInfoService: OsInfoService,
    private _jsxInjectorService: JsxInjectorService,
    private _ipcHandlerService: IpcHandlerService,
    private _appGlobals: AppGlobals
  ) {
    this._ipcHandlerService.connectSubject.subscribe(connected => {
      if (connected) {
        this._ddHelperPath = this._osInfoService.getDDHelperZipPath();
      }
    });
  }

  /**
   * imports a mogrt in premiere
   * @param path the path of mogrt file
   * @param data mogrt setting data
   * @example import('C://type-builder//datas//Glitch Title 01.mogrt','some data...')
   *
   * @return {void}
   */
  import(path: string, data: string, asSequence: boolean): void {
    this.cepHostService.import(path, data, asSequence);
  }

  /**
   * Open AEP file or premiere file in destination host
   * @param filePath Project path
   * @return {void}
   */
  openProject(filePath: string): void {
    this.cepHostService.openProject(filePath);
  }

  get defaultPath(): string {
    return this._jsxInjectorService.defualtPath;
  }

  get OSInformation(): string {
    return this._jsxInjectorService.OSInformation;
  }

  openPopUp(details): void {
    this.isPopUpOpen = true;
    this.popUpDetails = details;
  }
  closePopUp(): void {
    this.isPopUpOpen = false;
  }

  changeViewMode(mode: string): void {
    if (this.viewMode !== mode) {
      this.viewMode = mode;
    }
  }

  /**
   * if user right clicked on a folder, we open a drop down
   * @return {void}
   **/
  openFolderDropDown(id: string, position: any, currentViewMode: string): void {
    this.showUploadDropDown = false;
    const folderDropDownWidth = 197;
    const folderDropDownHeight = 132;
    if (currentViewMode !== 'single') {
      this.folderDropDownContent[0].id = 4;
      this.folderDropDownContent[0].title = 'Classic View';
    } else {
      this.folderDropDownContent[0].id = 1;
      this.folderDropDownContent[0].title = 'Modern View';
    }
    if (this._fileDataService.fileBrowserStack.length) {
      this.folderDropDownContent = this.folderDropDownContent.map(
        (menu, index) => {
          !index ? (menu.disabled = false) : (menu.disabled = true);
          return menu;
        }
      );
    } else {
      this.folderDropDownContent = this.folderDropDownContent.map(menu => {
        menu.disabled = false;
        return menu;
      });
    }
    this.showFolderDropDown = true;
    this.packRightClickedID = id;
    if (position[0] + folderDropDownWidth > window.innerWidth) {
      position[0] -= folderDropDownWidth;
    }
    if (position[1] + folderDropDownHeight > window.innerHeight) {
      position[1] -= folderDropDownHeight;
    }
    this.folderDropDownPosition = position;
  }

  /**
   * if user right clicked on a file, we open a drop down
   * @param {any} position - array containing position of right click
   * @param {string} extension - File extension
   * @return {void}
   **/
  openFileDropDown(position: any, extension): void {
    setTimeout(() => {
      this.showFileDropDown.next(false);
      this.showUploadDropDown = false;
    });

    // @TODO: refine this code and don't use setTimeout

    setTimeout(() => {
      this.addPacksToFileDropDown();
      this.modifyItemInDropDown(extension);
      const fileDropDownWidth = 197;
      const fileDropDownHeight = 132;
      this.showFileDropDown.next(true);
      if (position[0] + fileDropDownWidth > window.innerWidth) {
        position[0] -= fileDropDownWidth;
      }
      if (position[1] + fileDropDownHeight > window.innerHeight) {
        position[1] -= fileDropDownHeight;
      }
      this.dropDownPositionY = position[1];
      this.fileDropDownPosition = position;
    });
  }

  /**
   * Modify drop down items before render it in ui
   * @param {string} extension - File extension
   * @return {void}
   **/
  modifyItemInDropDown(extension): void {
    if ('AEFT' !== this.cepHostService.hostId) {
      this.fileDropDownContent = this.fileDropDownContent.filter(
        item => item.id !== 3
      );
    }
    if (0 === this.fileDropDownContent[0].id) {
      this.fileDropDownContent.shift();
    }
    if (
      'aep' === extension &&
      'AEFT' === this.cepHostService.hostId &&
      0 !== this.fileDropDownContent[0].id
    ) {
      this.fileDropDownContent.unshift({
        id: 0,
        thumbnail: './assets/open-project.svg',
        title: 'Open'
      });
    } else if (
      'prproj' === extension &&
      'PPRO' === this.cepHostService.hostId
    ) {
      this.fileDropDownContent.unshift({
        id: 0,
        thumbnail: './assets/open-project.svg',
        title: 'Open'
      });
    }
  }

  /**
   * adds pack data to file drop down sub menu
   * @return {void}
   */
  addPacksToFileDropDown(): void {
    this.fileDropDownContent[0].subMenu = [];
    if (this._fileDataService.fileBrowserStack.length) {
      this.fileDropDownContent[0].subMenu.push({
        id: '',
        thumbnail: './assets/move-to.svg',
        title: 'Root Folder'
      });
    }
    const packs = this._appGlobals.userDBConnection
      .get('packsAndFiles.packs')
      .value();
    const fileBrowserStack = this._fileDataService.fileBrowserStack;
    const browsingPackID = fileBrowserStack.length
      ? fileBrowserStack[fileBrowserStack.length - 1].id
      : '';
    packs.forEach(pack => {
      if (browsingPackID !== pack.id) {
        if (fs.existsSync(pack.packPath) || pack.packPath === '') {
          this.fileDropDownContent[0].subMenu.push({
            id: pack.id,
            thumbnail: './assets/move-to.svg',
            title: pack.packName
          });
        }
      }
    });
  }

  /**
   * return current host id
   * @return {string}
   */
  get hostId(): string {
    return this.cepHostService.hostId;
  }

  /**
   * show drag and drop panel
   * @param {string} thumbnailURL - thumbnail path of panel
   * @return {void}
   */
  showDDPanel(thumbnailURL: string): void {
    if (!this._isDDPanelShown) {
      this._jsxInjectorService.evalScript(
        `$._MFDD.showDDPanel('${thumbnailURL}')`
      );
    }
    this._ddMouseLocator = child.spawn(this._ddHelperPath);
    this._ddMouseLocator.stdio[1].on('data', data => {
      if (data.includes('end')) {
        this.hideDDPanel();
        return;
      }
      const xPos = parseInt(data.toString().split(',')[0], 10);
      const yPos = parseInt(data.toString().split(',')[1], 10);
      this._jsxInjectorService.evalScript(
        `$._MFDD.moveDDPanel(${xPos},${yPos})`
      );
    });
  }

  /**
   * hide dd panel after drag end
   * @return {void}
   */
  hideDDPanel(): void {
    this._isDDPanelShown = false;
    this._jsxInjectorService.evalScript('$._MFDD.hideDDPanel()');
    if (this._ddMouseLocator) {
      this._ddMouseLocator.kill();
    }
  }
}
