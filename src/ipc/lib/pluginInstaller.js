const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const StreamZip = require('node-stream-zip');
let extensionPath = '';
let lastPluginVersion = '';
module.exports = (exPath) => {
	extensionPath = exPath;
	lastPluginVersion = fs.readFileSync(`${extensionPath}/dist/assets/plug-ins/plugin-version.txt`);
	checkPluginInstalled();

};

/**
 * check current platform mac or win
 * @return {string}
 **/
const currentPlatform = () => {
	if ('darwin' === os.platform()) {
		return 'MAC';
	} else {
		return 'WIN';
	}
};

/**
 * get motion factory app data path
 * @return {string}
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
};

/**
 * get plugin format for platforms aex or plugin
 * @return {string}
 **/
const pluginExtension = () => {
	if ('MAC' === currentPlatform()) {
		return 'plugin';
	} else {
		return 'aex';
	}
};

/**
 * get user data
 * @param {string} userData - user param
 * @return {string}
 **/
const getOSUserInfo = (userData) => {
	const OSUser = os.userInfo();
	if (userData) {
		return OSUser[userData];
	}
	return OSUser;
};

/**
 * get adobe plugin path media core for every platforms
 * @return {string}
 **/
const getAdobePluginPath = () => {
	if ('MAC' === currentPlatform()) {
		const macAddress = `/Users/${getOSUserInfo('username')}/Library/Application Support/Adobe/Common/Plug-ins/7.0/MediaCore`;
		require('fs-extra').ensureDirSync(macAddress);
		return macAddress;
	} else {
		return `${path.parse(getOSUserInfo('homedir'))['root']}Program Files/Adobe/Common/Plug-ins/7.0/MediaCore`;
	}
};

/**
 * start unziping and installing plugins
 * @return {void}
 **/
const startInstallPlugin = () => {
	let pluginZipPath = '';
	if ('MAC' === currentPlatform()) {
		pluginZipPath = `${extensionPath}/dist/assets/plug-ins/MotionFactory.plugin.zip`;
	} else {
		pluginZipPath = `${extensionPath}/dist/assets/plug-ins/MotionFactoryWin.zip`;
	}
	extractPluginFolder(pluginZipPath, getMotionFactoryAppDataFolder())
		.then(() => {
			fs.renameSync(
				`${getMotionFactoryAppDataFolder()}MotionFactory.${pluginExtension()}`,
				`${getMotionFactoryAppDataFolder()}MotionFactory${lastPluginVersion}.${pluginExtension()}`
			);
			if ('MAC' !== currentPlatform()) {
				exec(`"${extensionPath}/dist/assets/pluginInstaller/win/MotionFactoryPlugin.exe"`);
			} else {
				require('child_process').execFile(`${getMotionFactoryAppDataFolder()}/MotionFactoryPlugin`);
			}
		})
		.catch(() => { });
};

/**
 * unzip a file to dist path
 * @param {string} MFPluginFile - source zip full path
 * @param {string} adobePluginFolderPath - destination unziping path
 * @return {Promise}
 **/
const extractPluginFolder = (MFPluginFile, adobePluginFolderPath) => {
	return new Promise((resolve, reject) => {
		const AdmZip = require('adm-zip');
		const zip = new AdmZip(MFPluginFile);
		zip.extractAllTo(adobePluginFolderPath, true);
		resolve();
	});
};

/**
 * check if a process running
 * @param {string} win - process name in windows
 * @param {string} mac - process name in mac
 * @return {Promise}
 **/
const isRunning = (win, mac) => {
	return new Promise(function (resolve) {
		const proc = 'MAC' !== currentPlatform() ? win : mac;
		if (proc === '') {
			resolve(false);
		}
		let allTasks = '';
		let tasksSpawn;
		if ('MAC' !== currentPlatform()) {
			tasksSpawn = spawn('tasklist');
		} else {
			tasksSpawn = spawn('ps', ['ax']);
		}
		tasksSpawn.stdout.on('data', (stdout) => {
			allTasks += stdout;
		});
		tasksSpawn.on('close', () => {
			resolve(allTasks.toLowerCase().indexOf(proc.toLowerCase()) > -1);
		});
	});
};

/**
 * check installed plugins
 * @return {void}
 **/
const checkPluginInstalled = () => {

	const pluginsToDelete = [];
	let isPluginInstalled = false;
	fs.readdir(getAdobePluginPath(), (errorReadDir, files) => {
		if (errorReadDir) return;
		files.map((file) => {
			if (file.includes('MotionFactory') && file.includes(`.${pluginExtension()}`)) {
				const filePluginVersion = file.replace(`.${pluginExtension()}`, '').replace('MotionFactory', '');
				if (filePluginVersion !== lastPluginVersion.toString()) {
					if ('MAC' === currentPlatform()) {
						pluginsToDelete.push(`${getAdobePluginPath()}/${file}`);
					} else {
						pluginsToDelete.push(`${getAdobePluginPath().replace(/\//g, '\\')}\\${file}`);
					}
				} else {
					isPluginInstalled = true;
				}
			}
		});
		if (!isPluginInstalled || pluginsToDelete.length > 0) {
			createBashInstallers();
		}
		fs.writeFileSync(
			`${getMotionFactoryAppDataFolder()}versionsToDelete.txt`,
			pluginsToDelete.join('\r\n') + '\r\n'
		);
		if (!isPluginInstalled || pluginsToDelete.length > 0) {
			waitForAfterEffectsToExit().then(() => {
				startInstallPlugin();
			});
		}
	});
};

/**
 * wait for after effects to be closed and run cleaner
 * @return {Promise}
 **/
const waitForAfterEffectsToExit = () => {
	return new Promise((resolve) => {
		global.interval = setInterval(() => {
			isRunning('AfterFX.exe', 'Adobe AfterEffects', 'AfterFX').then((running) => {
				if (!running) {
					clearInterval(global.interval);
					resolve(true);
				}
			});
		}, 2000);
	});
};

/**
 * create bash installers for mac
 * @return {Promise}
 **/
const createBashInstallers = () => {
	if (currentPlatform() === 'MAC') {
		fs.ensureDirSync(`/Users/${getOSUserInfo('username')}/Library/Application Support/Adobe/Common/Plug-ins/7.0/MediaCore`);
		const openAEPath = fs.readFileSync(`${getMotionFactoryAppDataFolder()}/host-version.txt`).toString();
		fs.writeFileSync(
			`${getMotionFactoryAppDataFolder()}/MotionFactoryPlugin`,
			`cd ~/Library/Application\\ Support/MotionFactory
cp -r MotionFactory*.plugin "/Users/${getOSUserInfo('username')}/Library/Application Support/Adobe/Common/Plug-ins/7.0/MediaCore"
rm -r MotionFactory*.plugin
${openAEPath}
while read p; do rm -r "$p"; done <versionsToDelete.txt
rm versionsToDelete.txt`,
			{
				mode: '777'
			}
		);
	}
};

