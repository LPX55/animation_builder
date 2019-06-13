const isAllowedFile = require("../helpers/file-info").isAllowedFile;
const fs = require("fs");
Promise = require("bluebird");

/**
 * get data and start taking frames from video and emit result
 * @return {Promise}
 **/
exports.fileCount = (data, emiter) => {
  const { path, allowedExtensions, allSupportedExtensions } = JSON.parse(data);
  let allExtensions = [];
  Object.keys(allowedExtensions).map(key => {
    allExtensions = allExtensions.concat(allowedExtensions[key]);
  });
  fileCountInPath(path, allExtensions, allSupportedExtensions)
    .then(count => {
      if (count) {
        emiter("fileCount", { success: true, path, result: count });
      } else {
        emiter("fileCount", { success: false });
      }
    })
    .catch(err => {
      emiter("fileCount", { success: false });
    });
};

/**
 * this function count files in a pack
 * @param {string} path - path of folder
 * @param {string[]} allowedExtensions - allowed extensions to use
 * @return {Promise} number - of count of files
 **/
const fileCountInPath = (path, allowedExtensions, allSupportedExtensions) => {
  return new Promise((resolve, reject) => {
    if (path === "") {
      resolve(false);
    } else {
      fs.readdir(path, (error, files) => {
        if (error) {
          resolve(false);
        } else if (files.length === 0) {
          resolve(0);
        } else {
          processCountFiles(path, files, resolve, {
            allowedExtensions,
            allSupportedExtensions,
            haveCover: haveCover(path, files)
          });
        }
      });
    }
  });
};
exports.fileCountInPath = fileCountInPath;

/**
 * loop given files array recursivly and resolve the promise
 * @param {string} path - path of folder
 * @param {any[]} files - array of files in parent
 * @param {any} resolve - resolver of parent promise
 * @param {string[]} allowedExtensions - allowed extensions to use
 * @return {void}
 **/
const processCountFiles = (
  path,
  files,
  resolve,
  { allowedExtensions, allSupportedExtensions, haveCover }
) => {
  let fileCount = 0,
    itemsRead = 0,
    firstThree = [];
  files.forEach(file => {
    fs.stat(path + "/" + file, (errorStat, stat) => {
      if (errorStat) {
        resolve({ fileCount, firstThree });
      } else if (stat.isDirectory()) {
        fileCountInPath(
          path + "/" + file,
          allowedExtensions,
          allSupportedExtensions
        ).then(({ fileCount: count, firstThree: first3 }) => {
          fileCount += count ? count : 0;
          if (firstThree.length < 3)
            firstThree = firstThree.concat(
              first3 ? first3.slice(0, 3 - firstThree.length + 1) : []
            );
          itemsRead++;
          if (itemsRead === files.length) {
            resolve({ fileCount, firstThree, haveCover });
          }
        });
      } else {
        if (isAllowedFile(path + "/" + file, allowedExtensions)) {
          fileCount += 1;
          let cover = goodForModernView(
            path + "/" + file,
            allSupportedExtensions
          );
          if (firstThree.length < 3 && cover) firstThree.push(cover);
        }
        itemsRead++;
        if (itemsRead === files.length) {
          resolve({ fileCount, firstThree, haveCover });
        }
      }
    });
  });
};

const goodForModernView = (filePath, allSupportedExtensions) => {
  let cover = filePath;
  const videoPreview =
    cover
      .split(".")
      .slice(0, -1)
      .join(".") + ".mp4";
  if (fs.existsSync(videoPreview)) cover = videoPreview;
  const ext = cover
    .split(".")
    .pop()
    .toLowerCase();
  if (
    ext === "mogrt" ||
    allSupportedExtensions["video"].includes(ext) ||
    allSupportedExtensions["image"].includes(ext)
  ) {
    return cover;
  }
  return false;
};

const haveCover = (path, files) => {
  return files.map(file => file.toLowerCase()).includes("cover.png")
    ? `file://${path}/cover.png`
    : files.map(file => file.toLowerCase()).includes("cover.jpg")
    ? `file://${path}/cover.jpg`
    : false;
};
