'use strict';

var gulp = require('gulp');
var del = require('del');
var combine = require('./combine');
var config = require('./demo/config');

var paths = {
  js: ['demo/require.js']
};

gulp.task('clean', function (cb) {
  del(['build'], cb);
});

gulp.task('default', function () {
  return gulp.src(paths.js)
    .pipe(combine(config))
    .pipe(gulp.dest('build/js'));
});

