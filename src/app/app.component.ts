import { CepHostService } from './core/services/cep-host/cep-host.service';
import { AppGlobals } from './../global';
import { routerAnimation } from './shared/helpers/animations';
import { Component, OnInit, HostListener, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { UserManagerService } from './core/services/user-manager/user-manager.service';
import { JsxInjectorService } from './core/services/jsx-injector/jsx-injector.service';
import { OsInfoService } from './core/services/operating-system/os-info.service';
import Aftereffects from './core/environments/aftereffects';

@Component({
  selector: 'mf-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    routerAnimation
  ]
})
export class AppComponent implements OnInit {
  routeAnimation = 'template';
  @ViewChild('dragAndDropCanvas') dragAndDropCanvas: ElementRef;
  public buttons = [
    {
      'title': 'OK, Do it!',
      'class': 'primary',
      'callBackFunction': this.restartAE.bind(this)
    }
  ];
  @HostListener('window:resize', ['$event'])
  onResize($event: any): void {
    const windowWidth = $event.target.innerWidth;
  }

  @HostListener('click', ['$event'])
  deselectFiles($event: any): void {
    const paths = $event.path.filter(path => path.tagName !== undefined).map(path => path.tagName.toLowerCase());
    if (!paths.includes('mf-drop-down') && !paths.includes('mf-template-item')) {
      this._changeDetectorRef.detectChanges();
    }
  }

  constructor(
    private _router: Router,
    private _userManagerService: UserManagerService,
    private _jsxInjectorService: JsxInjectorService,
    private _osInfoService: OsInfoService,
    private _appGlobals: AppGlobals,
    private _cepHostService: CepHostService,
    private _changeDetectorRef: ChangeDetectorRef) {
  }

  /**
   * quit app and run plugin checker
   * @return {void}
  */
  restartAE(): void {
    let appVersion = '';
    if (this._osInfoService.currentPlatform !== 'MAC') {
      fs.writeFileSync(`${this._osInfoService.getMotionFactoryAppDataFolder()}/host-version.txt`,
        path.resolve(processArgv0, '../../AfterFX.exe'));
    } else {
      appVersion = (parseInt(this._jsxInjectorService.hostEnvironment.appVersion.split('.')[0], 10) + 2003).toString();
      fs.writeFileSync(`${this._osInfoService.getMotionFactoryAppDataFolder()}/host-version.txt`,
        `open -a "Adobe After Effects CC ${appVersion}"`);
    }
  }

  /**
   * check plugin is installed or not
   * @return {void}
  */
  checkPluginInstallation(): void {
    if (this._jsxInjectorService.hostEnvironment.appId === Aftereffects.hostId) {
    }
  }

  // change the animation state
  getRouteAnimation(outlet): any {
    return outlet.activatedRouteData.animation;
  }

  onPluginMessageBoxClosed(): void {
    this.updatePluginMessageBoxShowing = false;
  }

  get updatePluginMessageBoxShowing(): boolean {
    return this._jsxInjectorService.showPluginMessageBox;
  }

  set updatePluginMessageBoxShowing(value: boolean) {
    this._jsxInjectorService.showPluginMessageBox = value;
  }

  ngOnInit(): void {

    this.stopDragAndDropFromOutSide();
    this._appGlobals.dragAndDropCanvas = this.dragAndDropCanvas.nativeElement;
    this._appGlobals.dragAndDropContext = this._appGlobals.dragAndDropCanvas.getContext('2d');

  }

  // stop d&d from outside to motion-factory
  stopDragAndDropFromOutSide(): void {

    window.addEventListener('dragover', e => {
      e.preventDefault();
    }, false);
    window.addEventListener('drop', e => {
      e.preventDefault();
    }, false);
  }

}