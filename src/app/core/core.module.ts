import { AppGlobals } from '../../global';
import { OsInfoService } from './services/operating-system/os-info.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule, isDevMode } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { JsxInjectorService } from './services/jsx-injector/jsx-injector.service';
import { SharedModule } from '../shared/shared.module';
import { UserManagerService } from './services/user-manager/user-manager.service';
import { CepHostService } from './services/cep-host/cep-host.service';
import Aftereffects from './environments/aftereffects';
import { MessageBoxComponent } from '../shared/components/message-box/message-box.component';


@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        HttpClientModule,
        SharedModule
    ],
    declarations: [
        HeaderComponent
    ],
    exports: [
        HeaderComponent
    ],
    providers: [
        JsxInjectorService,
        UserManagerService,
        OsInfoService,
        AppGlobals,
        CepHostService,
    ]

})
export class CoreModule {
    constructor(
        private _osInfoService: OsInfoService,
        private _appGlobals: AppGlobals,
        private _jsxInjectorService: JsxInjectorService,
        private _cepHost: CepHostService
    ) {
    }

    /**
     * Create Global instance from Database
     * @return { void }
     */
    initializeDatabase(): void {
        const adapter = new fileSync(this._osInfoService.getMotionFactoryDatabasePath());
        this._appGlobals.DBConnection = low(adapter);
        this._appGlobals.DBConnection._.mixin(lodashId);
        // Set some defaults
        this._appGlobals.DBConnection.defaults({
            user: {
                status: 0,
            },
            userSetting: {
                missingCheckBoxCLicked: true
            },
            cacheTime: new Date().getTime()
        }).write();
        const cacheTime = this._appGlobals.DBConnection.get('cacheTime').value();
        if (cacheTime < 20) {
            this._appGlobals.DBConnection.assign({ cacheTime: new Date().getTime() }).write();
        }
    }
}
