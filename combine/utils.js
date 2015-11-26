'use strict';

var _ = require('lodash');

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

module.exports = {
  findItem: findItem,
  exist: exist
};