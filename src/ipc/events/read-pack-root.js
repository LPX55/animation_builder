const fs = require("fs");
const path = require("path");
Promise = require("bluebird");
const uuidv4 = require("uuid/v4");

const isAllowedFile = require("../helpers/file-info").isAllowedFile;
const premiumPackName = require("../helpers/file-info").premiumPackName;
const categoryAllName = require("../helpers/file-info").categoryAllName;

/**
 * read root of pack including categories and all files
 * @return {void}
 */
exports.readPack = (data, emiter, currentUserID) => {
  const {
    path: directoryPath,
    allowedExtensions,
    allSupportedExtensions
  } = JSON.parse(data);
  let allExtensions = [];
  Object.keys(allowedExtensions).map(key => {
    allExtensions = allExtensions.concat(allowedExtensions[key]);
  });

  readDirectory(directoryPath, allExtensions, allSupportedExtensions)
    .then(result => {
      result.files = result.files
        .map(file => {
          file.itemDetail.videoPreview = isItemHasPreview(
            result.files,
            file.itemDetail.fileType,
            file.itemPath
          );
          return file;
        })
        .filter(file => !file.itemDetail.isPreview);
      emiter("readPack", {
        success: true,
        path: directoryPath,
        packsAndFiles: result
      });
    })
    .catch(e => {
      emiter("readPack", { success: false });
    });
};

/**
 * start reading a folder
 * @param {string} packPath - path of folder
 * @param {string[]} allowedExtensions - allowed extensions to use
 * @return {Promise}
 **/
const readDirectory = (packPath, allowedExtensions, allSupportedExtensions) => {
  return new Promise((resolve, reject) => {
    if (packPath === "") {
      resolve(0);
    } else {
      fs.readdir(packPath, (error, files) => {
        if (error) {
          reject();
        } else if (files.length === 0) {
          resolve(0);
        } else {
          processDirectoryFiles({
            packPath,
            files,
            resolve,
            allowedExtensions,
            allSupportedExtensions
          });
        }
      });
    }
  });
};

/**
 * loop given files array recursivly and resolve the promise
 * @param {string} path - path of folder
 * @param {any[]} files - array of files in parent
 * @param {any} resolve - resolver of parent promise
 * @param {string[]} allowedExtensions - allowed extensions to use
 * @return {void}
 **/
const processDirectoryFiles = ({
  packPath,
  files,
  resolve,
  allowedExtensions,
  allSupportedExtensions
}) => {
  let allItems = [],
    categories = [],
    itemsRead = 0;
  files.forEach(file => {
    fs.stat(packPath + "/" + file, (errorStat, stat) => {
      if (errorStat) {
        resolve(0);
      } else if (stat.isDirectory()) {
        categories.push({
          id: categories.length,
          lastFilesCountUpdate: 0,
          packName: file,
          packPath: packPath + "/" + file,
          packViewMode: "cover",
          packCover: ""
        });
        categories = categories.filter((item, pos, self) => {
          return self.indexOf(item) == pos;
        });
        itemsRead++;
        if (itemsRead === files.length) {
          resolve({ packs: categories, files: allItems });
        }
      } else {
        let isLocked = false;
        if (path.basename(packPath).toLowerCase() === premiumPackName) {
          isLocked = true;
        }

        let isPreview = false;
        if (isAllowedFile(packPath + "/" + file, allowedExtensions)) {
          isPreview = 0;
        } else if (
          file
            .split(".")
            .pop()
            .toLowerCase() === "mp4"
        ) {
          isPreview = 1;
        }
        if (isPreview === 1 || isPreview === 0)
          allItems.push({
            itemPath: packPath + "/" + file,
            itemDetail: {
              fileName: file,
              locked: isLocked,
              size: stat["size"],
              isPreview,
              fileType: fetchFileType(
                packPath + "/" + file,
                allSupportedExtensions
              )
            }
          });

        itemsRead++;
        if (itemsRead === files.length) {
          resolve({ packs: categories, files: allItems });
        }
      }
    });
  });
};

/**
 * detemine file type of a item from file path
 * @param {string} itemPath - item path
 * @return {string} file type
 **/
const fetchFileType = (itemPath, allSupportedExtensions) => {
  let fileType = "";
  const fileExtension = path
    .extname(itemPath)
    .substr(1)
    .toLowerCase();
  Object.keys(allSupportedExtensions).map(key => {
    if (allSupportedExtensions[key].includes(fileExtension)) {
      if (key === "video" || key === "image") {
        fileType = key;
      } else {
        fileType = fileExtension;
      }
    }
  });
  return fileType;
};

const isItemHasPreview = (items, fileType, filePath) => {
  let videoPreview =
    filePath
      .split(".")
      .slice(0, -1)
      .join(".") + ".mp4";
  if (fileType !== "image" && fileType !== "video") {
    if (
      items.filter(
        item => item.itemPath.toLowerCase() === videoPreview.toLowerCase()
      ).length === 0
    ) {
      videoPreview = undefined;
    }
  } else {
    videoPreview = undefined;
  }
  return videoPreview;
};
