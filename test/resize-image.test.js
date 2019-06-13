const assert = require("assert");
const fs = require("fs");
const os = require("os");

const doResize = require("../src/ipc/events/resize-image").doResize;
const resizedImageContent = fs.readFileSync(`${__dirname}/resize-image-assets/resized.jpg`).toString();
const imageTestURL = `${__dirname}/resize-image-assets/test.jpg`;
let ffmpegPath = '';
const getFFMPEGPath = () => {
    let jsonFileDirectory = '';
    if ('darwin' === os.platform()) {
        jsonFileDirectory = `/Users/${os.userInfo()['username']}/Library/Application Support/MotionFactory`;
    } else {
        const appDataPath = process.env['APPDATA'];
        jsonFileDirectory = `${appDataPath}/MotionFactory`;
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
describe("Resize Image Tests", function () {
    before(done => {
        ffmpegPath = getFFMPEGPath();
        done();
    });
    it("should return resized image content", done => {
        const expectedData = {
            headers: {
                'Content-Type': 'image/png',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=31557600, s-maxage=31557600',
                'itemInfo': JSON.stringify({ dimensions: '3000*2000' })
            },
            contents: [resizedImageContent]
        };
        doResize(imageTestURL, ffmpegPath).then(data => {
            let actualResizedContent = '';
            data.contents.map(content => {
                actualResizedContent += content.toString();
            });
            data.contents = [actualResizedContent];
            assert.deepEqual(data, expectedData);
            done();
        });
    });
    it("should return false if corrupted image passed", done => {
        doResize(`${__dirname}/resize-image-assets/resized-not-exists.jpg`, ffmpegPath).then(data => {
            assert.equal(data, false);
            done();
        });
    });
    it("should return false if no image passed", done => {
        doResize('', ffmpegPath).then(data => {
            assert.equal(data, false);
            done();
        });
    });
    it("should return false if ffmpeg does not exists", done => {
        doResize(imageTestURL, '').then(data => {
            assert.equal(data, false);
            done();
        });
    });
});