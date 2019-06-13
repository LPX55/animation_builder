const fs = require('fs');
const path = require('path');
Promise = require("bluebird");

// premium folder name - all items under this will become locked
const premiumPackName = 'premium-pack';
// category that files in pack root goes into
const categoryAllName = 'Uncategorized';
// the width and height of every thumbnail
const thumbnailDimensions = [340, 191];

/**
   * checks if we can read this file or not
   * @param {string} path - path of file
   * @param {string[]} allowedExtensions - file extensions we are able to read
   * @return {boolean} boolean if directory true
**/
const isAllowedFile = (path, allowedExtensions) => {
    const fileFormat = path.split('.').pop().toLowerCase();
    const fileName = path.split('/').pop();
    if (fileFormat === 'mp4') {
        const splitPath = path.split('.').pop();
        return !fs.existsSync(path.replace(splitPath, 'mogrt')) &&
            !fs.existsSync(path.replace(splitPath, 'prproj')) &&
            !fs.existsSync(path.replace(splitPath, 'ffx')) &&
            !fs.existsSync(path.replace(splitPath, 'aep'));
    } else {
        return allowedExtensions.includes(fileFormat) &&
            fileName.toLowerCase() !== 'cover.png' && fileName.toLowerCase() !== 'cover.jpg';
    }
}

/**
   * checks if a given path is a directory
   * @param {string} path - path of folder
   * @return {boolean} boolean if directory true
**/
const isPathDirectory = (path) => {
    return path.split('.').length === 1;
}

/**
    * checks if a item is Premium
    * @param {string} itemPath - path of file
    * @return {boolean} filename if locked return filename else false
 **/
const isItemLocked = (itemPath) => {
    const parentCategoryPath = path.dirname(itemPath).toString();
    if (parentCategoryPath.toLowerCase().indexOf(this.premiumPackName) > -1) {
        return true;
    }
    return false;
}

/**
   * checks if a file has video preview or not
   * @param {string} filePath - path of file
   * @return {Promise} result true resolves the function viceversa
**/
const fileHasPreview = (filePath) => {
    return new Promise((resolve, reject) => {
        const fileType = filePath.split('.').pop().toLowerCase();
        if (['mogrt', 'prproj', 'aep', 'ffx'].includes(fileType)) {
            let videoFile = filePath.split('.');
            videoFile[1] = 'mp4';
            videoFile = videoFile.join('.');
            fs.access(videoFile, (err) => {
                if (!err) {
                    resolve(videoFile);
                } else {
                    reject();
                }
            });
        } else if (fileType === 'avi' || fileType === 'mov' || fileType === 'mp4') {
            resolve(filePath);
        }
    });
}

/**
   * create directory recursively
   * @param {string} targetDir - path of directory to create
   * @return {string}
**/
const mkDirByPathSync = (targetDir, { isRelativeToScript = false } = {}) => {
    const sep = '/';
    const initDir = path.isAbsolute(targetDir) ? sep : '';
    const baseDir = isRelativeToScript ? __dirname : '.';

    return targetDir.split(sep).reduce((parentDir, childDir) => {
        const curDir = path.resolve(baseDir, parentDir, childDir);
        try {
            fs.mkdirSync(curDir);
        } catch (err) {
            if (err.code === 'EEXIST') {
                return curDir;
            }

            if (err.code === 'ENOENT') {
                throw new Error(`EACCES: permission denied, mkdir '${parentDir}'`);
            }

            const caughtErr = ['EACCES', 'EPERM', 'EISDIR'].indexOf(err.code) > -1;
            if (!caughtErr || caughtErr && targetDir === curDir) {
                throw err; // Throw if it's just the last created dir.
            }
        }

        return curDir;
    }, initDir);
}

exports.isAllowedFile = isAllowedFile;
exports.isPathDirectory = isPathDirectory;
exports.fileHasPreview = fileHasPreview;
exports.isItemLocked = isItemLocked;
exports.premiumPackName = premiumPackName;
exports.categoryAllName = categoryAllName;
exports.mkDirByPathSync = mkDirByPathSync;
exports.thumbnailDimensions = thumbnailDimensions;
