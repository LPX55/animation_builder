const os = require('os');
const fs = require('fs');

exports.setIPCParams = function(Raven, data, emitter) {
  const dataOBJ = JSON.parse(data);
  if ('userID' in dataOBJ) {
    this.userID = dataOBJ.userID;
    this.userEmail = dataOBJ.userEmail;
  }
  if ('host' in dataOBJ) {
    this.ffmpegPath = dataOBJ.ffmpegPath;
    this.extensionPath = dataOBJ.extensionPath;
    this.host = dataOBJ.host;
    this.hostVersion = dataOBJ.hostVersion;
    this.language = dataOBJ.language;
    this.appVersion = dataOBJ.appVersion;
    this.devMode = dataOBJ.devMode;
  }
  if (!this.devMode) {
    this.configRaven(Raven);
  }

  emitter('setIPCParams', {
    success: true
  });
};
