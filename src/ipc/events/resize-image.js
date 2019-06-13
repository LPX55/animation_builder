const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const getFFMpegZipPath = require('../helpers/os-info').getFFMpegZipPath;
const imageSize = require('image-size');
const thumbnailDimensions = require('../helpers/file-info').thumbnailDimensions;
Promise = require("bluebird");


exports.resizeImage = (data, emiter, currentUserID, response, request, ipc) => {
    const imageURL = JSON.parse(data).imageURL;
    const supportedImageResizeFiles = ['BMP', 'CUR', 'GIF', 'ICNS', 'ICO', 'JPEG', 'JPG', 'PNG',
        'PSD', 'TIFF', 'WebP', 'SVG', 'DDS'];
    if (!supportedImageResizeFiles.includes(path.extname(imageURL).replace('.', '').toUpperCase())) {
        response.writeHead(200);
        response.end();
        return;
    }
    doResize(imageURL, ipc.ffmpegPath).then((responseData) => {
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
    });
}

/**
 * start resizing of image
 * @param {string} imageURL - image url
 * @return {void}
 */
const doResize = (imageURL, ffmpegPath) => {
    return new Promise((resolve, reject) => {
        const imageParts = [];
        if (ffmpegPath === '' || !ffmpegPath) {
            resolve(false);
            return;
        }
        fs.readFile(imageURL, (errorRead, imageFileBuffer) => {
            if (errorRead) {
                resolve(false);
                return;
            }
            const actualDimensions = imageSize(imageURL);
            const itemInfo = JSON.stringify({ dimensions: `${actualDimensions['width']}*${actualDimensions['height']}` });
            const newDimensions = calculateFrameSize([actualDimensions['width'], actualDimensions['height']]);
            const ffmpeg = spawn(ffmpegPath, [
                `-i`,
                imageURL,
                `-preset`,
                `ultrafast`,
                `-y`,
                `-vf`,
                `scale=${newDimensions[0]}:${newDimensions[1]}`,
                '-f',
                'image2pipe',
                '-vcodec',
                'png',
                'pipe:1'
            ], { stdio: ['pipe', 'pipe', 'pipe', 'pipe', 'pipe'] });

            ffmpeg.on('close', (code) => {
                if (code === 0 && imageParts.length > 0) {
                    resolve({
                        headers: {
                            'Content-Type': 'image/png',
                            'Access-Control-Allow-Origin': '*',
                            'Cache-Control': 'public, max-age=31557600, s-maxage=31557600',
                            'itemInfo': itemInfo
                        },
                        contents: imageParts
                    });
                } else {
                    resolve(false);
                }
            });
            ffmpeg.stdio[1].on('data', (buffer) => {
                imageParts.push(buffer);
            });

        });

    });
}
exports.doResize = doResize;

/**
 * resize image size keeping aspect ratio
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
