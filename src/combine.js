'use strict';

var through2 = require('through2');
var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var gutil = require('gulp-util');
var utils = require('./utils');

var arrayTag = '[object Array]';
var toString = Object.prototype.toString;
var fileBase = '';

function combine(opt) {
  opt = opt || {};
  var useStrict = opt.useStrict || false;
  var output = opt.output || 'output.js';
  var debug = opt.debug || false;
  var browerify = opt.browerify || false;
  var defineList = [];
  var requireList = [];
  var evalName = '';
  var sort = 1;
  var jsFile = '';
  var runFolder = '';//current the location of file

  /**
   * define for when gulp run, it need to find this define function
   */
  var define = function () {
    var i = 0, f = arguments[i];
    //if first argument is name, like define('name',[],function(){});
    if (typeof f === 'string') {
      f = arguments[++i];
    }
    if (toString.call(f) === arrayTag && f.length === 0) {
      f = arguments[++i];
      //f is function(a,b){xxx};
      closureReplace(f);
    } else if (typeof f === 'function') {
      closureReplace(f);
    } else {
      //save self first.
      closureReplace(arguments[++i]);
      _.forEach(f, function (name) {
        loadFiles(name);
      });
    }
  };

  /**
   * require for when gulp run, it need to find this require function
   */
  var require = function (arr, func) {
    if (toString.call(arr) !== arrayTag) return;

    _.forEach(arr, function (name) {
      sort = 1;
      runFolder = '.';
      loadFiles(name);
    });
    evalName = '';
    closureReplace(func);
  };

  function loadFiles(name) {
    utils.trycatch(function () {
      var item;
      var filepath = path.resolve(getFileUrl(name));
      var data = fs.readFileSync(filepath, 'utf-8');
      var content = String(data);

      if (!utils.exist(name, defineList)) {
        defineList.push({ name: name, content: content, ef: '' });
        requireList.push({ name: name, sort: sort++ });
      } else {
        //if item is exist, then update it 's sort
        item = utils.findItem(name, requireList);
        if (sort >= item.sort) {
          item.sort = sort++;
        }
      }
      evalName = name;
      eval(content);
    }, function (e) { console.error(e); });
  }

  function closureReplace(f) {
    if (typeof f !== 'function') return;

    //default func
    var func = 'function(){}', main = 'main function';
    var index, start, end, item;

    func = '($$func$$)();$$name$$'
      .replace('$$func$$', f.toString())
    //if not debug ,replace to ''
      .replace('$$name$$', debug ? ('\r/** ' + (evalName || main) + ' **/\r') : '');

    if (useStrict) {
      index = func.indexOf('{') + 1;
      start = func.substring(0, index);
      end = func.substring(index, func.length);
      func = start + '\r  \'use strict\';\r' + end;
    }
    if (evalName) {
      item = utils.findItem(evalName, defineList);
      item.ef = func;
    } else {
      defineList.push({ name: main, content: '', ef: func });
      requireList.push({ name: main, sort: 0 });
    }
  }

  function createFile(file) {
    return new gutil.File({
      cwd: __dirname,
      base: __dirname,
      path: path.join(__dirname, file)
    });
  }

  function getFileUrl(name) {
    var baseUrl = '', file = '';

    if (browerify) {
      //TODO:browerify support start.
      console.log(name);
      if (runFolder === '.') {//this means process is in require
        baseUrl = fileBase;
        runFolder = name.substring(name.lastIndexOf('/') + 1, name.length);
      } else {
        runFolder = name.substring(name.lastIndexOf('/') + 1, name.length);
        console.log(runFolder);
        baseUrl = fileBase + '/' + runFolder;
      }

      file = regTest(name);
    } else {
      baseUrl = process.cwd() + '/' + opt.baseUrl + '/';
      file = regTest(opt.paths[name]);
    }
    console.log(baseUrl + file);
    console.log('>>>>>>****************************');

    return baseUrl + file;
  }

  function regTest(file) {
    if (!(/\.js/gi.test(file))) {
      file = file + '.js';
    }
    return file;
  }

  function clear() {
    defineList.length = 0;
    requireList.length = 0;
    evalName = '';
    sort = 1;
    jsFile = createFile(output);
  }

  function combinejs(file, enc, cb) {
    if (file.isNull()) {
      return cb(null, file);
    }

    if (file.isStream()) {
      return cb(null, 'Streaming not supported');
    }
    //clear all parpare for next file.
    clear();

    fileBase = file.base;

    //every file will go into this
    var content = String(file.contents);
    //try to run requrie('a','b',function(){});
    eval(content);

    //sort a new list according to the sort, number bigger will output first
    var stringContent = '';
    var sortList = _.sortBy(requireList, function (i) {
      return -i.sort;
    });
    _.forEach(sortList, function (k) {
      var item = utils.findItem(k.name, defineList);
      stringContent += ((item.ef === '' ? item.content : item.ef) + '\r');
    });

    file.contents = new Buffer(stringContent);
    cb(null, file);
  }

  return through2.obj(combinejs);
}

module.exports = combine;