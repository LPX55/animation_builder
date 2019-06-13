/**
 * Copyright 2018 PixFlow
 * All rights reserved.
 */
"use strict";

const loadtextanimator = require("./tasks/development");
const preCommit = require("./tasks/pre-commit");
const checkRepoStatus = require("./tasks/git");
const buildIPC = require("./tasks/build-ipc");


module.exports = function (grunt) {
  grunt.initConfig({
    task: {
      buildIPC: {
        options: {
          mode: "release"
        }
      },
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
      case "buildIPC":
        buildIPC(this, done, grunt);
        break;
      case "precommit":
        preCommit(this, done, grunt);
        break;
      case "development":
        loadtextanimator(this, done, grunt);
        break;
      default:
        grunt.log.error("Task dose not found");
        break;
    }
  });
};
