import { FileDataService } from '../../../core/services/file-data/file-data.service';
import { TemplateCoreService } from '../../services/template-core.service';
import { element } from 'protractor';
import { Component, OnInit, Input, ElementRef, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';

@Component({
  selector: 'mf-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss']
})
export class InformationComponent implements OnInit, AfterViewInit {
  @Input() popUpDetails: any;
  public missedFont = true;
  public usedFonts = [];
  public imageThumbnail = '';
  public durationTitle = 'Duration';
  @ViewChild('imgThumbnail') imgThumbnail: ElementRef;

  constructor(private _templateCoreService: TemplateCoreService, private _ref: ElementRef, private _fileDataService: FileDataService) {
  }

  ngOnInit(): void {
    if (this.popUpDetails.fileType === 'image') {
      this.imageThumbnail = this.popUpDetails.thumbnail;
      this.popUpDetails.thumbnail = './assets/transparent.png';
      this.durationTitle = 'Dimensions';
    }
    if (this.popUpDetails.fonts) {
      this.usedFonts = this._fileDataService.isFontsInstalled(this.popUpDetails.fonts);
    }
  }
  ngAfterViewInit(): void {
    this.createImageFilePreview();
  }

  /**
     * create preview for image files and set background properties
     * @return {void}
    **/
  createImageFilePreview(): void {
    if (this.popUpDetails.fileType === 'image') {
      const informationImage = this.imgThumbnail.nativeElement;
      informationImage.style.backgroundImage = 'url("' + this.imageThumbnail + '")';
      informationImage.style.backgroundPosition = 'center';
      informationImage.style.backgroundSize = 'contain';
    }

  }

  closePanel(): void {
    this._templateCoreService.closePopUp();
  }
  onEvent(event): void {
    event.stopPropagation();
  }


}
