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
    var sort = 1;
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
            //save self first.
            closureReplace(arguments[1]);
            _.forEach(f, function (name) {
                loadFiles(name);
            });
        }
    };

    var require = function (a, b, c) {
        var i = 0, filepath = '';
        if (Object.prototype.toString.call(a) !== arrayTag) return;

        _.forEach(a, function (name) {
            loadFiles(name);
        });
    };

    function loadFiles(name) {
        var filepath = path.resolve(cwd + '\\' + opt.baseUrl + '\\' + mapConfig(name));
        try {
            var data = fs.readFileSync(filepath, 'utf-8');
            var content = String(data);
            if (!exist(name)) {
                defineList.push({name: name, content: content, isDone: false, ef: ''});
                requireList.push({name: name, sort: sort++});
                evalName = name;
                eval(content);
            } else {
                //if item is exist, then update it 's sort
                var item = findItem(name, requireList);
                item.sort = sort++;
            }
        } catch (e) {
            console.log(e);
        }
    }

    function closureReplace(f) {
        //default func
        var func = 'function(){}';
        if (typeof f === 'function') {
            func = f.toString();
            var item = findItem(evalName);
            item.ef = '($$func$$)();\r'.replace('$$func$$', func);
            item.isDone = true;
        }
    }

    function findItem(name, arr) {
        if (!arr) {
            arr = defineList;
        }
        return _.find(arr, function (i) {
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
        var folder = path.resolve(cwd + '\\' + opt.baseUrl + '\\' + 'build');
        var filepath = path.resolve(folder + '/output.js');

        mkdirp(folder, function (err) {
            if (err) throw err;
            //write into file
            var stringContent = '';
            var sortList = _.sortBy(requireList, function (i) {
                return i.sort;
            });
            _.forEach(sortList, function (k) {
                var item = findItem(k.name, defineList);
                stringContent += item.ef;
            });

            fs.writeFileSync(filepath, stringContent, {encoding: 'utf8'}, function (err) {
                if (err) throw err;
                console.log('save is done,please see: ' + filepath);
            });
            cb();
        });

    });
    stream.resume();
    return stream;
}

module.exports = combine;