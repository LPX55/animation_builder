import { AutoUpdateService } from "./services/auto-update/auto-update.service";
import { AppGlobals } from "../../global";
import { OsInfoService } from "./services/operating-system/os-info.service";
import { FileDataService } from "./services/file-data/file-data.service";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule, isDevMode } from "@angular/core";
import { RouterModule } from "@angular/router";
 // import { HeaderComponent } from "./components/header/header.component";
import { JsxInjectorService } from "./services/jsx-injector/jsx-injector.service";
import { ResponsiveService } from "./services/responsive/responsive.service";
import { VideoProcessorService } from "./services/video-processor/video-processor.service";
// import { SharedModule } from "../shared/shared.module";
import { UserManagerService } from "./services/user-manager/user-manager.service";
import { CepHostService } from "./services/cep-host/cep-host.service";
import { FileSelectorService } from "./services/file-selector/file-selector.service";
import { IpcHandlerService } from "./services/ipc-handler/ipc-handler.service";
import Aftereffects from "./environments/aftereffects";
import { MessageBoxComponent } from "../shared/components/message-box/message-box.component";
import { LogManagerService } from "./services/log-manager/log-manager.service";

@NgModule({
  imports: [CommonModule, RouterModule, HttpClientModule],
  declarations: [],
  exports: [],
  providers: [
    JsxInjectorService,
    FileDataService,
    FileSelectorService,
    ResponsiveService,
    UserManagerService,
    VideoProcessorService,
    OsInfoService,
    AppGlobals,
    AutoUpdateService,
    CepHostService,
    IpcHandlerService,
    LogManagerService
  ]
})
export class CoreModule {
  constructor(
    private _osInfoService: OsInfoService,
    private _appGlobals: AppGlobals,
    private _autoUpdate: AutoUpdateService,
    private _ipcHandlerService: IpcHandlerService,
    private _jsxInjectorService: JsxInjectorService,
    private _cepHost: CepHostService
  ) {
    this.initializeDatabase();

    // this._ipcHandlerService.connectSubject.subscribe(connected => {
    //   if (connected) {
    //   }
    // });
  }

  /**
   * Create Global instance from Database
   * @return { void }
   */
  initializeDatabase(): void {
    const adapter = new fileSync(
      this._osInfoService.gettextanimatorDatabasePath()
    );
    this._appGlobals.DBConnection = low(adapter);
    this._appGlobals.DBConnection._.mixin(lodashId);
    // Set some defaults
    this._appGlobals.DBConnection.defaults({
      user: {
        status: 0,
        answeredSurvey: false
      },
      userSetting: {
        missingCheckBoxCLicked: true
      },
      cacheTime: new Date().getTime()
    }).write();
    const cacheTime = this._appGlobals.DBConnection.get("cacheTime").value();
    if (cacheTime < 20) {
      this._appGlobals.DBConnection.assign({
        cacheTime: new Date().getTime()
      }).write();
    }
  }
}
