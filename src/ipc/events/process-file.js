const fs = require('fs');
const path = require('path');
const isAllowedFile = require('../helpers/file-info').isAllowedFile;

/**
   * process a file and determine the filesize and video preview of file
   * @return {void}
**/
exports.processFile = (data, emiter, currentUserID) => {
    const filePath = JSON.parse(data).filePath;
    const allowedExtensions = JSON.parse(data).allowedExtensions;
    let allExtensions = [];
    Object.keys(allowedExtensions).map((key) => {
        allExtensions = allExtensions.concat(allowedExtensions[key]);
    });
    const fileFormat = path.extname(filePath).substr(1).toLowerCase();
    if ('mp4' === fileFormat || isAllowedFile(filePath, allExtensions)) {
        fs.stat(filePath, (err, stat) => {
            if (err) {
                emiter('processFile', { success: false });
            } else {
                if (allowedExtensions.others.includes(fileFormat)) {
                    const videoPreview = filePath.replace(filePath.split('.').pop(), 'mp4');
                    fs.stat(videoPreview, (errPreview, statPreview) => {
                        if (errPreview) {
                            emiter('processFile', { success: true, fileSize: stat['size'] });
                        } else {
                            emiter('processFile', { success: true, fileSize: stat['size'], videoPreview });
                        }
                    });
                } else {
                    emiter('processFile', { success: true, fileSize: stat['size'] });
                }
            }
        });
    } else {
        emiter('processFile', { success: false });
    }
}

