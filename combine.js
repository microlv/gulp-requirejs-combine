'use strict';

var defaults = require('defaults');
var through2 = require('through2');
var mkdirp = require('mkdirp');
var path = require('path');
var fs = require('fs');

function combine(opt) {
    opt = opt || {};

    var options = defaults(opt, {
        cwd: process.cwd()
    });

    if (typeof options.mode === 'string') {
        options.mode = parseInt(options.mode, 8);
    }

    var cwd = path.resolve(options.cwd);

    var root = opt.root;

    loop(opt.folders);

    function loop(folder) {
        for (var f in folder) {
            var val = folder[f];
            if (isObject(val)) {
                console.log('deep into folder--->>>' + f);
                loop(val);
            } else {
                console.log('make dir--->>>' + f);
                // mkdirp the folder the file is going in
                mkDir(val);
            }
        }
    }

    function mkDir(dir) {
        mkdirp(cwd + '\\' + root + '\\' + dir, function (err) {
            if (err) {
                console.log(err);
            }
            //writeContents(writePath, file, cb);
        });
    }

    var stream = through2.obj(function (file, enc, cb) {
        //every file will go into this
        cb();
    }, function (cb) {
        //last execute
        cb();
    });
    stream.resume();
    return stream;
}

function isObject(value) {
    // Avoid a V8 JIT bug in Chrome 19-20.
    // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
    var type = typeof value;
    return !!value && (type == 'object' || type == 'function');
}

module.exports = combine;