const git = require("simple-git");

module.exports = (that, done, grunt) => {
  grunt.log.write("Checking repo status...").ok();
  git().status((error, status) => {
    if (error) {
      throw error;
    }
    
    const targetFiles = that.data.targetFiles;
    status.files.forEach(file => {
      if (-1 !== targetFiles.indexOf(file.path) && -1 === status.staged.indexOf(file.path) ) {
        process.exit(1);
      }
    });
    done();
  });
};

