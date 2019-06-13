
const os = require('os');


// TODO: Refine this to singleton class

/**
   * check user is on mac platform or win
   * @return {string} platform MAC-WIN
**/
const currentPlatform = () => {
    if ('darwin' === os.platform()) {
        return 'MAC';
    } else {
        return 'WIN';
    }
}

/**
   * fetch a user info
   * @param {string} userData - attribute of user we want to get
   * @return {string} info wanted
**/
const getOSUserInfo = (userData) => {
    const OSUser = os.userInfo();
    if (userData) {
        return OSUser[userData];
    }
    return OSUser;
}

/**
   * Return path of new place of extension directory
   * @return {string} path of folder
**/
const getNewVersionOfExtensionPath = () => {
    let path;
    if (currentPlatform() === 'MAC') {
        path = `/Users/${getOSUserInfo('username')}/Library/Application Support/Adobe/CEP/extensions/`;
    } else {
        const appDataPath = process.env['APPDATA'].replace(/\\/g, '/');
        path = `${appDataPath}/Adobe/CEP/extensions/`;
    }
    return path;
}


/**
   * get motion factory data folder path
   * @return {string} path of folder in AppData
**/
const getMotionFactoryAppDataFolder = () => {
    let jsonFileDirectory;
    if (currentPlatform() === 'MAC') {
        jsonFileDirectory = `/Users/${getOSUserInfo('username')}/Library/Application Support/MotionFactory/`;
    } else {
        const appDataPath = process.env['APPDATA'].replace(/\\/g, '/');
        jsonFileDirectory = `${appDataPath}/MotionFactory/`;
    }
    return jsonFileDirectory;
}

/**
* Return the path of user file
* @return { string }
*/
const motionFactoryUserFileDirection = (userID) => {
    return `${getMotionFactoryAppDataFolder()}/${userID}`;
}

/**
 * Return the path of ffmpeg zipped
 * @return { string }
 */
const getFFMpegZipPath = () => {
    return ipc.ffmpegPath;
}

exports.getOSUserInfo = getOSUserInfo;
exports.getMotionFactoryAppDataFolder = getMotionFactoryAppDataFolder;
exports.currentPlatform = currentPlatform;
exports.motionFactoryUserFileDirection = motionFactoryUserFileDirection;
exports.getFFMpegZipPath = getFFMpegZipPath;
exports.getNewVersionOfExtensionPath = getNewVersionOfExtensionPath;
