const {
  spawn
} = require('child_process');
const http = require('http');
const thumbnailDimensions = require('../helpers/file-info').thumbnailDimensions;
const getMotionFactoryAppDataFolder = require('../helpers/os-info').getMotionFactoryAppDataFolder;
Promise = require("bluebird");
const AdmZip = require('adm-zip');

exports.fetchVideoFrame = (data, emiter, currentUserID, response, request, ipc) => {
  let videoURL = JSON.parse(data).videoURL;
  const second = JSON.parse(data).second;
  const videoWidth = JSON.parse(data).videoWidth;
  const videoHeight = JSON.parse(data).videoHeight;
  if (videoURL.split('.').pop().toLowerCase() === 'mogrt') {
    getVideoContentOfURL(videoURL).then((videoContent) => {
      if (videoContent) {
        videoURL = `${getMotionFactoryAppDataFolder()}/video-holder.mp4`;
        captureVideoFrame(videoURL, second, [videoWidth, videoHeight], ipc.ffmpegPath).then((responseData) => {
          sendResponse(responseData, response);
        });
      } else {
        sendResponse(false, response);
      }
    });
  } else {
    captureVideoFrame(videoURL, second, [videoWidth, videoHeight], ipc.ffmpegPath).then((responseData) => {
      sendResponse(responseData, response);
    });
  }

}

/**
 * read response data and do the response
 * @param {any} responseData - response data object
 * @param {any} response - responser
 * @return {void}
 */
const sendResponse = (responseData, response) => {
  if (responseData) {
    response.writeHead(200, responseData.headers);
    responseData.contents.map((dataToWrite) => {
      response.write(dataToWrite);
    });
    response.end();
  } else {
    response.writeHead(200);
    response.end();
  }
}

/**
 * capture frame of video
 * @param {string} videoURL - video path
 * @param {number} second - second of video to extract frame
 * @param {number[]} videoDimensions - dimensions of video
 * @return {Promise}
 */
const captureVideoFrame = (videoURL, second, videoDimensions, ffmpegPath, pipeData) => {
  return new Promise((resolve) => {
    if (!second) {
      getVideoInfo(videoURL, ffmpegPath, pipeData).then((videoInfo) => {
        if (videoInfo) {
          second = videoInfo.durationInSeconds / 2;
          const newDimensions = calculateFrameSize(videoInfo.frameSize);
          ffmpegTakeFrame(videoURL, second, newDimensions, ffmpegPath, pipeData).then((dataToWrite) => {
            if (dataToWrite) {
              dataToWrite.headers['itemInfo'] = JSON.stringify(videoInfo)
            }
            resolve(dataToWrite);
          });
        } else {
          resolve(false);
        }
      });
    } else {
      const newDimensions = calculateFrameSize(videoDimensions);
      ffmpegTakeFrame(videoURL, second, newDimensions, ffmpegPath, pipeData).then((dataToWrite) => {
        resolve(dataToWrite);
      });
    }

  });
}
exports.captureVideoFrame = captureVideoFrame;

/**
 * get content of given url
 * @param {string} videoURL - url
 * @return {Promise}
 */
const getVideoContentOfURL = (videoURL) => {
  return new Promise((resolve) => {

    const zip = new AdmZip(videoURL);

    zip.readFileAsync('thumb.mp4', (videoBlob, errorZip) => {
      if (errorZip) {
        resolve(false);
        return;
      }
      fs.writeFileSync(`${getMotionFactoryAppDataFolder()}/video-holder.mp4`, videoBlob);
      resolve(true);
    });
  });
}
exports.getVideoContentOfURL = getVideoContentOfURL;

/**
 * resize frame size keeping aspect ratio
 * @param {number[]} dimensions - [width, height]
 * @return {number[]}
 */
const calculateFrameSize = (dimensions) => {
  if (dimensions[0] > thumbnailDimensions[0] || dimensions[1] > thumbnailDimensions[1]) {
    if (dimensions[0] / dimensions[1] < thumbnailDimensions[0] / thumbnailDimensions[1]) {
      dimensions = [dimensions[0] / dimensions[1] * thumbnailDimensions[1], thumbnailDimensions[1]];
    } else {
      dimensions = [thumbnailDimensions[0], dimensions[1] / dimensions[0] * thumbnailDimensions[0]];
    }
  }
  return dimensions;
}

/**
 * take frame of video in ffmpeg
 * @param {string} videoURL - video path
 * @param {number} second - second of video to extract frame
 * @param {number[]} newDimensions - minimized dimensions in ratio of requsted thumbnail
 * @return {void}
 */
const ffmpegTakeFrame = (videoURL, second, newDimensions, ffmpegPath) => {
  return new Promise((resolve) => {
    const frames = [];
    const headers = {
      'Content-Type': 'image/png',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=31557600, s-maxage=31557600'
    };
    if (ffmpegPath === '' || !ffmpegPath) {
      resolve(false);
      return;
    }
    const args = [
      '-ss',
      second.toString(),
      '-i',
      videoURL,
      '-vf',
      `scale=${newDimensions[0]}:${newDimensions[1]}`,
      '-preset',
      'ultrafast',
      '-vframes',
      1,
      '-f',
      'image2pipe',
      '-vcodec',
      'png',
      'pipe:1'
    ];
    const ffmpeg = spawn(ffmpegPath, args, {
      stdio: ['pipe', 'pipe', 'pipe', 'pipe', 'pipe']
    });
    ffmpeg.on('close', (code) => {
      if (code === 0 && frames.length > 0) {
        resolve({
          headers,
          contents: frames
        });
      } else {
        resolve(false);
      }
    });
    ffmpeg.stdio[1].on('data', (buffer) => {

      frames.push(buffer);
    });
  });
}
exports.ffmpegTakeFrame = ffmpegTakeFrame;

/**
 * fetch video info from ffmpeg
 * @param {string} videoURL - video path
 * @return {Promise}
 */
const getVideoInfo = (videoURl, ffmpegPath) => {

  return new Promise((resolve, reject) => {

    if (ffmpegPath === '' || !ffmpegPath) {
      resolve(false);
      return;
    }
    let data = '';
    const args = [
      `-i`,
      videoURl,
    ];
    const im = spawn(ffmpegPath, args, {
      stdio: ['pipe', 'pipe', 'pipe', 'pipe', 'pipe']
    });
    im.stderr.on('data', (stdout) => {
      data += stdout;
    });
    im.on('close', (code) => {

      if (!data.includes('At least one output file must be specified')) {
        resolve(false);
        return;
      }
      resolve(getVideoDetails(data.toString()));
    });
  });
}
exports.getVideoInfo = getVideoInfo;

/**
 * process data from ffmpeg to get info of video
 * @param {string} data - data got from ffmpeg stdio
 * @return {object}
 */
getVideoDetails = (data) => {
  let frameSize = '';
  data.substring(data.lastIndexOf('Video:') + 10, data.lastIndexOf('tbr')).split(',').map((splited) => {
    if (splited.indexOf('x') > -1) {
      frameSize = splited.split('[')[0].trim().split('x').map(size => parseInt(size, 10));
    }
  });
  const duration = data.substring(data.lastIndexOf('Duration: ') + 10, data.lastIndexOf('tbr')).split(',')[0].trim();
  const fps = parseInt(data.substring(data.lastIndexOf('Video:') + 6, data.lastIndexOf('tbr')).split(',').pop().trim(), 10);
  const splitedFrames = duration.split('.')[0].split(':');

  const durationInSeconds = ((parseInt(splitedFrames[0], 10) * 3600) + (parseInt(splitedFrames[1], 10) * 60) +
    (parseInt(splitedFrames[2], 10))) + parseInt(duration.split('.')[1], 10) / 100;
  return {
    durationInSeconds,
    frameSize,
    duration,
    fps
  };
}
