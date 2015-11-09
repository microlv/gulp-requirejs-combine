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
    var defineList = [];
    var requireList = [];
    var options = defaults(opt, {
        cwd: process.cwd()
    });
    var cwd = path.resolve(options.cwd);
    var evalName = '';

    if (typeof options.mode === 'string') {
        options.mode = parseInt(options.mode, 8);
    }

    var define = function () {
        var f = arguments[0];
        var i = 0, filepath = '';
        var func = '';
        if (Object.prototype.toString.call(f) === arrayTag && f.length === 0) {
            f = arguments[1];
            //f is function(a,b){xxx};
            closureReplace(f);
        } else if (typeof f === 'function') {
            closureReplace(f);
        } else {


            _.forEach(f, function (name) {
                filepath = path.resolve(cwd + '\\' + opt.baseUrl + '\\' + mapConfig(name));
                try {
                    var data = fs.readFileSync(filepath, 'utf-8');
                    var content = String(data);
                    defineList.push({name: name, content: content, isDone: false, ef: ''});
                    requireList.push(name);
                    evalName = name;
                    eval(content);
                } catch (e) {
                    console.log(e);
                }
            });
        }
    };

    var require = function (a, b, c) {
        var i = 0, filepath = '';
        if (Object.prototype.toString.call(a) !== arrayTag) return;

        _.forEach(a, function (name) {
            filepath = path.resolve(cwd + '\\' + opt.baseUrl + '\\' + mapConfig(name));
            try {
                var data = fs.readFileSync(filepath, 'utf-8');
                var content = String(data);
                if (!exist(name)) {
                    defineList.push({name: name, content: content, isDone: false, ef: ''});
                    requireList.push(name);
                    evalName = name;
                    eval(content);
                }
            } catch (e) {
                console.log(e);
            }
        });

    };

    function closureReplace(f) {
        //default func
        var func = 'function(){}';
        if (typeof f === 'function') {
            func = f.toString();
            var item = findItem(evalName);
            item.ef = '($$func$$)()'.replace('$$func$$', func);
            item.isDone = true;
        }
    }

    function findItem(name) {
        return _.find(defineList, function (i) {
            return i.name === name;
        });
    }

    function exist(name) {
        return !!findItem(name);
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