'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var JSONTYPE = exports.JSONTYPE = 'application/json';
var USER_AUTH_KEY = exports.USER_AUTH_KEY = '_baas_ua';
var REFRESH_TOKEN_KEY = exports.REFRESH_TOKEN_KEY = '_baas_rt';
var STATE_KEY = exports.STATE_KEY = '_baas_state';
var BAAS_ERROR_KEY = exports.BAAS_ERROR_KEY = '_baas_error';
var BAAS_LINK_KEY = exports.BAAS_LINK_KEY = '_baas_link';
var IMPERSONATION_ACTIVE_KEY = exports.IMPERSONATION_ACTIVE_KEY = '_baas_impers_active';
var IMPERSONATION_USER_KEY = exports.IMPERSONATION_USER_KEY = '_baas_impers_user';
var IMPERSONATION_REAL_USER_AUTH_KEY = exports.IMPERSONATION_REAL_USER_AUTH_KEY = '_baas_impers_real_ua';

var DEFAULT_BAAS_SERVER_URL = exports.DEFAULT_BAAS_SERVER_URL = 'https://baas-dev.10gen.cc';

var checkStatus = exports.checkStatus = function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    var error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
};

var makeFetchArgs = exports.makeFetchArgs = function makeFetchArgs(method, body) {
  var init = {
    method: method,
    headers: { 'Accept': JSONTYPE, 'Content-Type': JSONTYPE }
  };
  if (body) {
    init['body'] = body;
  }
  return init;
};

var parseRedirectFragment = exports.parseRedirectFragment = function parseRedirectFragment(fragment, ourState) {
  // After being redirected from oauth, the URL will look like:
  // https://todo.examples.baas-dev.10gen.cc/#_baas_state=...&_baas_ua=...
  // This function parses out baas-specific tokens from the fragment and
  // builds an object describing the result.
  var vars = fragment.split('&');
  var result = { ua: null, found: false, stateValid: false, lastError: null };
  var shouldBreak = false;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = vars[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var pair = _step.value;

      var pairParts = pair.split('=');
      var pairKey = decodeURIComponent(pairParts[0]);
      switch (pairKey) {
        case BAAS_ERROR_KEY:
          result.lastError = decodeURIComponent(pairParts[1]);
          result.found = true;
          shouldBreak = true;
          break;
        case USER_AUTH_KEY:
          result.ua = JSON.parse(window.atob(decodeURIComponent(pairParts[1])));
          result.found = true;
          continue;
        case BAAS_LINK_KEY:
          result.found = true;
          continue;
        case STATE_KEY:
          result.found = true;
          var theirState = decodeURIComponent(pairParts[1]);
          if (ourState && ourState === theirState) {
            result.stateValid = true;
          }
      }
      if (shouldBreak) {
        break;
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return result;
};

var BaasError = exports.BaasError = function (_Error) {
  _inherits(BaasError, _Error);

  function BaasError(message, code) {
    _classCallCheck(this, BaasError);

    var _this = _possibleConstructorReturn(this, (BaasError.__proto__ || Object.getPrototypeOf(BaasError)).call(this, message));

    _this.name = 'BaasError';
    _this.message = message;
    if (code !== undefined) {
      _this.code = code;
    }
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(_this, _this.constructor);
    } else {
      _this.stack = new Error(message).stack;
    }
    return _this;
  }

  return BaasError;
}(Error);