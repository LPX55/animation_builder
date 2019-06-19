const StreamZip = require('node-stream-zip');
const path = require('path');

exports.installPack = (packPath, outPutPath) => {
    return new Promise((resolve, reject) => {
        const zipObject = new StreamZip({
            file: packPath,
            storeEntries: true
        });
        zipObject.on('error', err => {
            reject('Error in reading the pack');
        });
        zipObject.on('ready', () => {
            zipObject.extract(null, outPutPath, (err) => {
                if (err) {
                    reject('Error in reading the pack');
                }
                resolve(true);
            });
        });
    })
}