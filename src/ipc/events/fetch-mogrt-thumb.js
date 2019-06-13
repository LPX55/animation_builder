const { spawn } = require('child_process');

const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');
Promise = require('bluebird');
captureVideoFrame = require('./fetch-video-frame').captureVideoFrame;
const gettextanimatorAppDataFolder = require('../helpers/os-info')
  .gettextanimatorAppDataFolder;

exports.fetchMogrtThumb = (
  data,
  emiter,
  currentUserID,
  response,
  request,
  ipc
) => {
  const mogrtUrl = JSON.parse(data).mogrtUrl;
  const fetchData = JSON.parse(data).fetchData;
  const video = JSON.parse(data).video;
  extractMogrtThumbnail(mogrtUrl, fetchData, video, ipc.ffmpegPath).then(
    responseData => {
      if (responseData) {
        response.writeHead(200, responseData.headers);
        responseData.contents.map(dataToWrite => {
          response.write(dataToWrite);
        });
        response.end();
      } else {
        response.writeHead(200);
        response.end();
      }
    }
  );
};

/**
 * extract thumnail of mogrt
 * @param {string} mogrtUrl - mogrt path
 * @param {number} fetchData - if data json reponsed or thumbail
 * @return {void}
 */
const extractMogrtThumbnail = (mogrtUrl, fetchData, video, ffmpegPath) => {
  return new Promise((resolve, reject) => {
    const fileExtension = path.extname(mogrtUrl);
    if (fileExtension !== '.mogrt') {
      resolve(false);
      return;
    }
    const zip = new AdmZip(mogrtUrl);
    if (fetchData) {
      fetchDataOfMogrt(zip).then(data => {
        resolve(data);
      });
      return;
    }
    if (
      zip
        .getEntries()
        .map(entry => entry.name.toString())
        .includes('thumb.mp4')
    ) {
      if (video) {
        fetchVideoContentOfMogrt(zip).then(data => {
          resolve(data);
        });
        return;
      } else {
        fetchVideoFrameOfMogrt(zip, ffmpegPath).then(data => {
          resolve(data);
        });
        return;
      }
    } else {
      fetchMogrtPicture(zip).then(data => {
        resolve(data);
      });
    }
  });
};
exports.extractMogrtThumbnail = extractMogrtThumbnail;

/**
 * resolves content of mogrt thumbnail
 * @param {object} zip zip object
 * @return {Promise}
 */
const fetchMogrtPicture = zip => {
  return new Promise(resolve => {
    zip.readAsTextAsync('definition.json', content => {
      if (!content) {
        resolve(false);
        return;
      }
      zip.readFileAsync('thumb.png', (imageBlob, errorZip) => {
        if (errorZip) {
          resolve(false);
          return;
        }
        resolve({
          headers: {
            'Content-Type': 'image/png',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=31557600, s-maxage=31557600',
            itemInfo: JSON.stringify(
              Object.assign(
                {},
                {
                  hasVideo: false
                },
                readJsonFileInMogrt(content)
              )
            )
          },
          contents: [imageBlob]
        });
      });
    });
  });
};

exports.fetchMogrtPicture = fetchMogrtPicture;

/**
 * resolves video frame of video in mogrt
 * @param {object} zip zip object
 * @param {string} ffmpegPath ffmpeg path
 * @return {Promise}
 */
const fetchVideoFrameOfMogrt = (zip, ffmpegPath) => {
  return new Promise(resolve => {
    zip.readFileAsync('thumb.mp4', (videoBlob, errorZip) => {
      fs.writeFileSync(
        `${gettextanimatorAppDataFolder()}/video-holder.mp4`,
        videoBlob
      );

      captureVideoFrame(
        `${gettextanimatorAppDataFolder()}/video-holder.mp4`,
        undefined,
        [0, 0],
        ffmpegPath
      ).then(responseData => {
        if (responseData) {
          zip.readAsTextAsync('definition.json', content => {
            if (!content) {
              resolve(false);
              return;
            }
            responseData.headers['itemInfo'] = JSON.stringify(
              Object.assign(
                {},
                {
                  hasVideo: true
                },
                JSON.parse(
                  responseData.headers ? responseData.headers['itemInfo'] : '{}'
                ),
                readJsonFileInMogrt(content)
              )
            );
            resolve(responseData);
          });
        } else {
          resolve(false);
        }
      });
    });
  });
};
exports.fetchVideoFrameOfMogrt = fetchVideoFrameOfMogrt;

/**
 * resolves content of mogrt json
 * @param {object} zip zip object
 * @return {Promise}
 */
const fetchDataOfMogrt = zip => {
  return new Promise(resolve => {
    zip.readAsTextAsync('definition.json', content => {
      if (!content) {
        resolve(false);
        return;
      }
      resolve({
        headers: {
          'Content-Type': 'application/json'
        },
        contents: [JSON.stringify(getMogrtsControllers(JSON.parse(content)))]
      });
      return;
    });
  });
};
exports.fetchDataOfMogrt = fetchDataOfMogrt;

/**
 * resolves video blob content in mogrt zip
 * @param {object} zip zip object
 * @return {Promise}
 */
const fetchVideoContentOfMogrt = zip => {
  return new Promise(resolve => {
    zip.readFileAsync('thumb.mp4', (videoBlob, errorZip) => {
      if (errorZip) {
        resolve(false);
        return;
      }
      resolve({
        headers: {
          'Content-Type': 'video/mp4',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=31557600, s-maxage=31557600'
        },
        contents: [videoBlob]
      });
    });
  });
};
exports.fetchVideoContentOfMogrt = fetchVideoContentOfMogrt;

/**
 * get needed controls of Mogart
 * @param {array} jsonContent array of controllers
 * @return {Array} controllers array
 */
const getMogrtsControllers = jsonContent => {
  if (Object.keys(jsonContent).includes('sourceInfoLocalized')) {
    sourceInfoObj =
      jsonContent.sourceInfoLocalized[
        Object.keys(jsonContent.sourceInfoLocalized)[0]
      ];
  } else {
    sourceInfoObj = jsonContent.sourceInfo;
  }
  const frameSize = sourceInfoObj.framesize.size;
  const controllers = jsonContent.clientControls.map((item, index) => {
    if (item.type === 6) {
      const regex = /(\r\n)+|\r+|\n+|\\r+|\\n+/g;
      if (regex.test(item.value.strDB[0].str)) {
        item.type = 100;
      }
    }
    return {
      canAnimate: item.canAnimate,
      type: item.type,
      name: item.uiName.strDB[0].str,
      value: item.value,
      frameSize: frameSize,
      min: item.min != null ? item.min : null,
      max: item.max != null ? item.max : null,
      item: item.id,
      index
    };
  });
  return controllers;
};
exports.getMogrtsControllers = getMogrtsControllers;

/**
 * process json file in mogrt file and return data to concat the original mogrtDetail
 * @param {string} content content of json file
 * @return {any}
 */
const readJsonFileInMogrt = content => {
  const mogrtDetail = {};
  const jsonContent = JSON.parse(content);
  mogrtDetail.name = jsonContent.capsuleName;
  if (mogrtDetail.name === '') {
    mogrtDetail.name = mogrtDetail.fileName;
  }
  let sourceInfoObj = {};

  if (Object.keys(jsonContent).includes('sourceInfoLocalized')) {
    sourceInfoObj =
      jsonContent.sourceInfoLocalized[
        Object.keys(jsonContent.sourceInfoLocalized)[0]
      ];
  } else {
    sourceInfoObj = jsonContent.sourceInfo;
  }
  mogrtDetail.duration =
    sourceInfoObj.duration.value / sourceInfoObj.duration.scale;
  mogrtDetail.width = sourceInfoObj.framesize.size.x;
  mogrtDetail.height = sourceInfoObj.framesize.size.y;
  if (Object.keys(jsonContent).includes('usedFontsLocalized')) {
    mogrtDetail.usedFonts =
      jsonContent.usedFontsLocalized[
        Object.keys(jsonContent.usedFontsLocalized)[0]
      ];
  } else {
    mogrtDetail.usedFonts = jsonContent.usedFonts;
  }

  return mogrtDetail;
};
exports.readJsonFileInMogrt = readJsonFileInMogrt;
