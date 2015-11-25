'use strict';

var gulp = require('gulp');
var del = require('del');
var combine = require('./combine');

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
        jsonp: 'jsonp',
        load: 'load',
        xhr: 'xhr',
        nonce: 'var/nonce',
        rquery: 'var/rquery'
      }
    }))
    .pipe(gulp.dest('build'));
});

//var config = require('./test/browerify/config');
//gulp.task('test:browerify', function () {
//  return gulp.src('test/browerify/require.js')
//    .pipe(combine(config))
//    .pipe(gulp.dest('build/js'));
//});