/**
 * Copyright 2018 PixFlow
 * All rights reserved.
 */
"use strict";

const loadMotionFactory = require("./tasks/development");
const preCommit = require("./tasks/pre-commit");
const checkRepoStatus = require("./tasks/git");


module.exports = function (grunt) {
  grunt.initConfig({
    task: {
      development: {
        options: {
          mode: "hmr"
        }
      },
      precommit: {
        target: {
          branch: "release"
        }
      },
      git: {
        targetFiles: [
          "update/update.zip"
        ]
      }
    }
  });

  grunt.loadNpmTasks("grunt-then");
  grunt.registerMultiTask("task", function () {
    const done = this.async();
    switch (this.target) {
      case "git":
        checkRepoStatus(this, done, grunt);
        break;
      case "precommit":
        preCommit(this, done, grunt);
        break;
      case "development":
        loadMotionFactory(this, done, grunt);
        break;
      default:
        grunt.log.error("Task dose not found");
        break;
    }
  });
};
