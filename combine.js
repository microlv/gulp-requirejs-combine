'use strict';

var defaults = require('defaults');
var through2 = require('through2');
var mkdirp = require('mkdirp');
var path = require('path');
var fs = require('fs');

var arrayTag = '[object Array]';

function combine(opt) {
    opt = opt || {};
    var dependList = [];

    var options = defaults(opt, {
        cwd: process.cwd()
    });

    if (typeof options.mode === 'string') {
        options.mode = parseInt(options.mode, 8);
    }
    var cwd = path.resolve(options.cwd);

    var define = function () {
        var depend = arguments[0];
        var i = 0, filepath = '';
        if (typeof depend === 'function') {
            depend.toString();
        }
        else {
            for (i = 0; i < depend.length; i++) {
                filepath = path.resolve(cwd + '\\' + opt.baseUrl + '\\' + mapConfig(depend[i]));
                try {
                    var data = fs.readFileSync(filepath, 'utf-8');
                    var content = String(data);
                    dependList.push({file: a[i], content: content, isDone: false});
                    eval(content);
                } catch (e) {
                    console.log(e);
                }
            }
        }
    };

    var require = function (a, b, c) {
        var i = 0, filepath = '';
        if (Object.prototype.toString.call(a) === arrayTag) {
            for (i = 0; i < a.length; i++) {
                filepath = path.resolve(cwd + '\\' + opt.baseUrl + '\\' + mapConfig(a[i]));
                try {
                    var data = fs.readFileSync(filepath, 'utf-8');
                    var content = String(data);
                    dependList.push({file: a[i], content: content, isDone: false});
                    eval(content);
                } catch (e) {
                    console.log(e);
                }
            }
        }
    };

    function mapConfig(name) {
        var file = opt.paths[name];
        var re = new RegExp('.js', 'gi');
        if (re.test(file)) {
            return file;
        }
        return file + '.js';
    }

    var stream = through2.obj(function (file, enc, cb) {
        //every file will go into this
        //file.contents = new Buffer(String(file.contents).replace(search, replacement));
        var content = String(file.contents);
        //this just use for dev
        eval(content);

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