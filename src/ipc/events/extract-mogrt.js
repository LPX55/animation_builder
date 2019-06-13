const StreamZip = require('node-stream-zip');
const path = require('path');
const temp = require('temp');


/**
 * Init the mogrt extraction promise
 * @param   {string}    data        JSON String which contains mogrt file path
 * @param   {object}    emitter     Object to handle connection with IPC
 * @returns {void}
 */
const initExtract = (data, emitter) => {
    if (typeof (data) === 'undefined') {
        emitter("extractMogrt", { 'files': false, 'message': 'No JSON data has been provided' });
        return false;
    }

    const filePath = JSON.parse(data)['filePath'];

    if (filePath !== '') {
        createTempFolder().then((tmpAddress) => {
            readMogrtToExtract(filePath, tmpAddress)
                .then((funcResult) => {
                    extractMogrtFile(funcResult).then((finalResult) => {
                        emitter("extractMogrt", { 'files': finalResult, 'message': '' });
                    }).catch((finalError) => {
                        emitter("extractMogrt", { 'files': false, 'message': finalError });
                        throw finalError;
                    });
                })
                .catch((err) => {
                    emitter("extractMogrt", { 'files': false, 'message': err });
                });
        }).catch((e) => {
            emitter("extractMogrt", { 'files': false, 'message': e });
            throw e;
        });
    } else {
        emitter("extractMogrt", { 'files': false, 'message': 'No file path found in JSON' });
    }

}


/**
 * Create a temp Folder so we can start extract procedure in it
 * @returns {void}
 */
const createTempFolder = () => {
    return new Promise((resolve, reject) => {
        temp.mkdir('motion-factory-', function (err, dirPath) {
            if (err) {
                reject('Error in creating temp folder');
                return;
            }
            resolve(dirPath);
        });
    });
}


/**
 * Read the mogrt file and convert it to zip object
 * @param   {string}    fileName    Mogrt full path  
 * @param   {string}    tmpAddress  Temp folder address to extract files into it
 * @returns {void}
 */
const readMogrtToExtract = (fileName, tmpAddress) => {
    return new Promise((resolve, reject) => {
        if (typeof (fileName) === 'undefined') {
            reject('No file Name has been provided');
        } else {
            const zipObject = new StreamZip({
                file: fileName,
                storeEntries: true
            });
            zipObject.on('error', err => {
                reject('Error in reading the mogrt file');
            });
            zipObject.on('ready', () => {
                for (const entry of Object.values(zipObject.entries())) {
                    const fileExt = path.extname(entry.name);
                    if (fileExt === '.aegraphic') {
                        resolve({
                            'zipObject': zipObject,
                            'aegraphicFile': entry.name,
                            'tmpAddress': tmpAddress,
                            'fullPath': `${tmpAddress}/${entry.name}`
                        });
                    }
                }
                reject('No aegraphic file has been found');
            });
        }
    });
}


/**
 * Validate the mogrtinfo object to have correct properties
 * @param   {object}    mogrtInfo    An object which contains ZipObject and extract file path
 * @returns {boolean}   return true if the structure is correct , false if the structure is not correct
 */
const validteMogrtInfo = (mogrtInfo) => {

    if (typeof (mogrtInfo) !== 'undefined' &&
        typeof (mogrtInfo) === 'object' &&
        typeof (mogrtInfo.aegraphicFile) === 'string' &&
        typeof (mogrtInfo.tmpAddress) === 'string' &&
        typeof (mogrtInfo.zipObject) === 'object') {

        return true;

    }

    return false;
}


/**
 * extract zip object ( which is generated from mogrt ) if it contains aegraphic inside it
 * @param   {object}    mogrtInfo    An object which contains ZipObject and extract file path
 * @returns {void}
 */
const extractMogrtFile = (mogrtInfo) => {

    return new Promise((resolve, reject) => {

        const validMogrtInfo = validteMogrtInfo(mogrtInfo);

        if (!validMogrtInfo) {
            reject('No prober mogort info has been provided');
        }


        mogrtInfo.zipObject.extract(mogrtInfo.aegraphicFile, mogrtInfo.tmpAddress, err => {
            if (err) {
                reject('Error in extracting aegraphic file');
            }
            mogrtInfo.zipObject.close();
            return;
        });

        mogrtInfo.zipObject.on('extract', () => {
            const aeZipObject = new StreamZip({
                file: mogrtInfo.fullPath,
                storeEntries: true
            });
            aeZipObject.on('ready', () => {
                aeZipObject.extract(null, mogrtInfo.tmpAddress, (err) => {
                    if (err) {
                        reject('Error in extracting aegraphic file');
                    }
                    resolve(generateExtractedFilesList(aeZipObject, mogrtInfo.tmpAddress));
                });
            });
        });

    });
}


/**
 * Return an array which contains the ae files address which generated from mogrt extraction
 * @param   {object}    zipObject   zip object ( which generated from mogrt extraction procedure  )
 * @return  {void}     
 */
const generateExtractedFilesList = (zipObject, tmpAddress) => {
    let aepList = []
    for (const entry of Object.values(zipObject.entries())) {
        const fileExt = path.extname(entry.name);
        if (fileExt === '.aep') {
            const fullPath = path.join(tmpAddress, entry.name);
            aepList.push(fullPath);
        }
    }
    zipObject.close();
    return aepList;
}

module.exports.initExtract = initExtract;
module.exports.readMogrtToExtractTest = readMogrtToExtract;
module.exports.extractMogrtFileTest = extractMogrtFile;