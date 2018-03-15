'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeFetchArgs = exports.checkStatus = exports.SDK_VERSION = exports.DEFAULT_STITCH_SERVER_URL = exports.ADMIN_CLIENT_TYPE = exports.APP_CLIENT_TYPE = exports.JSONTYPE = undefined;

var _errors = require('./errors');

var JSONTYPE = exports.JSONTYPE = 'application/json';
var APP_CLIENT_TYPE = exports.APP_CLIENT_TYPE = 'app';
var ADMIN_CLIENT_TYPE = exports.ADMIN_CLIENT_TYPE = 'admin';
var DEFAULT_STITCH_SERVER_URL = exports.DEFAULT_STITCH_SERVER_URL = 'https://stitch.mongodb.com';

// VERSION is substituted with the package.json version number at build time
var version = 'unknown';
if (typeof "3.0.7" !== 'undefined') {
  version = "3.0.7";
}
var SDK_VERSION = exports.SDK_VERSION = version;

var checkStatus = exports.checkStatus = function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  if (response.headers.get('Content-Type') === JSONTYPE) {
    return response.json().then(function (json) {
      var error = new _errors.StitchError(json.error, json.error_code);
      error.response = response;
      error.json = json;
      return Promise.reject(error);
    });
  }

  var error = new Error(response.statusText);
  error.response = response;
  return Promise.reject(error);
};

var makeFetchArgs = exports.makeFetchArgs = function makeFetchArgs(method, body) {
  var init = {
    method: method,
    headers: { 'Accept': JSONTYPE, 'Content-Type': JSONTYPE }
  };

  if (body) {
    init.body = body;
  }

  init.cors = true;
  return init;
};