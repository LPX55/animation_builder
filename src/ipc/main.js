
process.on('uncaughtException', function (err) {
    console.log('Caught exception: ', err);
});
const Raven = require('raven');
const config = require('./config.js');
let envMode = 'dev';
if ((-1 !== __dirname.indexOf('com.pixflow.motionfactory'))) {
    Raven.config(config.ravenAPI).install();
    envMode = 'prod';
}
const IpcHandler = require('./lib/ipcHandler');
const fileCount = require('./events/file-count').fileCount;
const readPack = require('./events/read-pack-root').readPack;
const setIPCParams = require('./events/setIPCParams').setIPCParams;
const autoUpdater = require('./events/updater').runUpdater;
const fetchNodeEnv = require('./events/fetch-node-env').fetchNodeEnv;
const installDependencies = require('./events/install-dependencies').installDependencies;
const fetchVideoFrame = require('./events/fetch-video-frame').fetchVideoFrame;
const fetchMogrtThumb = require('./events/fetch-mogrt-thumb').fetchMogrtThumb;
const resizeImage = require('./events/resize-image').resizeImage;
const processFile = require('./events/process-file').processFile;
const { initExtract } = require('./events/extract-mogrt');

const ipc = new IpcHandler(config.serverIP, ('dev' !== envMode) ? parseInt(process.argv[3]) : 45032);
ipc.serve();

ipc.listenForEvent('fileCount', fileCount);
ipc.listenForEvent('readPack', readPack);
ipc.listenForEvent('setIPCParams', setIPCParams.bind(ipc, Raven));
ipc.listenForEvent('autoUpdater', autoUpdater.bind(ipc));
ipc.listenForEvent('fetchNodeEnv', fetchNodeEnv);
ipc.listenForEvent('installDependencies', installDependencies);
ipc.listenForEvent('fetchVideoFrame', fetchVideoFrame);
ipc.listenForEvent('fetchMogrtThumb', fetchMogrtThumb);
ipc.listenForEvent('resizeImage', resizeImage);
ipc.listenForEvent('processFile', processFile);
ipc.listenForEvent('exitIPC', (data, emitter) => {
    emitter('exitIPC', { result: true });
    process.exit();
});
ipc.listenForEvent('initExtract', initExtract.bind(ipc));

exports.ipc = ipc;