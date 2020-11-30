const { series, watch, parallel } = require("gulp");
const browserSync = require("browser-sync").create();
const nodemon = require("gulp-nodemon");

function startBrowserSync() {
  browserSync.init(null, {
    proxy: "localhost:8080"
  });
}

function watchFiles() {
  watch(["views/**/*.html", "assets/**/*.scss"], function() {
    browserSync.reload();
  });
}

function startNodemon(cb) {
  var callbackCalled = false;
  return nodemon({
    script: "server.js"
  }).on("start", function() {
    if (!callbackCalled) {
      callbackCalled = true;
      cb();
    }
  });
}

exports.default = parallel(series(startNodemon, startBrowserSync), watchFiles);
