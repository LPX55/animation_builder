import { IpcHandlerService } from './../../../core/services/ipc-handler/ipc-handler.service';
import { Subscription } from 'rxjs';
import { AnimationCoreService } from './../../services/animation-core.service';
import { Component, OnInit, ViewChildren, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgProgress } from '@ngx-progressbar/core';



@Component({
  selector: 'mf-animation-home',
  templateUrl: './animation-home.component.html',
  styleUrls: ['./animation-home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnimationHomeComponent implements OnInit, OnDestroy {
  public sectionToLoad: string;
  showDropArea = false;
  subscribeShowDropArea: Subscription;
  @ViewChild('packInstaller') fileSelector;
  showMenu = false;


  constructor(private route: ActivatedRoute, private router: Router,
    private _animationCoreService: AnimationCoreService, private _changeDetectorRef: ChangeDetectorRef, private ngProgress: NgProgress,
    private _ipcHandlerService: IpcHandlerService) {
    this.subscribeShowDropArea = this._animationCoreService.showDropArea.subscribe((value) => {
      this.showDropArea = value;
      _changeDetectorRef.markForCheck();
    });
    this._animationCoreService.isAnyPackInstalled.subscribe((value)=>{
      this.showMenu = value;
    })
  }


  /**
   * here we add subscribe to query param element so we can listen to URL changes for loading other components
   * @return {void}
  */
  ngOnInit(): void {
    this._animationCoreService.checkAnyPackInstalled();
  }
  ngOnDestroy(): void {
    this.subscribeShowDropArea.unsubscribe();
  }


  get animationFilter(): number {
    return this._animationCoreService.animationTypeFilter;
  }
  installPack() : void {
    this.fileSelector.nativeElement.click();
  }
  fileChoosed(event): void {
    const files = event.srcElement.files;
    this.ngProgress.ref().start();
    this._ipcHandlerService
    .emitEvent("installPack", {packPath: files[0].path, outPutPath: this._animationCoreService.textBuilderPath })
    .subscribe(data => {
      console.log(data);
      this.ngProgress.ref().complete();
      if(data.result) this._animationCoreService.checkAnyPackInstalled();
    });
    const fileSelector: any = document.getElementById('file-selector');
    fileSelector.value = '';
  }
}
