'use strict';

var through2 = require('through2');
var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var gutil = require('gulp-util');
var utils = require('./utils');

var arrayTag = '[object Array]';
var toString = Object.prototype.toString;

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

  var require = function (arr, func) {
    if (toString.call(arr) !== arrayTag) return;

    _.forEach(arr, function (name) {
      sort = 1;
      loadFiles(name);
    });
    evalName = '';
    closureReplace(func);
  };

  function loadFiles(name) {
    var data, content, item;
    var filepath = path.resolve(getEnv());
    try {
      data = fs.readFileSync(filepath, 'utf-8');
      content = String(data);
      if (!utils.exist(name, defineList)) {
        defineList.push({name: name, content: content, ef: ''});
        requireList.push({name: name, sort: sort++});
      } else {
        //if item is exist, then update it 's sort
        item = utils.findItem(name, requireList);
        if (sort >= item.sort) {
          item.sort = sort++;
        }
      }
      evalName = name;
      eval(content);
    }
    catch (e) {
      console.log(e);
    }
  }

  function closureReplace(f) {
    if (typeof f !== 'function')return;

    //default func
    var func = 'function(){}', main = 'mainRequire';
    var index, start, end, item;

    func = '($$func$$)();$$name$$'
      .replace('$$func$$', f.toString())
      //if not debug ,replace to ''
      .replace('$$name$$', debug ? ('\r/** ' + ( evalName || main) + ' **/\r') : '');

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
      defineList.push({name: main, content: '', ef: func});
      requireList.push({name: main, sort: 0});
    }
  }

  function mapConfig(name) {

  }

  function createFile(file) {
    return new gutil.File({
      cwd: __dirname,
      base: __dirname,
      path: path.join(__dirname, file)
    });
  }

  function getEnv(name) {
    var baseUrl = __dirname + '/../' + opt.baseUrl + '/';
    //TODO:wait test in win platform
    if (process.platform !== 'darwin') {
      baseUrl = __dirname + '\\..\\' + opt.baseUrl + '\\';
    }
    var file = opt.paths[name];
    var re = new RegExp(/\.js/gi);
    var extFile = file;
    if (!re.test(file)) {
      extFile = file + '.js';
    }
    return baseUrl + extFile;
  }

  function clear() {
    defineList = [];
    requireList = [];
    evalName = '';
    sort = 1;
    jsFile = createFile(output);
  }

  function combinejs(file, enc, cb) {
    if (file.isNull()) {
      return cb(null, file);
    }

    if (file.isStream()) {
      return cb(createError(file, 'Streaming not supported'));
    }
    //clear all parpare for next file.
    clear();

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

    console.log(stringContent);
    file.contents = new Buffer(stringContent);
    cb(null, file);
  }

  return through2.obj(combinejs);
}

module.exports = combine;