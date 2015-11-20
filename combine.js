'use strict';

var defaults = require('defaults');
var through2 = require('through2');
var mkdirp = require('mkdirp');
var path = require('path');
var fs = require('fs');
var _ = require('lodash');

var arrayTag = '[object Array]';
var toString = Object.prototype.toString;

function combine(opt) {
  opt = opt || {};
  var useStrict = opt.useStrict || false;

  var defineList = [];
  var requireList = [];
  var options = defaults(opt, {
    cwd: process.cwd()
  });
  var cwd = path.resolve(options.cwd);
  var evalName = '';
  var sort = 1;

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
    var filepath = path.resolve(cwd + '\\' + opt.baseUrl + '\\' + mapConfig(name));
    try {
      data = fs.readFileSync(filepath, 'utf-8');
      content = String(data);
      if (!exist(name)) {
        defineList.push({name: name, content: content, ef: ''});
        requireList.push({name: name, sort: sort++});
      } else {
        //if item is exist, then update it 's sort
        item = findItem(name, requireList);
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

    func = '($$func$$)();//$$name$$\r'
      .replace('$$func$$', f.toString())
      .replace('$$name$$', evalName || main);

    if (useStrict) {
      index = func.indexOf('{') + 1;
      start = func.substring(0, index);
      end = func.substring(index, func.length);
      func = start + '\ruse strict;\r' + end;
    }
    if (evalName) {
      item = findItem(evalName);
      item.ef = func;
    } else {
      defineList.push({name: main, content: '', ef: func});
      requireList.push({name: main, sort: 0});
    }
  }

  /**
   * find item if it exist in define/require list
   * @param name
   * @param arr
   */
  function findItem(name, arr) {
    if (!arr) {
      arr = defineList;
    }
    return _.find(arr, function (i) {
      return i.name === name;
    });
  }

  /**
   * check the item is exist in define/require list
   * @param name
   * @returns {boolean}
   */
  function exist(name) {
    return !!findItem(name);
  }

  function mapConfig(name) {
    var file = opt.paths[name];
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

    //make dir
    mkdirp(folder, function (err) {
      if (err) throw err;

      //sort a new list according to the sort, number bigger will output first
      var stringContent = '';
      var sortList = _.sortBy(requireList, function (i) {
        return -i.sort;
      });
      _.forEach(sortList, function (k) {
        var item = findItem(k.name, defineList);
        stringContent += ((item.ef === '' ? item.content : item.ef) + '\r');
      });

      //write into file
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