import { FileDataService } from './../../../core/services/file-data/file-data.service';
import { Component, OnInit, Input, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { AppGlobals } from '../../../../global';

@Component({
  selector: 'mf-missing-message-box',
  templateUrl: './missing-message-box.component.html',
  styleUrls: ['./missing-message-box.component.scss']
})
export class MissingMessageBoxComponent implements OnInit, AfterViewInit {
  // missing check box variable
  @Input() missingCheckBox = false;
  // message text of missing box
  @Input() missingMessageText: string;
  // closed message box
  @Input() messageBoxClosed;
  // list of missing file and folder
  @Input() missingLists;
  //  missing message box
  @Input() set isShowing(missingCheckBox: boolean) {
    if (missingCheckBox) {
      this.showMessageBox();
    } else {
      this.closeMissingPanel();
    }
  }
  // view child for file selector input
  @ViewChild('fileSelector') fileSelector;
  // view child for folder selector input
  @ViewChild('folderSelector') folderSelector;
  // type of missing item
  public missingType;
  // path of current item
  public CurrentItemPath;
  // current item object
  public currentItem;
  // check is in new folder
  public isInNewFolder;
  // id of new folder
  public newFolderId;
  // detail of missing file
  public MissFileDetail;
  // details of current item
  public currentItemDetail;
  //  replace button click
  public buttonColor = '#505050';



  constructor(
    private _fileDataService: FileDataService,
    private _appGlobals: AppGlobals,
  ) { }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.currentItem = document.querySelector('.missing-list');
    const missingListValue = this.missingLists.values();
    const firstItemInMissingList = missingListValue.next();
    const firstItemInMissingListValue = firstItemInMissingList.value;
    this.CurrentItemPath = firstItemInMissingListValue[0];
    this.typeOfMissing(this.CurrentItemPath);
  }

  /**
* check is never show this message is click or not
* @return {void}
*/

  handleClick(): void {
    this.missingCheckBox = !this.missingCheckBox;
    if (this.missingCheckBox) {
      this._appGlobals.DBConnection.update('userSetting.missingCheckBoxCLicked', (value) => {
        return false;
      }).write();
    }
  }
  /**
 * Show messagebox , it will first remove animationend event and then it will call showMessageBox modal function
 * @return {void}
*/
  showMessageBox(): void {
    const modal = document.getElementById('mf-messagebox-modal');
    modal.removeEventListener('animationend', this.hideMessageBoxMessage);
    this.showMessageBoxModal();
  }


  /**
   * Start the modal animation ( animation is defined in css file ) and when it's end it will call showMessageBoxMessage function
   * @return {void}
  */
  showMessageBoxModal(): void {
    const modal = document.getElementById('mf-messagebox-modal');
    modal.style.animation = 'showMessageBoxModal 0.1s 1 forwards';
    modal.addEventListener('animationend', this.showMessageBoxMessage);
  }

  /**
   * Start the messagebox animation ( animation is defined in css file )
   * @return {void}
  */
  showMessageBoxMessage(): void {
    const container = document.getElementById('mf-messagebox-container');
    container.style.animation = 'showMessageBoxMessage 0.4s 1 forwards';
  }


  /**
   * function to start the hide animation of messagebox message
   * @return {void}
  */
  hideMessageBoxMessage(): void {
    const container = document.getElementById('missing-message-box');
    container.style.animation = 'hideMessageBoxMessage 0.4s 1 forwards';
  }
  /**
 * function to close missing panel with animation
 * @return {void}
*/
  closeMissingPanel(): void {
    const modal = document.getElementById('missing-message-box-container');
    /* check if animation is not set yet we do not run the hide animation cause it's first time run */
    modal.style.animation = 'hideMessageBoxModal 0.3s 1 forwards';
    modal.addEventListener('animationend', this.hideMessageBoxMessage.bind(this));
    this._fileDataService.isMissingIconClick = false;
  }
  /**
* browse item is file or folder and click that native element
* @return {void}
*/
  browseMissingItem(): void {
    const selectedClass = document.querySelector('.missedItemSelected');
    if (selectedClass) {
      if ('file' === this.missingType) {
        this.fileSelector.nativeElement.click();
      } else {
        this.folderSelector.nativeElement.click();
      }
    }

  }
  /**
* select miss item in item list of missing box message
* @param {object} items - object of item
* @return {void}
*/
  selectMissingItem(event, items): void {

    this.buttonColor = '#2D60EB';
    this.currentItemDetail = items[2];
    const selectedClass = document.querySelector('.missedItemSelected');
    if (selectedClass) {
      selectedClass.classList.remove('missedItemSelected');
    }
    this.currentItem = event.target.parentNode;
    this.currentItem.classList.add('missedItemSelected');
    this.CurrentItemPath = this.currentItem.querySelector('.missing-path').textContent;
    this.typeOfMissing(this.CurrentItemPath);
    if ('' !== items[2].itemDetail.packID) {
      this.isInNewFolder = true;
      this.newFolderId = items[2].itemDetail.packID;
    }

  }

  /**
* set missingType variable
* @param {string} missPath - string of missing item path
* @return {void}
*/
  typeOfMissing(missPath): void {
    const missingType = path.extname(missPath);
    if ('' === missingType) {
      this.missingType = 'folder';
    } else {
      this.missingType = 'file';
    }

  }

  /**
* when file input choosed a file in folder
* @return {void}
*/
  fileChossedInFolder(file): void {
    if (this.isInNewFolder) {
      this._fileDataService.moveToPack('', file[0], this.newFolderId, this.currentItemDetail.categoryName);
      this._fileDataService.removePackItem(this.newFolderId, this.currentItemDetail);
      this._fileDataService.watchSubject.next({
        event: 'added',
        type: 'item',
        category: this.currentItemDetail.categoryName,
        item: {
          itemPath: file[0].itemPath,
          itemDetail: file[0].itemDetail,
          categoryName: this.currentItemDetail.categoryName,
        }
      });
      const fileSelector: any = document.getElementById('miss-file-selector');
      fileSelector.value = '';
    }
  }

  /**
  * remove file that replace from missing list
  * @return {void}
  */
  removeFileInMissingList(): void {
    let filesValue: any;
    const hash = {};

    filesValue = [this.currentItemDetail.itemPath, this.currentItemDetail.itemDetail.fileName, this.currentItemDetail];

    this.missingLists.map((item) => {
      hash[this.missingLists[item]] = item;
    });
    if (hash.hasOwnProperty(filesValue)) {
      this.missingLists.splice(hash[filesValue], hash[filesValue]);
    }

  }

  /**
 * when file input choosed a file
 * @return {void}
*/
  fileChoosed(event): void {
    const files = event.srcElement.files;
    if (files.length > 0) {
      this._appGlobals.userDBConnection.get('packsAndFiles.files').remove({ itemPath: this.CurrentItemPath }).write();
      this._fileDataService.updatePacksAndFiles();
      this.removeFileInMissingList();

      this._fileDataService.uploadFiles(files, false).then((file) => {
        this.CloseMissingBoxAfterBrowse();
        this.fileChossedInFolder(file);
      });
    }
  }


  /**
* remove folder that replace from missing list
* @return {void}
*/
  removeFolderInMissingList(): void {
    const hash = {};
    let folderValue: any;
    folderValue = [this.currentItemDetail.packPath, this.currentItemDetail.packName, this.currentItemDetail];

    this.missingLists.map((item) => {
      hash[this.missingLists[item]] = item;
    });

    if (hash.hasOwnProperty(folderValue)) {
      this.missingLists.splice(hash[folderValue], hash[folderValue]);
    }

  }

  /**
   * when folder input is choosed a folder
   * @return {void}
  */
  folderChoosed(event): void {
    const files = event.srcElement.files;


    if (files.length > 0) {
      const currentId = this.currentItem.querySelector('.missing-name').getAttribute('id');
      this._fileDataService.removePack(currentId);
      this.removeFolderInMissingList();
      const folderAddress = files[0].path.replace(/\\/g, '/')
        .replace(files[0].webkitRelativePath, '') + files[0].webkitRelativePath.replace(/\\/g, '/').split('/')[0];
      this._fileDataService.uploadFolder(folderAddress);
      this.CloseMissingBoxAfterBrowse();
      const folderSelector: any = document.getElementById('miss-folder-selector');
      folderSelector.value = '';
    }
  }
  /**
  * close missing message box after browse
  * @return {void}
 */
  CloseMissingBoxAfterBrowse(): void {
    if (1 === document.querySelectorAll('.missing-name').length) {
      this.closeMissingPanel();
    }
  }

  /**
    * check missing item in root
    * @return {boolean} - boolean of ccheck is in root
   */
  missingFileInRoot(): boolean {
    if (this._fileDataService.showMissingCheckbox) {
      return true;
    } else {
      return false;
    }
  }

}
