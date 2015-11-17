# gulp-requirejs-combine
combine requirejs file into one file.

## DEMO
### 1.find out your config in requirejs

move config into your gulpfile

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

gulp.task('combine', function () {
    return gulp.src(paths.js)
        .pipe(combine(config))
        .pipe(gulp.dest('build/js'));//output
});
```

