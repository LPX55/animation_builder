const assert = require('assert');
const fs = require('fs-extra');
const fileCountInPath = require('../src/ipc/events/file-count').fileCountInPath;

describe('File Count Tests', function() {
  before(done => {
    fs.mkdirSync('file-count-directory-test');
    fs.writeFileSync('file-count-directory-test/test1.png', '');
    fs.writeFileSync('file-count-directory-test/test2.mp4', '');
    fs.writeFileSync('file-count-directory-test/test3.mogrt', '');
    fs.writeFileSync('file-count-directory-test/test4.hmm', '');
    fs.mkdirSync('file-count-directory-test/cat1');
    fs.writeFileSync('file-count-directory-test/test5.png', '');
    done();
  });
  after(done => {
    fs.removeSync('file-count-directory-test');
    done();
  });
  it('should return count of files in test dir', done => {
    fileCountInPath('file-count-directory-test', ['png', 'mp4', 'mogrt'], {
      image: ['png'],
      video: ['mp4'],
      others: ['mogrt']
    }).then(count => {
      assert.deepEqual(count.fileCount, 4);
      done();
    });
  });
  it('should return false if path was empty', done => {
    fileCountInPath('', ['png', 'mp4', 'mogrt'], {
      image: ['png'],
      video: ['mp4'],
      others: ['mogrt']
    }).then(count => {
      assert.deepEqual(count, false);
      done();
    });
  });
  it('should return false if path not existed', done => {
    fileCountInPath('not-existed-path', ['png', 'mp4', 'mogrt'], {
      image: ['png'],
      video: ['mp4'],
      others: ['mogrt']
    }).then(count => {
      assert.deepEqual(count, false);
      done();
    });
  });
});
