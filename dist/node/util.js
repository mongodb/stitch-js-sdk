'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deprecate = deprecate;
function deprecate(fn, msg) {
  var alreadyWarned = false;
  function deprecated() {
    if (!alreadyWarned) {
      alreadyWarned = true;
      console.warn('DeprecationWarning: ' + msg);
    }

    return fn.apply(this, arguments);
  }

  Object.setPrototypeOf(deprecated, fn);
  if (fn.prototype) {
    deprecated.prototype = fn.prototype;
  }

  return deprecated;
}