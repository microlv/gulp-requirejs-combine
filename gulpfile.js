'use strict';

var gulp = require('gulp');
var del = require('del');
var combine = require('./combine');
var uglify = require('gulp-uglify');

var paths = {
  js: [
    'test/base/require.js',
    'test/complicate/require.js'
  ]
};

gulp.task('clean', function (cb) {
  del(['build'], cb);
});

gulp.task('default', function () {
  return gulp.src(paths.js)
    .pipe(combine({
      baseUrl: './test/base',
      paths: {
        jsonp: 'jsonp',
        load: 'load',
        xhr: 'xhr',
        nonce: 'var/nonce',
        rquery: 'var/rquery'
      }
    }))
    .pipe(uglify())
    .pipe(gulp.dest('test/base/build'));
});

gulp.task('test:base', function () {
  return gulp.src(paths.js)
    .pipe(combine({
      baseUrl: './test/base',
      paths: {
        jsonp: 'jsonp',
        load: 'load',
        xhr: 'xhr',
        nonce: 'var/nonce',
        rquery: 'var/rquery'
      }
    }))
    .pipe(uglify())
    .pipe(gulp.dest('test/base/build'));
});

gulp.task('test:uglify', function () {
  return gulp.src(paths.js)
    .pipe(combine({
      baseUrl: './test/base',
      paths: {
        jsonp: 'jsonp',
        load: 'load',
        xhr: 'xhr',
        nonce: 'var/nonce',
        rquery: 'var/rquery'
      }
    }))
    .pipe(uglify())
    .pipe(gulp.dest('test/base/build'));
});

gulp.task('test:complicate', function () {
  return gulp.src(paths.js)
    .pipe(combine({
      baseUrl: './test/complicate',
      paths: {
        jsonp: 'ajax/jsonp',
        load: 'ajax/load',
        xhr: 'ajax/xhr',
        parseHTML: 'core/parseHTML',
        ajax: 'event/ajax',
        alias: 'event/alias',
        nonce: 'ajax/var/nonce',
        rquery: 'ajax/var/rquery'
      },
      useStrict: true,
      output: 'buildOut.js',
      debug: true
    }))
    .pipe(gulp.dest('test/complicate/build'));
});