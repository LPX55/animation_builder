const assert = require("assert");
const fs = require('fs');
const { readMogrtToExtractTest } = require('../src/ipc/events/extract-mogrt');  
const { extractMogrtFileTest } = require('../src/ipc/events/extract-mogrt');  
const testMogrtVideoContent = fs.readFileSync(`${__dirname}/fetch-mogrt-assets/thumb.mp4`);
const mogrtVideoTestURL = `${__dirname}/fetch-mogrt-assets/mogrt-with-video.mogrt`;


describe("Reading Mogrt file Test", function () {
    it("should be false if no argument item passed", done => {
        readMogrtToExtractTest().then(()=>{
            done(1);
        }).catch(()=>{
            done();
        })
    });

    it("should be false if empty address passed", done => {
        readMogrtToExtractTest('').then(()=>{
            done(1);
        }).catch(()=>{
            done();
        })
    });

    it("should be false if non mogort address passed", done => {
        readMogrtToExtractTest(testMogrtVideoContent).then(()=>{
            done(1);
        }).catch(()=>{
            done();
        })
    });

    it("should be false if mogort passed with no aegraphic file inside", done => {
        readMogrtToExtractTest(mogrtVideoTestURL).then(()=>{
            done(1);
        }).catch(()=>{
            done();
        })
    });
});

describe("Reading Mogrt file Test", function () {

    it("should be false if no argument item passed", done => {
        extractMogrtFileTest().then(()=>{
            done(1);
        }).catch(()=>{
            done();
        })
    });

    it("should be false if no non object argument passed", done => {
        extractMogrtFileTest('').then(()=>{
            done(1);
        }).catch(()=>{
            done();
        })
    });

    it("should be false if wrong object argument passed", done => {
        extractMogrtFileTest({}).then(()=>{
            done(1);
        }).catch(()=>{
            done();
        })
    });

});
