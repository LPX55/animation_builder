const { currentPlatform, getOSUserInfo, gettextanimatorAppDataFolder } = require('./../helpers/os-info');
const fs = require('fs');
const os = require('os');
const path = require('path');

/**
 * Install Dependencies
 * @param {string}  requestData  Request data
 * @return {void}
 */
const installDependencies = (requestData, emitter) => {
	const { runPluginChecker, appVersion, checkInstalled, extensionPath } = JSON.parse(requestData);

	if (checkInstalled) {
		checkPluginInstalled(extensionPath).then((restartNeeded) => {
			emitter('installDependencies', {
				restartNeeded
			});
		});
		return;
	}
	if (runPluginChecker) {
		pluginChecker(extensionPath);
		emitter('installDependencies', {
			success: true
		});
	}
};
module.exports.installDependencies = installDependencies;

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
 * start plugin checker
 * @return {void}
 **/
const pluginChecker = (extensionPath) => {
	require('../lib/pluginInstaller')(extensionPath);
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
 * check installed plugins
 * @return {void}
 **/
const checkPluginInstalled = (extensionPath) => {
	return new Promise((resolve) => {
		const pluginsToDelete = [];
		let isPluginInstalled = false;
		const lastPluginVersion = fs.readFileSync(`${extensionPath}/dist/assets/plug-ins/plugin-version.txt`);

		fs.readdir(getAdobePluginPath(), (errorReadDir, files) => {
			if (errorReadDir) return;
			files.map((file) => {
				if (file.includes('textanimator') && file.includes(`.${pluginExtension()}`)) {
					const filePluginVersion = file.replace(`.${pluginExtension()}`, '').replace('textanimator', '');
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
				resolve(true);
			} else {
				resolve(false);
			}
		});
	});
};
