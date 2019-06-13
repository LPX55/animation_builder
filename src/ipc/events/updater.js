const request = require("request");
const {
  getNewVersionOfExtensionPath,
  getMotionFactoryAppDataFolder,
  currentPlatform,
  getOSUserInfo
} = require("./../helpers/os-info");
const { mkDirByPathSync } = require("../helpers/file-info");
const fs = require("fs");
const streamZip = require("node-stream-zip");
const exec = require("child_process").exec;
Promise = require("bluebird");
const rimraf = require("rimraf");
const os = require("os");

/**
 * @class AutoUpdater
 * This class contains all functionality about auto updater
 * @package ipc\events
 * @author Pixflow
 */
class AutoUpdater {
  /**
   * @constructor Setup dependencies for update new version
   * @param {string} currentVersion
   * @return {void}
   */
  constructor(currentVersion, emitter, runPluginChecker) {
    this.currentVersion = currentVersion;
    this.emitter = emitter;
    this.requestUpdateURL =
      "http://pixflow.co/motion-factory/update/update.php";
    this.username = getOSUserInfo("username");
    this.newVersionPath = getNewVersionOfExtensionPath();
    this.rootUpdatePath = getMotionFactoryAppDataFolder();
    this.updatePath = `${this.rootUpdatePath}/updatePack.zip`;
    this.runPluginChecker = runPluginChecker;
  }

  /**
   * Run the updater
   * @return {void}
   */
  runUpdater() {
    this.createLocalFolder();
    this.createUpdateFolder();
    this.rollBack();
    this.addRegistry();
    this.checkForNewVersion();
  }

  /**
   * Add registry to operating system
   * @return {void}
   */
  addRegistry() {
    let commands;
    if ("MAC" === currentPlatform()) {
      commands = this.getMACRegistryCommands();
    } else {
      commands = this.getWINRegistryCommands();
    }
    commands.map(command => {
      exec(command, error => {
        if (null != error) {
          throw error;
        }
      });
    });
  }

  /**
   * Return the list of MAC Adobe registry commands
   * @return {array}
   */
  getMACRegistryCommands() {
    const command = [];
    command.push(
      `defaults write /Users/${
        this.username
      }/Library/Preferences/com.adobe.CSXS.5 PlayerDebugMode 1`
    );
    command.push(
      `defaults write /Users/${
        this.username
      }/Library/Preferences/com.adobe.CSXS.6 PlayerDebugMode 1`
    );
    command.push(
      `defaults write /Users/${
        this.username
      }/Library/Preferences/com.adobe.CSXS.7 PlayerDebugMode 1`
    );
    command.push(
      `defaults write /Users/${
        this.username
      }/Library/Preferences/com.adobe.CSXS.8 PlayerDebugMode 1`
    );
    command.push(
      `defaults write /Users/${
        this.username
      }/Library/Preferences/com.adobe.CSXS.9 PlayerDebugMode 1`
    );
    command.push(
      `defaults write /Users/${
        this.username
      }/Library/Preferences/com.adobe.CSXS.10 PlayerDebugMode 1`
    );
    return command;
  }

  /**
   * Return the list of WIN Adobe registry commands
   * @return {array}
   */
  getWINRegistryCommands() {
    const command = [];
    command.push(
      "reg add HKEY_CURRENT_USER\\Software\\Adobe\\CSXS.5 /v PlayerDebugMode /t REG_SZ /d 1 /f"
    );
    command.push(
      "reg add HKEY_CURRENT_USER\\Software\\Adobe\\CSXS.6 /v PlayerDebugMode /t REG_SZ /d 1 /f"
    );
    command.push(
      "reg add HKEY_CURRENT_USER\\Software\\Adobe\\CSXS.7 /v PlayerDebugMode /t REG_SZ /d 1 /f"
    );
    command.push(
      "reg add HKEY_CURRENT_USER\\Software\\Adobe\\CSXS.8 /v PlayerDebugMode /t REG_SZ /d 1 /f"
    );
    command.push(
      "reg add HKEY_CURRENT_USER\\Software\\Adobe\\CSXS.9 /v PlayerDebugMode /t REG_SZ /d 1 /f"
    );
    command.push(
      "reg add HKEY_CURRENT_USER\\Software\\Adobe\\CSXS.10 /v PlayerDebugMode /t REG_SZ /d 1 /f"
    );
    return command;
  }

  /**
   * Check if MotionFactory folder exists and create the folder if not available
   * @return {void}
   */
  createLocalFolder() {
    try {
      fs.accessSync(this.rootUpdatePath);
    } catch (e) {
      fs.mkdirSync(this.rootUpdatePath);
    }
  }

  /**
   * Configure the HTTP request options
   * @return {object}
   */
  getRequestOptions() {
    return {
      url: this.requestUpdateURL,
      method: "POST",
      headers: {
        "User-Agent": "Super Agent/0.0.1",
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Version-App": this.currentVersion
      }
    };
  }

  /**
   * Send HTTP request for checking is new version available or not
   * @return {void}
   */
  checkForNewVersion() {
    const options = this.getRequestOptions();
    const sendUpdateRequest = request(options);
    sendUpdateRequest.on("response", response => {
      if (
        "true" === response.headers["update-available"] &&
        response.statusCode == 200
      ) {
        // Start downloading file if update is available
        this.downloadFile(sendUpdateRequest);
      }
    });

    // Handle HTTP error and abort request on error
    sendUpdateRequest.on("error", err => {
      sendUpdateRequest.abort();
      this.rollBack();
      throw err;
    });
  }

  /**
   * Download file and pipe it to local file
   * @param {Request} sendUpdateRequest
   * @return {void}
   */
  downloadFile(sendUpdateRequest) {
    sendUpdateRequest
      .pipe(fs.createWriteStream(this.updatePath))
      .on("finish", () => {
        this.beforeProcessesFile()
          .then(() => {
            this.processesDownloadFile().then(() => {
              this.processesUnpackFile();
            });
          })
          .catch(err => {
            throw err;
          });
      })
      .on("error", err => {
        sendUpdateRequest.abort();
        this.rollBack();
        throw err;
      });
  }

  /**
   * Do some functionality before update progress run
   * @return {Promise}
   */
  beforeProcessesFile() {
    return new Promise((resolve, reject) => {
      try {
        this.backupOldVersion();
        resolve("next");
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Check the backup exists for current backup or not
   * @return {boolean}
   */
  isBackupExists() {
    try {
      fs.accessSync(`${this.rootUpdatePath}com.pixflow.motionfactory.backup`);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Check the update pack is exists or not
   * this function check the extension is update before or not
   * @return {boolean}
   */
  isExtensionPackExists() {
    try {
      fs.accessSync(`${this.newVersionPath}com.pixflow.motionfactory`);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Create update folder path if its not exits
   * @return {void}
   */
  createUpdateFolder() {
    try {
      fs.accessSync(`${this.newVersionPath}`);
    } catch (e) {
      mkDirByPathSync(`${this.newVersionPath}`);
    }
  }

  /**
   * Restore backup on failure functions
   * @return {void}
   */
  restoreBackup() {
    if (this.isBackupExists()) {
      if (this.isExtensionPackExists()) {
        this.deleteFolderRecursive(
          `${this.newVersionPath}com.pixflow.motionfactory`
        );
      } else {
        fs.rename(
          `${this.rootUpdatePath}com.pixflow.motionfactory.backup`,
          `${this.newVersionPath}com.pixflow.motionfactory`,
          err => {
            if (err) {
              this.rollBack();
              throw err;
            }
          }
        );
      }
    }
  }

  /**
   * Backup old version
   * @return {Promise}
   */
  backupOldVersion() {
    return new Promise(resolve => {
      if (
        false === this.isBackupExists() &&
        true === this.isExtensionPackExists()
      ) {
        this.deleteFolderRecursive(
          `${this.rootUpdatePath}com.pixflow.motionfactory.backup`
        );

        fs.rename(
          `${this.newVersionPath}com.pixflow.motionfactory`,
          `${this.rootUpdatePath}com.pixflow.motionfactory.backup`,
          err => {
            if (err) {
              this.rollBack();
              throw err;
            }
            resolve();
          }
        );
      }
    });
  }

  /**
   * Unzip download file from server and clean memory on exit
   * @return {Promise}
   */
  processesDownloadFile() {
    const zip = new streamZip({
      file: this.updatePath,
      skipEntryNameValidation: false,
      storeEntries: true
    });
    return new Promise((resolve, reject) => {
      zip.on("ready", () => {
        zip.extract(null, this.rootUpdatePath, err => {
          if (err) {
            this.rollBack();
            this.restoreBackup();
            reject(err);
            throw err;
          }
          zip.close();
          resolve();
        });
      });
    });
  }

  /**
   * Check the patch file is exists or not
   * @return {boolean}
   */
  isPatchExits() {
    try {
      fs.accessSync(`${this.rootUpdatePath}/updatePack/patch.js`);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Run the patch file if exists
   * @return {void}
   */
  runUpdatePatchIfExists() {
    if (this.isPatchExits()) {
      require(`${this.rootUpdatePath}updatePack/patch.js`);
    }
  }

  /**
   * Unpack the original ZXP pack to the destination folder
   * @return {void}
   */
  processesUnpackFile() {
    const zip = new streamZip({
      file: `${this.rootUpdatePath}/updatePack/newVersion.zxp`,
      skipEntryNameValidation: false,
      storeEntries: true
    });
    return new Promise(resolve => {
      zip.on("ready", () => {
        zip.extract(null, this.newVersionPath, err => {
          if (err) {
            this.rollBack();
            this.restoreBackup();
            throw err;
          }
          zip.close();
          this.runUpdatePatchIfExists();
          if (this.runPluginChecker) {
            this.pluginChecker(this.newVersionPath);
          }
          if (typeof this.emitter === "function") {
            this.emitter("autoUpdater", { result: true });
          }
          this.rollBack();
          resolve();
        });
      });
    });
  }

  /**
   * run plugin checker
   * @return {void}
   */
  pluginChecker(extensionPath) {
    require("../lib/pluginInstaller")(
      extensionPath + "com.pixflow.motionfactory"
    );
  }

  /**
   * Delete folder not empty
   * This function should call in async function
   * @return {void}
   */
  deleteFolderRecursive(path) {
    if (fs.existsSync(path)) {
      rimraf.sync(path);
    }
  }

  /**
   * Check the ZIP file exists or not
   * @return {void}
   */
  isUpdatePackExits() {
    try {
      fs.accessSync(this.updatePath);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Rollback all data if update fails
   * @return {void}
   */
  rollBack() {
    if (this.isUpdatePackExits()) {
      fs.unlinkSync(this.updatePath);
    }
    this.deleteFolderRecursive(`${this.rootUpdatePath}/updatePack/`);
  }
}

const runUpdater = (versionDetails, emitter) => {
  versionDetails = JSON.parse(versionDetails);
  const updater = new AutoUpdater(
    versionDetails.currentVersion,
    emitter,
    versionDetails.runPluginChecker
  );
  updater.runUpdater();
};

module.exports.AutoUpdater = AutoUpdater;
module.exports.runUpdater = runUpdater;
