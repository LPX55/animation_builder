const StreamZip = require('node-stream-zip');
const path = require('path');
const fsextra = require('fs-extra');

exports.installPack = (packPath, outPutPath) => {
    return new Promise((resolve, reject) => {
    try{
            removePack(path.join(outPutPath, 'Premium'));
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
    }
        catch(e){
            reject(e);
        }
    })
}

const removePack = (packPath)=>{
    try{
        if(fsextra.existsSync(packPath)){
        fsextra.removeSync(packPath); 
        }
    }
    catch(err){
        console.log(err);
    }
}
