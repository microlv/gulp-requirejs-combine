'use strict';

var defaults = require('defaults');
var through2 = require('through2');
var mkdirp = require('mkdirp');
var path = require('path');
var fs = require('fs');
var _ = require('lodash');

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
        if (typeof depend === 'function' || depend.length === 0) {
            depend.toString();
        }
        else {
            _.forEach(depend, function (item) {
                filepath = path.resolve(cwd + '\\' + opt.baseUrl + '\\' + mapConfig(item));
                try {
                    var data = fs.readFileSync(filepath, 'utf-8');
                    var content = String(data);
                    dependList.unshift({file: item, content: content, isDone: false});
                    eval(content);
                } catch (e) {
                    console.log(e);
                }
            });
        }
    };

    var require = function (a, b, c) {
        var i = 0, filepath = '';
        if (Object.prototype.toString.call(a) === arrayTag) {
            _.forEach(a, function (item) {
                filepath = path.resolve(cwd + '\\' + opt.baseUrl + '\\' + mapConfig(item));
                try {
                    var data = fs.readFileSync(filepath, 'utf-8');
                    var content = String(data);
                    if (!exist(item)) {
                        dependList.push({
                            file: item, content: content, isDone: false, cb: function () {

                            }
                        });
                        eval(content);
                    }
                } catch (e) {
                    console.log(e);
                }
            });
        }
    };

    function readFile() {

    }

    function exist(name) {
        var existItem = _.find(dependList, function (i) {
            return i.file === name;
        });
        return !!existItem;
    }

    function mapConfig(name) {
        var file = opt.paths[name];
        //if (!file) {
        //    file = _.find(opt.paths, function (path) {
        //        return path === name;
        //    });
        //}
        var re = new RegExp(/\.js/gi);
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