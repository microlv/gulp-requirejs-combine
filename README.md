# gulp-requirejs-combine
combine requirejs file into one file. purpose is reduce http request.

## Install

Install with [npm](https://npmjs.org/package/gulp-requirejs-combine)

```
npm install --save-dev gulp-requirejs-combine
```

## DEMO
### 1.find out your config in requirejs

move config part into your gulpfile

```js
require.config({
  baseUrl: './test/base',
  paths: {
    jsonp: 'jsonp',
    load: 'load',
    xhr: 'xhr',
    nonce: 'var/nonce',
    rquery: 'var/rquery'
  }
});
```
==>>
```js
combine({
  baseUrl: './test/base',
  paths: {
    jsonp: 'jsonp',
    load: 'load',
    xhr: 'xhr',
    nonce: 'var/nonce',
    rquery: 'var/rquery'
  }
})
```

### 2.use in gulp

+ base use
```js
var gulp = require('gulp');
var del = require('del');
var combine = require('gulp-requirejs-combine');

var paths = {
  js: [
    'test/base/base1.js',
    'test/base/base2.js'
  ],
  complicatejs: [
    'test/complicate/require.js'
  ]
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
  return gulp.src(paths.js)
    .pipe(combine(baseConfig))
    .pipe(gulp.dest('test/base/build'));
});
```

+ uglify
```js
gulp.task('test:uglify', function () {
  return gulp.src(paths.js)
    .pipe(combine(baseConfig))
    .pipe(uglify())
    .pipe(gulp.dest('test/base/build'));
});
```
+ more demo please see gulpfile

### 3.be careful about config

config is base on your gulpfile path. your need to config it base on your gulpfile location.

```js
var config={
  baseUrl: './test/base',//base on where your gulpfile location.
  paths: {...
  }
}
```

### 4.run demo
+ install dependencies
```js
npm install gulp -g
npm install 
```
+ run demo
```js
gulp
gulp test:base
gulp test:complicate
```

## Problem

You are welcome to contribute

Any problem you can task issue or contact me :andy.lv@live.com

