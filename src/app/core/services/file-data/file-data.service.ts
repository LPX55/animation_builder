import { JsxInjectorService } from "./../jsx-injector/jsx-injector.service";
import { AppGlobals } from "./../../../../global";
import { Injectable, NgZone } from "@angular/core";
import { Subject } from "rxjs";
import { VideoProcessorService } from "../video-processor/video-processor.service";
import { NewPack } from "./../../interfaces/new-pack/new-pack";
import { IpcHandlerService } from "../ipc-handler/ipc-handler.service";
import { UserManagerService } from "../user-manager/user-manager.service";
import { CepHostService } from "../cep-host/cep-host.service";
import Aftereffects from "../../environments/aftereffects";
import { uniqBy } from "lodash";
// @TODO remove lag and memory leak
@Injectable()
export class FileDataService {
  // this subject is used for lazy loading of items. categories will be passed to it.
  public categorySubject: Subject<any> = new Subject<any>();
  // this subject is used for watching files. when a file is changed the next value will be assigned to it
  public watchSubject: Subject<any> = new Subject<any>();
  // current pack path that is browsed
  public currentPackDetail: any = false;
  // categories loaded so far
  public categoriesLoaded = 0;
  // categories are stored in this variable
  public packDetails = {
    categories: [],
    allItems: []
  };
  // text of missing box
  public missingMessageText: string;
  // list of missing file
  public missingList = [];
  // check have miss file
  public haveMissFile = false;
  // missing icon click
  public isMissingIconClick = false;
  // show chechk box in missing file
  public showMissingCheckbox = true;
  // current parsed json file is stored in this variable
  public currentPacksAndFiles: Subject<any> = new Subject<any>();
  // private packs and files
  public packsAndFiles = { packs: [], files: [] };
  public fileBrowserStack = [];
  public currentBasePackID = "";
  // allowed extensions to read in motion factory
  public allowedExtensions: string[];
  // current watcher for a pack stored in this variable and destroyed after going back to packs
  public currentWatcher: any;
  // string to be show for displaying all categories
  public categoryAllName = "Uncategorized";
  // installed fonts in user system
  public userFonts = [];
  // is packs and files refreshed in view
  public packsAndFilesRefreshed = false;
  // delay between reading every item in ms
  private _delayReadingItems = 30;
  // variable used for calculating item count after moving or deleting items
  public itemCount = new Subject<any>();
  // premium pack name
  public premiumPackName = "premium-pack";
  // complete queue stack
  public thumbnailQueue = [];
  public globalBuyLink = "";
  // is queue running
  public isThumbnailQueueRunning = false;
  // subject of queue for items in pack
  public thumbnailSubject = new Subject<string>();
  // root complete queue stack
  public rootThumbnailQueue = [];
  // is queue running for root items
  public isRootThumbnailQueueRunning = false;
  // subject of queue for items in root
  public rootThumbnailQueueSubject = new Subject<string>();
  // all support formats
  public allSupportedExtensions: any;
  private filesReadTimeouts = [];
  private _showDefaultFiles = false;
  constructor(
    private _videoProcessorService: VideoProcessorService,
    private _appGlobals: AppGlobals,
    private _ipcHandlerService: IpcHandlerService,
    private _userManagerService: UserManagerService,
    private _cepHostService: CepHostService,
    private _jsxInjectorService: JsxInjectorService,
    private _ngZone: NgZone
  ) {
    this.allowedExtensions = this._cepHostService.allowedExtensions;
    this.allSupportedExtensions = this._appGlobals.globalFormats;
    this._showDefaultFiles =
      this._cepHostService.host.hostName === "Premiere Pro" ||
      this._cepHostService.host.hostName === "After Effects";
    // check user is log in then read pack and file
    this._userManagerService.loginSubject.subscribe(isLoggedin => {
      if (true === isLoggedin) {
        this.startFetchingPacksAndFiles();
      }
    });

    fontList
      .getFonts()
      .then(fonts => {
        this.userFonts = fonts;
      })
      .catch(err => {
        // console.log(err);
      });

    this.watchForExternalEvents();
  }

  /**
   * when app loades read all packs and data in database
   * @return {void}
   */
  startFetchingPacksAndFiles(): void {
    this.rootThumbnailQueue = [];
    this.isRootThumbnailQueueRunning = false;
    this.thumbnailQueue = [];
    this.isThumbnailQueueRunning = false;
    this.filesReadTimeouts.forEach(timeout => clearTimeout(timeout));
    if (0 === this.fileBrowserStack.length) {
      const packsAndFiles = this._appGlobals.userDBConnection
        .get("packsAndFiles")
        .value();
      this.processPacksAndFiles(packsAndFiles);
    } else {
      const { packPath } = this.fileBrowserStack[
        this.fileBrowserStack.length - 1
      ];
      if (packPath !== "") {
        this._ipcHandlerService
          .emitEvent("readPack", {
            path: packPath,
            maxItems: false,
            readRecursively: true,
            allowedExtensions: this.allSupportedExtensions,
            allSupportedExtensions: this.allSupportedExtensions
          })
          .subscribe(data => {
            this.processPackFetchedData(data);
          });
      } else {
        this.processPackFetchedData({
          packsAndFiles: { packs: [], files: [] }
        });
      }
    }
  }

  processPackFetchedData(data): void {
    const packPath = this.fileBrowserStack[this.fileBrowserStack.length - 1]
      .packPath;
    let packsAndFiles = { packs: [], files: [] };
    if ((data.success && data.path === packPath) || packPath === "") {
      packsAndFiles = data.packsAndFiles;
      const removedItems = this.fetchRemovedItems(
        this.fileBrowserStack[0].packID
      );
      const addedItems = this.fetchAddedItems(this.fileBrowserStack[0].packID);
      packsAndFiles.files = packsAndFiles.files
        .concat(addedItems)
        .filter((item, index, self) => {
          return !removedItems.includes(item.itemPath);
        });
      packsAndFiles.files = uniqBy(packsAndFiles.files, "itemPath");
      this.processPacksAndFiles(packsAndFiles);
    }
  }

  processPacksAndFiles(packsAndFiles): void {
    packsAndFiles.packs.sort((a, b) => {
      const textA = a.packName.toUpperCase();
      const textB = b.packName.toUpperCase();
      return textA < textB ? -1 : textA > textB ? 1 : 0;
    });
    this.packsAndFiles.packs = [];
    if (packsAndFiles.packs.length > 0) {
      this.readInitialPacks(packsAndFiles, 0);
    }
    this.packsAndFiles.files = [];
    if (packsAndFiles.files.length > 0) {
      this.readInitialFiles(packsAndFiles, 0);
    }
  }

  /**
   * process files that in json file
   * @param {any[]} packsAndFiles - json content
   * @param {number} fileIndex - index of file that currently we are processing
   * @return {void}
   */
  readInitialFiles(packsAndFiles: any, fileIndex: number): void {
    this.packsAndFiles.files.push(packsAndFiles.files[fileIndex]);
    fileIndex++;
    if (fileIndex < packsAndFiles.files.length) {
      this.filesReadTimeouts.push(
        setTimeout(() => {
          this.readInitialFiles(packsAndFiles, fileIndex);
        }, this._delayReadingItems)
      );
    }
  }

  /**
   * process packs initially
   * @param {any[]} packsAndFiles - object of packs and files from db
   * @param {number} folderIndex - index of folder that currently we are processing
   * @return {void}
   */
  readInitialPacks(packsAndFiles: any, folderIndex: number): void {
    const pack = packsAndFiles.packs[folderIndex];
    if (
      !pack.isDefaultFiles ||
      (pack.isDefaultFiles && this._showDefaultFiles)
    ) {
      this.packsAndFiles.packs.push(pack);
    }

    folderIndex++;
    if (folderIndex < packsAndFiles.packs.length) {
      this.readInitialPacks(packsAndFiles, folderIndex);
    }
  }

  /**
   * when user goes to a pack, it will watch for files changes and update the view
   * @return {void}
   */
  addWatcherForPack(): void {
    // @TODO: move this code to IPC
    this.currentWatcher = nodeWatch(
      this.currentPackDetail.packPath,
      { recursive: true },
      (event, name) => {
        name = name.replace(/\\/g, "/");
        const relativePath = name
          .replace(`${this.currentPackDetail.packPath}/`, "")
          .split("/");
        this.packFolderChanged(name, event, relativePath);
      }
    );
  }

  /**
   * it destroy created watch for a pack on going back to packs list
   * @return {void}
   */
  destroyWatcher(): void {
    if ("" !== this.currentPackDetail.packPath) {
      if (undefined !== this.currentWatcher) {
        this.currentWatcher.close();
      }
    }
  }

  /**
   * if a file changed in pack, watcher will call this function to process the changes and update the view
   * @param {string} path - path of changing folder or file
   * @param {string} event - if it's removed or changed
   * @param {string[]} relativePathToUpperFolder - the relative path to upper folder
   * @return {void}
   **/
  packFolderChanged(path, event, relativePathToUpperFolder): void {
    const categoryName = relativePathToUpperFolder[0];
    if (event === "remove") {
      this.onRemoveFileEvent(path, relativePathToUpperFolder, categoryName);
    } else {
      this.onChangeFileEvent(path, relativePathToUpperFolder, categoryName);
    }
  }

  /**
   * if a file removed in pack, watcher call this function
   * @param {string} path - path of changing folder or file
   * @param {string[]} relativePathToUpperFolder - the relative path to upper folder
   * @param {string} categoryName - category name of changed file or folder
   * @return {void}
   **/
  onRemoveFileEvent(path, relativePathToUpperFolder, categoryName): void {
    if (this.isPathDirectory(path)) {
      this.removeCategory(categoryName);
    } else {
      if (relativePathToUpperFolder.length === 1) {
        this.removeItem(this.categoryAllName, path);
      } else {
        this.removeItem(categoryName, path);
      }
    }
  }

  /**
   * remove a category on watch
   * @param {string} categoryName - name of category
   * @return {void}
   */
  removeCategory(categoryName): void {
    this.packsAndFiles.packs = this.packsAndFiles.packs.filter(
      pack => pack.packName !== categoryName
    );
  }

  /**
   * remove a item on watch
   * @param {string} categoryName - category of item
   * @param {string} path - path of item
   * @return {void}
   */
  removeItem(categoryName, itemPath): void {
    this.packsAndFiles.files = this.packsAndFiles.files.filter(
      item => item.itemPath !== itemPath
    );
  }

  /**
   * if file created or renamed, watcher call this function
   * @param {string} path - path of changing folder or file
   * @param {string[]} relativePathToUpperFolder - the relative path to upper folder
   * @param {string} categoryName - category name of changed file or folder
   * @return {void}
   */
  onChangeFileEvent(path, relativePathToUpperFolder, categoryName): void {
    if (this.isPathDirectory(path)) {
      if (relativePathToUpperFolder.length === 1) {
        this.addCategory(categoryName, path);
      }
    } else {
      if (relativePathToUpperFolder.length === 1) {
        this.addItem(this.categoryAllName, path);
      } else {
        this.addItem(categoryName, path);
      }
    }
  }

  /**
   * add a category in watch
   * @param {string} categoryName - name of category
   * @param {string} path - path of category
   * @return {void}
   */
  addCategory(categoryName, path): void {
    this.packsAndFiles.packs.push({
      lastFilesCountUpdate: 0,
      packName: categoryName,
      packPath: path,
      packViewMode: "",
      packCover: ""
    });
  }

  /**
   * add a item in watch
   * @param {string} categoryName - category of item
   * @param {string} path - path of item
   * @return {void}
   */
  addItem(categoryName, path): void {
    this._ipcHandlerService
      .emitEvent("processFile", {
        filePath: path,
        allowedExtensions: this.allSupportedExtensions
      })
      .subscribe(data => {
        if (data.success && data.result.filePath === path) {
          this.packsAndFiles.files.push({
            itemPath: data.result.filePath,
            itemDetail: data.result.itemInfo
          });
        }
      });
  }

  /**
   * checks if a given path is a directory
   * @param {string} path - path of folder
   * @return {boolean} boolean if directory true
   **/
  isPathDirectory(path): boolean {
    return path.split(".").length === 1;
  }

  /**
   * Read a pack and sends its categories and items to a subject next call
   * @return {void}
   */
  getPackDetails(initial: boolean): any {
    const packPath = this.currentPackDetail.packPath;
    if (initial) {
      this.packDetails.categories = [this.categoryAllName];
      this.packDetails.allItems = [];
      this.categoriesLoaded = 0;
      this._ipcHandlerService
        .emitEvent("readPack", {
          path: packPath,
          maxItems: false,
          readRecursively: true,
          allowedExtensions: this.allSupportedExtensions
        })
        .subscribe(data => {
          if (data.path === packPath) {
            this.categorySubject.next(data);
          }
        });
    }
  }

  /**
   * detemine file type of a item from file path
   * @param {string} itemPath - item path
   * @return {string} file type
   **/
  fetchFileType(itemPath): string {
    let fileType = "";
    const fileExtension = path
      .extname(itemPath)
      .substr(1)
      .toLowerCase();
    Object.keys(this.allSupportedExtensions).map(key => {
      if (this.allSupportedExtensions[key].includes(fileExtension)) {
        if (key === "video" || key === "image") {
          fileType = key;
        } else {
          fileType = fileExtension;
        }
      }
    });
    return fileType;
  }

  /**
   * import files and update json file
   * @param {object} files - selected files object
   * @param {boolean} mode - check is sequence
   * @return {object}
   **/
  uploadFiles(files: any[], mode): Promise<any> {
    return new Promise((resolve, reject) => {
      const theFiles: any = Array.from(files);
      this.processUploadedFiles(theFiles, 0, mode, [], resolve);
    });
  }

  /**
   * read all file in folder
   * @param {string} dirname - file path
   * @return {Array} array of all images in sequence folder
   **/
  readSequenceFiles(dirname): any {
    const allFilePath = [];
    const files = fs.readdirSync(dirname);
    files.forEach(function(file): any {
      allFilePath.push(dirname + "/" + file);
    });
    return allFilePath;
  }

  /**
   * read file path and create array of all images in images sequence file
   * @param {string} filePath - file path
   * @return {array} array of all images in sequence folder
   **/
  readImagesSequence(filePath): any {
    let allImagesInFile = [];
    allImagesInFile = this.readSequenceFiles(path.dirname(filePath));
    return this.createArrayOfImagesSequence(allImagesInFile, filePath);
  }

  /**
   * create array of images with same name in image sequence folder
   * @param {string} filePath - file path
   * @param {array} allImagesInFile - of all images in sequence folder
   * @return {array} array of images that have same name in folder
   **/
  createArrayOfImagesSequence(allImagesInFile, filePath): any {
    const nameOfSequenceRegex = /(.*?)(\d+\b)/g;
    const nameOfSequence = nameOfSequenceRegex.exec(path.basename(filePath));
    const startIndex = allImagesInFile.indexOf(filePath);
    const result = allImagesInFile.filter(file => {
      return -1 !== file.indexOf(nameOfSequence[1]);
    });

    if (this._cepHostService.hostId === Aftereffects.hostId) {
      return result;
    } else {
      return result.slice(startIndex, allImagesInFile.length);
    }
  }

  /**
   * process files that uploaded
   * @param {any[]} theFiles - uploaded files array
   * @param {number} itemsRead - items that we read so far
   *  @param {boolean} mode - check is sequence
   * @return {object}
   */
  processUploadedFiles(
    theFiles: any[],
    itemsRead: number,
    mode,
    filesArray: any[],
    resolve
  ): void {
    const filePath = theFiles[itemsRead].path.replace(/\\/g, "/");
    if (
      0 !==
      this.packsAndFiles.files.filter(fFile => fFile.itemPath === filePath)
        .length
    ) {
      if (theFiles.length !== itemsRead) {
        itemsRead++;
        this.processUploadedFiles(
          theFiles,
          itemsRead,
          mode,
          filesArray,
          resolve
        );
      } else {
        this._jsxInjectorService.dispatchVulcanMessage("root.refresh", {
          currentRoute: this.fileBrowserStack,
          packAndFile: this.packsAndFiles,
          shouldRefresh: [""]
        });
        resolve(filesArray);
      }
    }
    let itemDetailInDatabase = {};
    this.isRootThumbnailQueueRunning = false;
    let allImagesInFile = [];
    if (true === mode) {
      allImagesInFile = this.readImagesSequence(filePath);
    }

    this._ipcHandlerService
      .emitEvent("processFile", {
        filePath,
        allowedExtensions: this.allSupportedExtensions
      })
      .subscribe(data => {
        itemsRead++;

        if (data.success) {
          itemDetailInDatabase = {
            itemPath: filePath,
            itemDetail: {
              fileName: filePath.split("/").pop(),
              size: data.fileSize,
              thumb: "./assets/transparent.png",
              fileType: this.fetchFileType(filePath),
              locked: false,
              videoPreview: data.videoPreview,
              sequence: mode,
              imagesPath: allImagesInFile
            }
          };
          this._appGlobals.userDBConnection
            .get("packsAndFiles.files")
            .insert(itemDetailInDatabase)
            .write();
          this.packsAndFiles.files = this._appGlobals.userDBConnection
            .get("packsAndFiles")
            .value().files;
          filesArray.push(itemDetailInDatabase);
        }
        if (theFiles.length !== itemsRead) {
          setTimeout(() => {
            this.processUploadedFiles(
              theFiles,
              itemsRead,
              mode,
              filesArray,
              resolve
            );
          }, this._delayReadingItems);
        } else {
          this._jsxInjectorService.dispatchVulcanMessage("root.refresh", {
            currentRoute: this.fileBrowserStack,
            packAndFile: this.packsAndFiles,
            shouldRefresh: [""]
          });
          resolve(filesArray);
        }
      });
  }

  /**
   * run queue for items in a pack
   * @return {void} file type
   **/
  runCompleteQueue(): void {
    if (this.thumbnailQueue.length) {
      this.isThumbnailQueueRunning = true;
      const itemPath = this.thumbnailQueue[0];
      this.thumbnailQueue.shift();
      this.thumbnailSubject.next(itemPath[0]);
    } else {
      this.isThumbnailQueueRunning = false;
    }
  }

  /**
   * run queue for items in root
   * @return {void}
   **/
  runRootCompleteQueue(): void {
    if (this.rootThumbnailQueue.length) {
      this.isRootThumbnailQueueRunning = true;
      const itemPath = this.rootThumbnailQueue[0];
      this.rootThumbnailQueue.shift();
      this.rootThumbnailQueueSubject.next(itemPath[0]);
    } else {
      this.isRootThumbnailQueueRunning = false;
    }
  }

  /**
   * import folder and update json file
   * @param {string} folderAddress - selected folder address
   * @return {void}
   **/
  uploadFolder(folderAddress): void {
    folderAddress = folderAddress.replace(/\\/g, "/").replace("unsafe:", "");
    if (
      this.packsAndFiles.packs.filter(pack => pack.packPath === folderAddress)
        .length
    ) {
      return;
    }
    const itemLinkPath = folderAddress + "/item-link.txt";
    let coverPath = "";
    let buyLink = "";
    const packName = folderAddress.split("/").pop();
    let packViewMode = "";
    if (fs.existsSync(folderAddress + "/cover.png")) {
      coverPath = "file://" + folderAddress + "/cover.png";
      packViewMode = "single";
    } else if (fs.existsSync(folderAddress + "/cover.jpg")) {
      coverPath = "file://" + folderAddress + "/cover.jpg";
      packViewMode = "single";
    } else {
      coverPath = "";
    }
    if (fs.existsSync(itemLinkPath)) {
      buyLink = fs.readFileSync(itemLinkPath, "utf8").toString();
    }
    this._appGlobals.userDBConnection
      .get("packsAndFiles.packs")
      .insert({
        packName: packName,
        buyLink: buyLink,
        packPath: folderAddress,
        packViewMode: packViewMode,
        packCover: coverPath.replace("unsafe:", ""),
        itemsCount: undefined,
        removedItems: [],
        addedItems: []
      })
      .write();
    this.updatePacksAndFiles();
  }

  /**
   * update packsAndFile and sorting pack
   * @return {void}
   **/
  updatePacksAndFiles(
    sendRefreshEvent = true,
    packAndFile = { packs: [], files: [] }
  ): void {
    if (
      !packAndFile.packs.length &&
      !packAndFile.files.length &&
      !this.fileBrowserStack.length
    ) {
      packAndFile = this._appGlobals.userDBConnection
        .get("packsAndFiles")
        .value();
    }
    this.packsAndFiles.packs = packAndFile.packs;
    if (this.packsAndFiles.files.length > packAndFile.files.length) {
      this.packsAndFiles.files.map(file => {
        if (!packAndFile.files.includes(file)) {
          this.packsAndFiles.files = this.packsAndFiles.files.filter(
            orgFile => orgFile.itemPath !== file.itemPath
          );
        }
      });
    }
    if (this.packsAndFiles.files.length < packAndFile.files.length) {
      packAndFile.files.map(file => {
        if (
          0 ===
          this.packsAndFiles.files.filter(
            fFile => fFile.itemPath === file.itemPath
          ).length
        ) {
          this.packsAndFiles.files.push(file);
        }
      });
    }

    this.sortingPackInAddFolder();
    if (sendRefreshEvent)
      this._jsxInjectorService.dispatchVulcanMessage("root.refresh", {
        currentRoute: this.fileBrowserStack,
        packAndFile: this.packsAndFiles,
        shouldRefresh: [
          this.fileBrowserStack.length
            ? this.fileBrowserStack[this.fileBrowserStack.length - 1].packID
            : ""
        ]
      });
  }

  /**
   * check if fonts are installed or not
   * @param {string[]} fonts - array of font name
   * @return {object} object of fonts details
   */
  isFontsInstalled(fonts): any {
    const fontsProcessed = [];
    fonts.map(font => {
      if (this.userFonts.includes(font)) {
        fontsProcessed.push({
          fontName: font,
          missing: false
        });
      } else {
        fontsProcessed.push({
          fontName: font,
          missing: true
        });
      }
      return font;
    });
    return fontsProcessed;
  }

  /**
   * check if mogrt item has gif besides it
   * @param {string} path - path of mogrt file
   * @return {string} path of preview file
   */
  itemHasGifPreview(path): string {
    if (fs.existsSync(path.replace(path.split(".").pop(), "gif"))) {
      return "file://" + path.replace("mogrt", "gif");
    }
    return "";
  }

  /**
   * set view mode of a pack
   * @param {string} packID - pack id
   * @param {string} viewMode - desired view mode
   * @return {promise}
   **/
  setPackViewMode(packID, viewMode): Promise<any> {
    return new Promise((resolve, reject) => {
      this.packsAndFiles.packs.map((pack, index) => {
        const packPath = pack.packPath;
        if (pack.id === packID) {
          if (viewMode === "multi") {
            this.updatePackViewMode(index, "", false);
          } else {
            let coverPath;
            if (fs.existsSync(packPath + "/cover.png")) {
              coverPath = "file://" + packPath + "/cover.png";
            } else if (fs.existsSync(packPath + "/cover.jpg")) {
              coverPath = "file://" + packPath + "/cover.jpg";
            } else {
              viewMode = "single";
            }
            this.updatePackViewMode(index, viewMode, coverPath);
            resolve();
          }
        }
      });
    });
  }

  /**
   * set view mode of a pack and update the view
   * @param {number} theIndex - index of pack in array of packs
   * @param {string} mode - mode of pack that user want to set ( multi , single )
   * @param {any} covers - array of covers to set in multi
   * @return {void}
   **/
  updatePackViewMode(theIndex: number, mode: string, covers: any): void {
    this.packsAndFiles.packs[theIndex].packViewMode = mode;
    this.packsAndFiles.packs[theIndex].packCover = covers;
    this._appGlobals.userDBConnection
      .update("packsAndFiles", this.packsAndFiles)
      .write();
    this._jsxInjectorService.dispatchVulcanMessage("root.refresh", {
      currentRoute: this.fileBrowserStack,
      packAndFile: this.packsAndFiles,
      shouldRefresh: [""]
    });
  }

  /**
   * get three first file cover of a pack
   * @param {string} packPath - pack path
   * @return {promise} if there is three enough files returns array of covers else false!
   **/
  getModernViewImages(packID, packPath): Promise<any> {
    return new Promise((resolve, reject) => {
      const removedItems = this.fetchRemovedItems(packID);
      const addeditems = this.fetchAddedItems(packID);

      if (packPath === "") {
        const items = addeditems.map(item => {
          return [item.itemPath, 0, 1];
        });
        this.processModernViewImages(items).then(covers => {
          resolve(covers);
        });
      } else {
        this._ipcHandlerService
          .emitEvent("readPack", {
            path: packPath,
            maxItems: 3,
            readRecursively: true,
            allowedExtensions: this.allSupportedExtensions
          })
          .subscribe(data => {
            data.items = data.items.filter(
              item => !removedItems.includes(item[0])
            );
            data.items = data.items.concat(
              addeditems.map(item => {
                return [item.itemPath];
              })
            );
            if (data.success) {
              this.processModernViewImages(data.items).then(covers => {
                resolve(covers);
              });
            }
          });
      }
    });
  }

  /**
   * detemine item thumbnail url
   * @param {string} type - type of thumbnail (video-mogrt-image)
   * @param {string} path - path of item
   * @return {string}
   */
  fetchItemThumbnailURL(type, path): string {
    const cacheTime = this._appGlobals.DBConnection.get("cacheTime").value();
    let itemThumbnailURL = "";
    if (type === "video") {
      itemThumbnailURL =
        "http://localhost:" +
        this._ipcHandlerService.ipcPort +
        "/fetchVideoFrame?c=" +
        cacheTime +
        "90&videoURL=" +
        encodeURIComponent(path);
    } else if (type === "mogrt") {
      itemThumbnailURL =
        "http://localhost:" +
        this._ipcHandlerService.ipcPort +
        "/fetchMogrtThumb?c=" +
        cacheTime +
        "90&mogrtUrl=" +
        encodeURIComponent(path);
    } else if (type === "image") {
      itemThumbnailURL =
        "http://localhost:" +
        this._ipcHandlerService.ipcPort +
        "/resizeImage?c=" +
        cacheTime +
        "90&imageURL=" +
        encodeURIComponent(path);
    }
    return itemThumbnailURL;
  }

  /**
   * process items in modern view and resolve array of covers for a pack modern view
   * @return {promise}
   **/
  processModernViewImages(allFiles: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      const covers = [];

      allFiles.map((file, index) => {
        const fileType = this.fetchFileType(file);
        let thumbnail = "";
        if (fileType === "mogrt") {
          thumbnail = this.fetchItemThumbnailURL("mogrt", file);
        } else if (fileType === "video") {
          thumbnail = this.fetchItemThumbnailURL("video", file);
        } else if (fileType === "image") {
          thumbnail = this.fetchItemThumbnailURL("image", file);
        }
        if (thumbnail !== "") {
          covers.push({
            fileType: fileType,
            thumbnail: thumbnail
          });
        }
        if (covers.length === 3 || index === allFiles.length - 1) {
          resolve(covers);
        }
      });
    });
  }

  /**
   * remove pack from view and db
   * @param {string} packID - pack id
   * @return {void}
   **/
  removePack(packID): void {
    const spreedSheets = this._appGlobals.userDBConnection
      .get("videoPreviews")
      .filter({ packID, loading: false })
      .value()
      .concat([]);
    if (spreedSheets) {
      const spreedFileNames = spreedSheets.map(spreedSheet => {
        return (
          this._userManagerService.motionFactoryUserFileDirection() +
          "/spreedsheets/" +
          spreedSheet.id +
          ".png"
        );
      });
      this.deleteFiles(spreedFileNames);
    }
    this._appGlobals.userDBConnection
      .get("videoPreviews")
      .remove({ packID })
      .write();
    this._videoProcessorService.readQueue();
    this._appGlobals.userDBConnection
      .get("packsAndFiles.packs")
      .remove({ id: packID })
      .write();
    this._appGlobals.userDBConnection
      .get("packsCache")
      .remove({ packID })
      .write();
    this.packsAndFiles.packs = this.packsAndFiles.packs.filter(pack => {
      if (pack.id === packID) {
        return false;
      }
      return true;
    });
    this.updatePacksAndFiles();
  }

  /**
   * delete multipul files
   * @param {string[]} files - array of file addresses
   * @return {Promise}
   **/
  deleteFiles(files): Promise<any> {
    return new Promise((resolve, reject) => {
      let filesCount = files.length;
      files.forEach(filepath => {
        fs.unlink(filepath, err => {
          filesCount--;
          if (err) {
            reject(err);
            return;
          } else if (filesCount <= 0) {
            resolve();
          }
        });
      });
    });
  }

  /**
   * read a pack data from db and check if its cached or not
   * @param {string} packID - pack id
   * @return {any} return pack db if it is cached and usable
   **/
  readPackCache(packID: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const packDB = this._appGlobals.userDBConnection
        .get("packsCache")
        .find({ packID })
        .value();
      if (packDB && packDB.dateAdded) {
        fs.stat(packDB.packPath, (error, stat) => {
          if (error !== null) {
            reject();
          } else if (stat.mtime < new Date(packDB.dateAdded)) {
            resolve(packDB);
          } else {
            reject();
          }
        });
      } else {
        reject();
      }
    });
  }

  /**
   * save cache for a pack into db
   * @param {string} packID - pack id
   * @param {string} packPath - pack path
   * @param {boolean} finalCache - is it final to add date added or not
   * @return {void}
   **/
  cachePack(packID: string, packPath: string, finalCache = false): void {
    if (finalCache) {
      this._appGlobals.userDBConnection
        .get("packsCache")
        .find({ packID })
        .assign({ dateAdded: new Date() })
        .write();
    } else {
      this._appGlobals.userDBConnection
        .get("packsCache")
        .remove({ packID })
        .write();
      this._appGlobals.userDBConnection
        .get("packsCache")
        .push({
          packID,
          packPath,
          files: []
        })
        .write();
    }
  }

  /**
   * save cache for a pack into db
   * @param {string} packID - pack id
   * @param {any} categoryObject - object of category name and items in it
   * @return {any} - return new category object with id
   **/
  cacheCategory(packID: string, categoryObject: any): any {
    const categoryDB = this._appGlobals.userDBConnection
      .get("packsCache")
      .find({ packID })
      .get("files");
    categoryDB
      .push({
        category: categoryObject.categoryName,
        items: []
      })
      .write();
    categoryObject.items.map(item => {
      categoryDB
        .find({ category: categoryObject.categoryName })
        .get("items")
        .insert(item)
        .write();
    });
    return categoryDB.find({ category: categoryObject.categoryName }).value();
  }

  /**
   * rename a pack
   * @param { string } packID - pack path
   * @param { string } newName - new name of pack
   * @return { void}
   **/
  renamePack(packID: string, newName: string): void {
    this._appGlobals.userDBConnection
      .get("packsAndFiles.packs")
      .find({ id: packID })
      .assign({ packName: newName })
      .write();
    this.updatePacksAndFiles();
  }

  /**
   * create new interface of new folder then push it to data base and call pack sort
   * @param {string} newPackName - name of new pack
   **/

  addNewFolder(newPackName: string): void {
    const oldPackName = newPackName;
    if (this.packsAndFiles.packs.find(x => x.packName === newPackName)) {
      let i = 0;
      do {
        i = i + 1;
        newPackName = `${oldPackName} ${i}`;
      } while (this.packsAndFiles.packs.find(x => x.packName === newPackName));
    }

    const addNewPack: NewPack = {
      packName: newPackName,
      packPath: "",
      packViewMode: "",
      packCover: "",
      itemsCount: 0,
      removedItems: [],
      addedItems: []
    };
    this._appGlobals.userDBConnection
      .get("packsAndFiles.packs")
      .insert(addNewPack)
      .write();
    this.updatePacksAndFiles();
  }

  /**
   * sorting pack list after added new folder
   * @return {void}
   **/
  sortingPackInAddFolder(): void {
    this.packsAndFiles.packs.sort((a, b) => {
      const textA = a.packName.toUpperCase();
      const textB = b.packName.toUpperCase();
      return textA < textB ? -1 : textA > textB ? 1 : 0;
    });
  }

  /**
   * receives an array of items and removes them
   * @param {Array} itemDetailsArray - array of items that will be removed
   * @return {void}
   */
  removeMultipleItems(itemDetailsArray: any[]): void {
    try {
      itemDetailsArray.forEach(itemDetail => {
        this.removeItemFromDB(itemDetail.packID, itemDetail.item);
      });
      this.itemCount.next({
        packID: itemDetailsArray[0].packID,
        removedItemsCount: itemDetailsArray.length,
        addedItemsCount: 0
      });
      this._jsxInjectorService.dispatchVulcanMessage("pack.items.removed", {
        items: itemDetailsArray,
        currentRoute: this.fileBrowserStack
      });
    } catch (e) {}
  }

  /**
   * receives the details of a single item and remove it and its spreadsheet
   * @param {string} packID - ID of pack that items belong to
   * @param {object} item - object that includes other details of item
   * @param {boolean} removeSpreadsheet - if set to true item spreadsheet will be removed
   * @return {void}
   */
  removeItemFromDB(packID: string, item: any, removeSpreadsheet = true): void {
    if ("" === packID) {
      this.removeRootFolderItem(item);
    } else {
      this.removePackItem(packID, item);
    }
  }

  /**
   * receives item detail object and removes it from root folder
   * @param {any} item - Object that includes item details
   * @return {void}
   */
  removeRootFolderItem(item: any): void {
    this._appGlobals.userDBConnection
      .get("packsAndFiles.files")
      .remove({ itemPath: item.itemPath })
      .write();
    this.updatePacksAndFiles();
  }

  /**
   * receives item detail object and packID and removes it from pack folder
   * @param {any} item - Object that includes item details
   * @param {string} packID - ID of pack
   * @return {void}
   */
  removePackItem(packID: string, item: any): void {
    const isAdded = this._appGlobals.userDBConnection
      .get("packsAndFiles.packs")
      .find({ id: packID })
      .get("addedItems")
      .value();
    if (isAdded) {
      this._appGlobals.userDBConnection
        .get("packsAndFiles.packs")
        .find({ id: packID })
        .get("addedItems")
        .remove({ itemPath: item.itemPath })
        .write();
    }
    this._appGlobals.userDBConnection
      .get("packsAndFiles.packs")
      .find({ id: packID })
      .get("removedItems")
      .push({ itemPath: item.itemPath })
      .write();
    this.removeItem(item.categoryName, item.itemPath);
  }

  /**
   * receives item detail object and removes its spreadsheet
   * @param {any} item - Object that includes item details
   * @return {void}
   */
  removeSpreadsheet(item: any): void {
    const spreedSheets = this._appGlobals.userDBConnection
      .get("videoPreviews")
      .filter({ origin: item.itemPath, loading: false })
      .value()
      .concat([]);
    if (spreedSheets) {
      const spreedFileNames = spreedSheets.map(spreedSheet => {
        return (
          this._userManagerService.motionFactoryUserFileDirection() +
          "/spreedsheets/" +
          spreedSheet.id +
          ".png"
        );
      });
      this.deleteFiles(spreedFileNames);
    }
    this._appGlobals.userDBConnection
      .get("videoPreviews")
      .remove({ origin: item.itemPath })
      .write();
  }

  /**
   * receives an array of items and moves them to a new pack
   * @param {Array} itemDetailsArray - array of items that will be moved
   * @param {String} destinationPackId - id of pack that items will move to
   * @return {void}
   */
  moveMultipleItems(itemDetailsArray: any[], destinationPackId: string): void {
    try {
      itemDetailsArray.forEach(itemDetail => {
        this.moveToPack(
          itemDetail.packID,
          itemDetail.item,
          destinationPackId,
          ""
        );
      });

      this._jsxInjectorService.dispatchVulcanMessage("pack.items.added", {
        items: itemDetailsArray,
        destinationPackId
      });

      this._jsxInjectorService.dispatchVulcanMessage("pack.items.removed", {
        items: itemDetailsArray,
        currentRoute: this.fileBrowserStack
      });
      this.itemCount.next({
        packID: destinationPackId,
        removedItemsCount: 0,
        addedItemsCount: itemDetailsArray.length
      });
    } catch (e) {}
  }

  /**
   * receives the details of a single item and moves it to a pack
   * @param {string} packID - ID of pack that items belong to
   * @param {object} itemDetail - object that includes other details of item
   * @param {String} destinationPackId - id of pack that item will move to
   * @return {void}
   */
  moveToPack(
    packID: string,
    itemDetail: any,
    destinationPackId: string,
    category: string
  ): void {
    itemDetail.category = this.categoryAllName;
    this.removeItemFromDB(packID, itemDetail, false);
    if (packID !== "") {
      this._appGlobals.userDBConnection
        .get("packsAndFiles.packs")
        .find({ id: packID })
        .get("addedItems")
        .remove({ itemPath: itemDetail.itemPath })
        .write();
    }

    if ("" === destinationPackId) {
      this.isRootThumbnailQueueRunning = false;

      this._appGlobals.userDBConnection
        .get("packsAndFiles.files")
        .push(itemDetail)
        .write();
    } else {
      this._appGlobals.userDBConnection
        .get("packsAndFiles.packs")
        .find({ id: destinationPackId })
        .get("removedItems")
        .remove({ itemPath: itemDetail.itemPath })
        .write();
      this._appGlobals.userDBConnection
        .get("packsAndFiles.packs")
        .find({ id: destinationPackId })
        .get("addedItems")
        .push(itemDetail)
        .write();
    }
  }

  /**
   * gets pack ID and returns an array of removed items in that pack
   * @param {string} packID - ID of pack that is checked
   * @return {Array} - array of items that are removed
   */
  fetchRemovedItems(packID: string): any[] {
    const removedItems = this._appGlobals.userDBConnection
      .get("packsAndFiles.packs")
      .find({ id: packID })
      .get("removedItems")
      .value();
    if (removedItems) {
      return removedItems.map(item => item.itemPath);
    }
    return [];
  }

  /**
   * gets pack ID and returns an array of added items in that pack
   * @param {string} packID - ID of pack that is checked
   * @return {Array} - array of items that are added
   */
  fetchAddedItems(packID: string): any[] {
    const added = this._appGlobals.userDBConnection
      .get("packsAndFiles.packs")
      .find({ id: packID })
      .get("addedItems")
      .value();
    if (added) {
      return added;
    } else {
      return [];
    }
  }

  /**
   * watch for other hosts events
   * @return {void}
   */
  watchForExternalEvents(): void {
    this.watchForRootRefresh();
    this.watchForPackItemRemoved();
    this.watchForPackItemAdded();
  }

  /**
   * watch for root refresh event from vulcan
   * @return {void}
   */
  watchForRootRefresh(): void {
    this._jsxInjectorService
      .listenForVulcanEvent("root.refresh")
      .subscribe(payload => {
        try {
          this._appGlobals.userDBConnection.read();
          this.rootThumbnailQueue = [];
          this.isRootThumbnailQueueRunning = false;
          this.thumbnailQueue = [];
          this.isThumbnailQueueRunning = false;
          if (
            !this.fileBrowserStack.length &&
            payload.shouldRefresh.includes("")
          ) {
            this.updatePacksAndFiles(false, payload.packAndFile);
          } else if (
            this.fileBrowserStack.length &&
            payload.shouldRefresh.includes(
              this.fileBrowserStack[this.fileBrowserStack.length - 1].packID
            )
          ) {
            this.updatePacksAndFiles(false, payload.packAndFile);
          }
        } catch (e) {}
      });
  }

  /**
   * watch for item in a pack removed event
   * @return {void}
   */
  watchForPackItemRemoved(): void {
    this._jsxInjectorService
      .listenForVulcanEvent("pack.items.removed")
      .subscribe(data => {
        try {
          this._appGlobals.userDBConnection.read();
          if (
            JSON.stringify(this.fileBrowserStack) ===
            JSON.stringify(data.currentRoute)
          ) {
            data.items.map(item => {
              this.removeItem(item.item.categoryName, item.item.itemPath);
            });
          }
        } catch (e) {}
      });
  }

  /**
   * watch for item in a pack added event
   * @return {void}
   */
  watchForPackItemAdded(): void {
    this._jsxInjectorService
      .listenForVulcanEvent("pack.items.added")
      .subscribe(data => {
        try {
          this._appGlobals.userDBConnection.read();
          if (
            (this.fileBrowserStack.length &&
              this.fileBrowserStack[this.fileBrowserStack.length - 1].packID ===
                data.destinationPackId) ||
            (!this.fileBrowserStack.length && data.destinationPackId === "")
          ) {
            data.items.map(item => {
              this.packsAndFiles.files.push({
                itemPath: item.item.itemPath,
                itemDetail: item.item.itemDetail
              });
            });
          }
        } catch (e) {}
      });
  }

  navigateToFolder({ packID, packPath, packName, buyLink }): void {
    this.fileBrowserStack.push({ packID, packPath, packName });
    if (1 === this.fileBrowserStack.length) {
      this.globalBuyLink = buyLink;
    }
    this.startFetchingPacksAndFiles();
  }

  goOneStepBack(): boolean {
    if (this.fileBrowserStack.length > 0) {
      this.fileBrowserStack.pop();
      this.startFetchingPacksAndFiles();
    }
    if (this.fileBrowserStack.length === 0) {
      return false;
    }
    return true;
  }

  navigateToPart(index): boolean {
    this.fileBrowserStack = this.fileBrowserStack.slice(0, index + 1);
    this.startFetchingPacksAndFiles();
    if (this.fileBrowserStack.length === 0) {
      return false;
    }
    return true;
  }
}
