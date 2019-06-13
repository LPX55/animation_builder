import { JsxInjectorService } from './../../../core/services/jsx-injector/jsx-injector.service';
import { TemplateCoreService } from '../../services/template-core.service';
import { FileDataService } from '../../../core/services/file-data/file-data.service';
import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';

@Component({
  selector: 'mf-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {


  @ViewChild('fileSelector') fileSelector;
  @ViewChild('folderSelector') folderSelector;
  @ViewChild('imageSequenceSelector') imageSequenceSelector;
  // content of import drop down menu
  dropDownContent = [
    {
      id: 1,
      thumbnail: './assets/file-icon.svg',
      title: 'Import File'
    },
    {
      id: 2,
      thumbnail: './assets/folder-icon.svg',
      title: 'Import Folder'
    },
    {
      id: 3,
      thumbnail: './assets/png-sequence.svg',
      title: 'Import Sequence'
    }
  ];

  constructor(
    private fileDataService: FileDataService,
    private _templateCoreService: TemplateCoreService,
  ) { }

  ngOnInit(): void {
  }

  get showUploadDropDown(): boolean {
    return this._templateCoreService.showUploadDropDown;
  }

  /**
    * open dropdown of import to choose file or folder
    * @return {void}
   */
  openFileDialog($event): void {
    this._templateCoreService.showFolderDropDown = false;
    this._templateCoreService.showFileDropDown.next(false);
    if (!this.browsingPack) {
      $event.stopPropagation();
      this._templateCoreService.showUploadDropDown = true;
    }
  }

  /**
   * when drop down of import file is closed
   * @return {void}
  */
  onUploadDropDownClosed(): void {
    this._templateCoreService.showUploadDropDown = false;
  }

  /**
   * when file input choosed a file
   * @return {void}
  */
  fileChoosed(event, asSequence = false): void {
    const files = event.srcElement.files;
    this.fileDataService.uploadFiles(files, asSequence);
    const fileSelector: any = document.getElementById('file-selector');
    const sequenceSelector: any = document.getElementById('image-sequence-selector');
    fileSelector.value = '';
    sequenceSelector.value = '';
  }

  /**
   * when folder input is choosed a folder
   * @return {void}
  */
  folderChoosed(event): void {
    const files = event.srcElement.files;
    if (files.length > 0) {
      const folderAddress = files[0].path.replace(/\\/g, '/')
        .replace(files[0].webkitRelativePath, '') + files[0].webkitRelativePath.replace(/\\/g, '/').split('/')[0];
      this.fileDataService.uploadFolder(folderAddress);
      const folderSelector: any = document.getElementById('folder-selector');
      folderSelector.value = '';
    }
  }


  /**
   * when clicked on a drop down import file or folder
   * @return {void}
  */
  onClickOnDropDown($event): void {
    const menuId = $event.menuId;
    if (menuId === 1) {
      this.fileSelector.nativeElement.click();
    } else if (menuId === 2) {
      this.folderSelector.nativeElement.click();
    } else {
      this.imageSequenceSelector.nativeElement.click();
    }
  }

  get browsingPack(): boolean {
    return this._templateCoreService.browsingPack;
  }



}
