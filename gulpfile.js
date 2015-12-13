'use strict';

var gulp = require('gulp');
var del = require('del');
var combine = require('./src');
var uglify = require('gulp-uglify');

var paths = {
  basejs: [
    'test/base/base1.js',
    'test/base/base2.js'
  ],
  complicatejs: [
    'test/complicate/require.js'
  ],
  browerifyjs: ['test/browerify/browerify.js']
};

gulp.task('clean', function (cb) {
  del(['build'], cb);
});

var baseConfig = {
  baseUrl: './test/base',
  paths: {
    jsonp: 'jsonp',
    load: 'load',
    xhr: 'xhr',
    nonce: 'var/nonce',
    rquery: 'var/rquery'
  }
};

gulp.task('default', function () {
  return gulp.src(paths.basejs)
    .pipe(combine(baseConfig))
    .pipe(gulp.dest('test/base/build'));
});

gulp.task('test:uglify', function () {
  return gulp.src(paths.basejs)
    .pipe(combine(baseConfig))
    .pipe(uglify())
    .pipe(gulp.dest('test/base/build'));
});

gulp.task('test:complicate', function () {
  return gulp.src(paths.complicatejs)
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
      debug: true
    }))
    .pipe(uglify())
    .pipe(gulp.dest('test/complicate/build'));
});

gulp.task('test:browerify', function () {
  return gulp.src(paths.browerifyjs)
    .pipe(combine({
      browerify: true,
      useStrict: true,
      debug: true
    }))
    .pipe(gulp.dest('test/browerify/build'));
});
