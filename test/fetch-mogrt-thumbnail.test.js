const assert = require("assert");
const fs = require('fs');
const {
  extractMogrtThumbnail,
  readJsonFileInMogrt,
  getMogrtsControllers
} = require("../src/ipc/events/fetch-mogrt-thumb");
const testMogrtJsonContent = fs.readFileSync(`${__dirname}/fetch-mogrt-assets/definition.json`);
const testMogrtThumbanilContent = fs.readFileSync(`${__dirname}/fetch-mogrt-assets/thumb.png`).toString();
const testMogrtVideoContent = fs.readFileSync(`${__dirname}/fetch-mogrt-assets/thumb.mp4`);
const mogrtTestURL = `${__dirname}/fetch-mogrt-assets/test.mogrt`;
const mogrtVideoTestURL = `${__dirname}/fetch-mogrt-assets/mogrt-with-video.mogrt`;


describe("Fetch Mogrt Thumbnail Tests", function () {
  it("should be false if none mogrt item passed", done => {
    extractMogrtThumbnail('', false).then(data => {
      assert.equal(data, false);
      done();
    });
  });
  it("should be return Mogrt data correctly", done => {
    const expectedData = {
      name: 'Circle-1',
      duration: 10.01,
      usedFonts: [],
      width: 1920,
      height: 1080
    }
    const actualData = readJsonFileInMogrt(testMogrtJsonContent);
    assert.deepEqual(expectedData, actualData);
    done();

  });

  it("should return Mogrt controllers data correctly", done => {
    const expectedData = JSON.parse('[{"canAnimate":true,"type":4,"name":"Color","value":[1,1,1,1],"frameSize":{"x":1920,"y":1080},"min":null,"max":null,"item":"9e4c39a7-39e8-4f9e-bb50-3f26156b45ed","index":0}]');
    const actualData = getMogrtsControllers(JSON.parse(testMogrtJsonContent));
    assert.deepEqual(expectedData, actualData);
    done();
  });

  it("should return Mogrt data and headers correctly", done => {
    const expectedData = {
      headers: {
        'Content-Type': 'application/json'
      },
      contents: [JSON.stringify(JSON.parse('[{"canAnimate":true,"type":4,"name":"Color","value":[1,1,1,1],"frameSize":{"x":1920,"y":1080},"min":null,"max":null,"item":"9e4c39a7-39e8-4f9e-bb50-3f26156b45ed","index":0}]'))]
    };
    extractMogrtThumbnail(mogrtTestURL, true).then(data => {
      assert.deepEqual(expectedData, data);
      done();
    });
  });
  it("should return Mogrt thumbnail and info in headers correctly", done => {
    const expectedData = {
      headers: {
        'Content-Type': 'image/png',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=31557600, s-maxage=31557600',
        'itemInfo': JSON.stringify({
          hasVideo: false,
          name: 'Circle-1',
          duration: 10.01,
          width: 1920,
          height: 1080,
          usedFonts: []

        })
      },
      contents: [testMogrtThumbanilContent]
    };

    extractMogrtThumbnail(mogrtTestURL, false).then(data => {

      data.contents[0] = data.contents[0].toString();
      assert.deepEqual(expectedData, data);
      done();
    });
  });

  it("should return Mogrt video content correctly", done => {
    const expectedData = {
      headers: {
        'Content-Type': 'video/mp4',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=31557600, s-maxage=31557600'
      },
      contents: [testMogrtVideoContent]
    };

    extractMogrtThumbnail(mogrtVideoTestURL, false, true).then(data => {
      assert.deepEqual(expectedData, data);
      done();
    });
  });
});
