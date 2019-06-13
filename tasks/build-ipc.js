const path = require('path');
const fs = require('fs-extra');

module.exports = (that, done, grunt) => {
    const { compile } = require('nexe');
    const inputFile = `${path.dirname(__dirname)}/build/dist/server/main.js`;
    const outputDir = `${path.dirname(__dirname)}/build/dist/assets/ipc-server`;
    fs.mkdir(outputDir, (err) => {
        if (err && err['code'] !== 'EEXIST') {
            throw err;
        }
        grunt.log.write('Building Windows IPC...').ok();
        buildIPC(compile, { inputFile, outputDir, target: 'windows-x86-10.15.0' }).then(() => {
            grunt.log.write('Building MacOS IPC...').ok();
            buildIPC(compile, { inputFile, outputDir, target: 'darwin-x64-v10.15.0' }).then(() => {
                grunt.log.write('Archiving...').ok();
                archiveIPC(outputDir).then(() => {
                    grunt.log.write('IPC Archived...').ok();
                    grunt.log.write('Removing sources...').ok();
                    removeSources(outputDir).then(() => {
                        grunt.log.write('IPC build Done...').ok();
                        done();
                    });
                });
            });
        });
    });
};

const buildIPC = (compile, { inputFile, outputDir, target }) => {
    return new Promise((resolve) => {
        compile({
            input: inputFile,
            output: `${path.join(outputDir, 'ipc')}`,
            targets: target
        }).then(() => {
            resolve();
        });
    });
};

const archiveIPC = (inputDir) => {
    return new Promise((resolve) => {
        const archiver = require('archiver');
        const archive = archiver('zip', { zlib: { level: 9 } });
        const output = fs.createWriteStream(`${path.join(inputDir, 'ipc.zip')}`);
        archive.file(`${path.join(inputDir, 'ipc.exe')}`, { name: 'ipc.exe' });
        archive.file(`${path.join(inputDir, 'ipc')}`, { name: 'ipc' });
        archive.pipe(output);
        archive.finalize();
        output.on('close', () => {
            resolve();
        });
    });
};

const removeSources = (inputDir) => {
    return new Promise((resolve) => {
        fs.unlink(`${path.join(inputDir, 'ipc.exe')}`, (errWinIPC) => {
            if (errWinIPC) {
                throw errWinIPC;
            }
            fs.unlink(`${path.join(inputDir, 'ipc')}`, (errMacIPC) => {
                if (errMacIPC) {
                    throw errMacIPC;
                }
                fs.remove(`${path.join(inputDir, '../../ipc')}`, (errIPC) => {
                    if (errIPC) {
                        throw errIPC;
                    }
                    fs.remove(`${path.join(inputDir, '../../server')}`, (errServer) => {
                        if (errServer) {
                            throw errServer;
                        }
                        resolve();
                    });
                });
            });
        });
    });
};