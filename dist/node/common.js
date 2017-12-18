'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var checkStatus = exports.checkStatus = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(response) {
    var error;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(response.status >= 200 && response.status < 300)) {
              _context.next = 2;
              break;
            }

            return _context.abrupt('return', response);

          case 2:
            error = new Error(response.statusText);

            error.response = response;

            // set error to statusText by default; this will be overwritten when (and if)
            // the response is successfully parsed into json below
            error.error = response.statusText;

            return _context.abrupt('return', response.json().catch(function () {
              return Promise.reject(error);
            }).then(function (json) {
              return Promise.reject(Object.assign(error, json));
            }));

          case 6:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function checkStatus(_x) {
    return _ref.apply(this, arguments);
  };
}();

exports.makeFetchArgs = makeFetchArgs;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var JSONTYPE = exports.JSONTYPE = 'application/json';
var APP_CLIENT_TYPE = exports.APP_CLIENT_TYPE = 'app';
var ADMIN_CLIENT_TYPE = exports.ADMIN_CLIENT_TYPE = 'admin';
var DEFAULT_STITCH_SERVER_URL = exports.DEFAULT_STITCH_SERVER_URL = 'https://stitch.mongodb.com';

// VERSION is substituted with the package.json version number at build time
var version = 'unknown';
if (typeof "2.2.0" !== 'undefined') {
  version = "2.2.0";
}

var SDK_VERSION = exports.SDK_VERSION = version;

;

function makeFetchArgs(method, body) {
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