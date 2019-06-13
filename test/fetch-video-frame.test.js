const assert = require("assert");
const fs = require("fs");
const os = require("os");
const { ffmpegTakeFrame, getVideoInfo, captureVideoFrame } = require('../src/ipc/events/fetch-video-frame');
const second1Content = fs.readFileSync(`${__dirname}/fetch-video-frame-assets/second1.png`).toString();
const halfFrameContent = fs.readFileSync(`${__dirname}/fetch-video-frame-assets/half-frame.png`).toString();
const videoTestURL = `${__dirname}/fetch-video-frame-assets/test.mp4`;
let ffmpegPath = '';
const getFFMPEGPath = () => {
    let jsonFileDirectory = '';
    if ('darwin' === os.platform()) {
        jsonFileDirectory = `/Users/${os.userInfo()['username']}/Library/Application Support/textanimator`;
    } else {
        const appDataPath = process.env['APPDATA'];
        jsonFileDirectory = `${appDataPath}/textanimator`;
    }
    let lastVersion = '';
    fs.readdirSync(jsonFileDirectory).map((file) => {
        if (file.includes('ffmpeg')) {
            lastVersion = file.replace('ffmpeg', '').replace('.exe', '');
        }
    });
    if ('darwin' === os.platform()) {
        return jsonFileDirectory + '/ffmpeg' + lastVersion;
    } else {
        return jsonFileDirectory + '/ffmpeg' + lastVersion + '.exe';
    }
}
describe("Fetch Video Frame Tests", function () {
    before(done => {
        ffmpegPath = getFFMPEGPath();
        done();
    });
    it("should return resized image content", done => {
        const expectedData = {
            headers: {
                'Content-Type': 'image/png',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=31557600, s-maxage=31557600'
            },
            contents: [second1Content]
        };
        ffmpegTakeFrame(videoTestURL, 1, [340, 190], ffmpegPath).then((data) => {
            let actualFrameContent = '';
            data.contents.map(content => {
                actualFrameContent += content.toString();
            });
            data.contents = [actualFrameContent];
            assert.deepEqual(data, expectedData);
            done();
        });
    });
    it("should return false if no video passed", done => {
        ffmpegTakeFrame('', 1, [340, 190], ffmpegPath).then((data) => {
            assert.equal(false, data);
            done();
        });
    });
    it("should return false if dimensions was not in right format", done => {
        ffmpegTakeFrame(videoTestURL, 1, [340, ''], ffmpegPath).then((data) => {
            assert.equal(false, data);
            done();
        });
    });
    it("should return false if second was longer than video duration", done => {
        ffmpegTakeFrame(videoTestURL, 200, [340, 190], ffmpegPath).then((data) => {
            assert.equal(false, data);
            done();
        });
    });
    it("should return false if no ffmpeg passed", done => {
        ffmpegTakeFrame(videoTestURL, 200, [340, 190], '').then((data) => {
            assert.equal(false, data);
            done();
        });
    });
    it("should return video info correctly", done => {
        const expectedData = {
            durationInSeconds: 5.37,
            frameSize: [340, 190],
            duration: '00:00:05.37',
            fps: 29
        };
        getVideoInfo(videoTestURL, ffmpegPath).then((data) => {
            assert.deepEqual(expectedData, data);
            done();
        });
    });

    it("should return false if no video passed", done => {
        getVideoInfo('', ffmpegPath).then((data) => {
            assert.equal(false, data);
            done();
        });
    });
    it("should return false if no ffmpeg passed", done => {
        getVideoInfo(videoTestURL, '').then((data) => {
            assert.equal(false, data);
            done();
        });
    });
    it("should return video half frame correctly", done => {
        const expectedData = {
            headers: {
                'Content-Type': 'image/png',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=31557600, s-maxage=31557600',
                itemInfo: JSON.stringify({ durationInSeconds: 5.37, frameSize: [340, 190], duration: "00:00:05.37", fps: 29 })
            },
            contents: [halfFrameContent]
        };
        captureVideoFrame(videoTestURL, undefined, undefined, ffmpegPath).then((data) => {
            let actualFrameContent = '';
            data.contents.map(content => {
                actualFrameContent += content.toString();
            });
            data.contents = [actualFrameContent];
            assert.deepEqual(data, expectedData);
            done();
        });
    });

    it("should return second 1 frame correctly", done => {
        const expectedData = {
            headers: {
                'Content-Type': 'image/png',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=31557600, s-maxage=31557600'
            },
            contents: [second1Content]
        };
        captureVideoFrame(videoTestURL, 1, [340, 190], ffmpegPath).then((data) => {
            let actualFrameContent = '';
            data.contents.map(content => {
                actualFrameContent += content.toString();
            });
            data.contents = [actualFrameContent];
            assert.deepEqual(data, expectedData);
            done();
        });
    });

    it("should return false if no video passed", done => {
        captureVideoFrame('', 1, [340, 190], ffmpegPath).then((data) => {
            assert.equal(data, false);
            done();
        });
    });

    it("should return false if no ffmpeg passed", done => {
        captureVideoFrame(videoTestURL, 1, [340, 190], '').then((data) => {
            assert.equal(data, false);
            done();
        });
    });
});

