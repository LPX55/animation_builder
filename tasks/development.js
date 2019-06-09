const rimraf = require("fs-extra");

module.exports = (that, done, grunt) => {
  rimraf.writeFileSync(
    "./build/dist/index.html",
    '<meta http-equiv="refresh" content="0;url=http://localhost:4200/" />'
  );
  rimraf.copySync("./src/assets", "./build/dist/assets");
  grunt.task.run("task:dependencies").then(() => {
    grunt.task.run("cep:debug").then(() => {
      rimraf.removeSync("./build");
    });
  });
  done();
};
