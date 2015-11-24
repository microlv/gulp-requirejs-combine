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

gulp.task('test:base', function () {
  return gulp.src('test/base/require.js')
    .pipe(combine({
      baseUrl: './test/base',
      paths: {
        jsonp: 'ajax/jsonp',
        load: 'ajax/load',
        xhr: 'ajax/xhr',
        nonce: 'ajax/var/nonce',
        rquery: 'ajax/var/rquery'
      }
    }))
    .pipe(gulp.dest('build/js'));
});