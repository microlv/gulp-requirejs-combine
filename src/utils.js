'use strict';

var _ = require('lodash');
var count = 0;
/**
 * find item if it exist in define/require list
 * @param name
 * @param arr
 */
function findItem(name, arr) {
  return _.find(arr, function (i) {
    return i.name === name;
  });
}

/**
 * check the item is exist in define/require list
 * @param name
 * @returns {boolean}
 */
function exist(name, arr) {
  return !!findItem(name, arr);
}

function outPutCountIndex() {
  var res = count;
  ++count;
  console.log(res);
  return res;
}

function trycatch(exec, cb) {
  try {
    exec();
  }
  catch (e) {
    cb(e);
  }
}

module.exports = {
  findItem: findItem,
  exist: exist,
  outPutCountIndex: outPutCountIndex,
  trycatch: trycatch
};