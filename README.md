# gulp-requirejs-combine
====

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
  baseUrl: 'js/lib',
  paths: {
    jquery: 'jquery-1.9.0',
    react: 'react'
  }
});
```

### 2.use in gulp

more demo please see gulpfile
```js
var gulp = require('gulp');
var del = require('del');
var combine = require('gulp-requirejs-combine');
var config = {
  baseUrl: 'js/lib',
  paths: {
    jquery: 'jquery-1.9.0',
    react: 'react'
  }
};

var paths = {
  js: ['demo/require.js']
};

gulp.task('clean', function (cb) {
    del(['build'], cb);
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
    .pipe(gulp.dest('test/base/build'));
});
```

### 3.becareful about config

config is base on your gulpfile path. your need to config it base your gulpfile location.

```js
var config={
  baseUrl: './test/base',
  paths: {...
  }
}
```

## Problem

you are welcome to contribute

and problem you can task issue or contact me :andy.lv@live.com

