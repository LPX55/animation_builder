import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TemplateCoreService } from '../../services/template-core.service';
import { FileDataService } from '../../../core/services/file-data/file-data.service';

@Component({
  selector: 'mf-added-folder',
  templateUrl: './added-folder.component.html',
  styleUrls: ['./added-folder.component.scss']
})
export class AddedFolderComponent implements OnInit {

  // view child for input that get name of new pack added it use in editNAme()
  @ViewChild('newFolderName') nameFiled: ElementRef;

  // name of new pack that user type in input it use in pressEnter()
  public addPackName = '';

  constructor(private _templateCoreService: TemplateCoreService , private _fileDataService: FileDataService) { }

   /**
    * focus on input when creat new folder
    * @return {void}
  **/
  ngOnInit(): void {
    this.nameFiled.nativeElement.focus();
  }
    /**
    * when press enter add new folder to list of pack check pack name
    * if pack name was empty add new folder else add current name folder
    * @return {void}
  **/
  pressEnter(event): void {
    if ( event.keyCode === 13) {
      this.checkNewFolderName();
      // @TODO should do it with angular filter
      this._templateCoreService.addedFolder = false;
    }
  }

 /**
    * when click on new folder pack focus on input
    * @return {void}
  **/
  editName(): void {
    this.nameFiled.nativeElement.focus();
  }

   /**
    * when click anywhere of pack list create new folder with static name 'new folder'
    * @return {void}
  **/
  onBlurInput(): void {
    this._templateCoreService.addedFolder = false;
    this.checkNewFolderName();
  }

   /**
    * check new-folder has name or not
    * @return {void}
  **/
  checkNewFolderName(): void {
    if ( '' === this.addPackName ) {
      this._fileDataService.addNewFolder('New Folder');
    } else {
      this._fileDataService.addNewFolder(this.addPackName);
    }
  }
}
