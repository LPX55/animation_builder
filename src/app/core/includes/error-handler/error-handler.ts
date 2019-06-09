import { ErrorHandler, isDevMode } from '@angular/core';
import * as Raven from 'raven-js';
import { AppGlobals } from '../../../../global';

/**
 * @class RavenErrorHandler Manage error handling
 * Handle all errors and send it to server
 */
export class RavenErrorHandler implements ErrorHandler {


    /**
     * Get the user email and address
     * @return {object}
     */
    private _getUserEmailAddressAndID(): object {
        const userInfo = localStorage.getItem('userInfo');
        if (null != userInfo) {
            const { id, name } = JSON.parse(userInfo);
            return { id, name };
        } else {
            return {
                id: 0,
                name: 0
            };
        }
    }

    /**
    * Get the user environment info
    * @return {object}
    */
    private _getHostEnvironment(): object {
        const { appId, appVersion, appLocale } = JSON.parse(window['__adobe_cep__'].getHostEnvironment());
        return { appId, appVersion, appLocale };
    }

    /**
    * This function config with raven to handle and report error to sentry
    * @return {void}
    */
    handleError(err: any): void {
        const globals = new AppGlobals();
        const userData = this._getUserEmailAddressAndID();
        const appInfo = this._getHostEnvironment();
        if (!isDevMode()) {
            Raven.captureException(err);
            Raven.setUserContext({
                email: userData['name'],
                id: userData['id'],
                host: appInfo['appId'],
                hostVersion: appInfo['appVersion'],
                language: appInfo['appLocale'],
                appVersion: globals['APPVersion']
            });
            Raven.setExtraContext({
                origin: 'host'
            });
        }
    }
}

