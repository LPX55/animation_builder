import { Injectable } from '@angular/core';
import * as mixpanel from 'mixpanel-browser';
import { UserManagerService } from '../user-manager/user-manager.service';
import { AppGlobals } from '../../../../global';
import { CepHostService } from '../cep-host/cep-host.service';

@Injectable()
export class LogManagerService {
  // mixpanel unique token
  mixpanelToken = '16f2925fba3c697290f53f8d72c40b58';
  appVersion = new AppGlobals().APPVersion;
  constructor(private _cepHostService: CepHostService) {
    mixpanel.init(this.mixpanelToken);

  }
  /**
   * intializing mixpanel log and adds special properties to user profile, this function will execute each time user
   * see template(after login)
   * @param {string} id - user id
   * @param {string} email - user email
   * @return {void}
   */
  initialize(id: string, email: string): void {
    mixpanel.identify(id);
    mixpanel.people.set({
      '$email': email,    // only special properties need the $
      '$last_login': new Date(),        // properties can be dates...
      'Last Extension Version': this.appVersion
    });
    mixpanel.people.set_once({
      '$created': new Date(),
      'From Date': new Date(),
      'From Version': this.appVersion,
      'Source': 'Extension'
    });
    mixpanel.people.union({
      // 'installedExtensions': this._cepHostService.installedExtensionsList.map((extension => extension.name)),
      'Used Versions': this.appVersion,
      'Hosts': this._cepHostService.hostId
    });
    mixpanel.register({
      'Host ID': this._cepHostService.hostId,
      'Host Name': this._cepHostService.host.hostName,
      'Host Version': this._cepHostService.host.hostVersion,
      'Extension Version': this.appVersion
    });
    getMac.one((err, mac) => {
      let macId = '';
      if (err) { console.error(err); macId = '00-00-00-00-00-00'; }
      macId = mac;
      mixpanel.people.union({
        'Machines': macId
      });
      this.trackActivity();
    });
  }
    /**
   * tracks an event
   * @param {string} eventName - name of event
   * @param {any} eventData - object that reperesent data about that event
   * @return {void}
   */
  track(eventName, eventData): void {
    mixpanel.track(eventName, eventData);
  }
    /**
   * tracks sign up event(refister)
   * @param {string} id  - user ID
   * @param {string} email - user Email
   * @return {void}
   */
  trackRegisterEvent(id: string, email: string): void {
    mixpanel.alias(id);
    mixpanel.people.set_once({
      '$created': new Date(),
      'Source': 'Extension',
      '$email': email
    });
    this.track('Sign Up', {
      '$email': email,
      'Id': id,
      'Source': 'Extension'
    });

  }
    /**
   * tracks sign in event
   * @param {string} id  - user ID
   * @param {string} email - user Email
   * @return {void}
   */
  trackSignInEvent(id: string, email: string): void {
    mixpanel.alias(id);
    this.track('Sign In', {
      '$email': email,
      'Id': id,
      'Source': 'Extension'
    });

  }
    /**
   * track user activity(means user see's template view)
   * @return {void}
   */
  trackActivity(): void {
    this.track('Activity', {});
  }
}
