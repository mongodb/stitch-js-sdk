'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* global window, document, fetch */

var _storage = require('./storage');

var _providers = require('./providers');

var _errors = require('../errors');

var _common = require('./common');

var authCommon = _interopRequireWildcard(_common);

var _common2 = require('../common');

var common = _interopRequireWildcard(_common2);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var jwtDecode = require('jwt-decode');

var EMBEDDED_USER_AUTH_DATA_PARTS = 4;

var Auth = function () {
  function Auth(client, rootUrl, options) {
    _classCallCheck(this, Auth);

    options = Object.assign({}, {
      storageType: 'localStorage',
      codec: authCommon.APP_CLIENT_CODEC
    }, options);

    this.client = client;
    this.rootUrl = rootUrl;
    this.codec = options.codec;
    this.storage = (0, _storage.createStorage)(options);
    this.providers = (0, _providers.createProviders)(this, options);
  }

  _createClass(Auth, [{
    key: 'provider',
    value: function provider(name) {
      if (!this.providers.hasOwnProperty(name)) {
        throw new Error('Invalid auth provider specified: ' + name);
      }

      return this.providers[name];
    }
  }, {
    key: 'refreshToken',
    value: function refreshToken() {
      var _this = this;

      if (this.isImpersonatingUser()) {
        return this.refreshImpersonation(this.client);
      }

      return this.client.doSessionPost().then(function (json) {
        return _this.set(json);
      });
    }
  }, {
    key: 'pageRootUrl',
    value: function pageRootUrl() {
      return [window.location.protocol, '//', window.location.host, window.location.pathname].join('');
    }
  }, {
    key: 'error',
    value: function error() {
      return this._error;
    }
  }, {
    key: 'isAppClient',
    value: function isAppClient() {
      if (!this.client) {
        return true; // Handle the case where Auth is constructed with null
      }
      return this.client.type === common.APP_CLIENT_TYPE;
    }
  }, {
    key: 'handleRedirect',
    value: function handleRedirect() {
      if (typeof window === 'undefined') {
        // This means we're running in some environment other
        // than a browser - so handling a redirect makes no sense here.
        return;
      }
      if (!window.location || !window.location.hash) {
        return;
      }

      var ourState = this.storage.get(authCommon.STATE_KEY);
      var redirectFragment = window.location.hash.substring(1);
      var redirectState = this.parseRedirectFragment(redirectFragment, ourState);
      if (redirectState.lastError) {
        console.error('StitchClient: error from redirect: ' + redirectState.lastError);
        this._error = redirectState.lastError;
        window.history.replaceState(null, '', this.pageRootUrl());
        return;
      }

      if (!redirectState.found) {
        return;
      }

      this.storage.remove(authCommon.STATE_KEY);
      if (!redirectState.stateValid) {
        console.error('StitchClient: state values did not match!');
        window.history.replaceState(null, '', this.pageRootUrl());
        return;
      }

      if (!redirectState.ua) {
        console.error('StitchClient: no UA value was returned from redirect!');
        return;
      }

      // If we get here, the state is valid - set auth appropriately.
      this.set(redirectState.ua);
      window.history.replaceState(null, '', this.pageRootUrl());
    }
  }, {
    key: 'getCookie',
    value: function getCookie(name) {
      var splitCookies = document.cookie.split(' ');
      for (var i = 0; i < splitCookies.length; i++) {
        var cookie = splitCookies[i];
        var sepIdx = cookie.indexOf('=');
        var cookieName = cookie.substring(0, sepIdx);
        if (cookieName === name) {
          var cookieVal = cookie.substring(sepIdx + 1, cookie.length);
          if (cookieVal[cookieVal.length - 1] === ';') {
            return cookieVal.substring(0, cookie.length - 1);
          }
          return cookieVal;
        }
      }
    }
  }, {
    key: 'handleCookie',
    value: function handleCookie() {
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        // This means we're running in some environment other
        // than a browser - so handling a cookie makes no sense here.
        return;
      }
      if (!document.cookie) {
        return;
      }

      var uaCookie = this.getCookie(authCommon.USER_AUTH_COOKIE_NAME);
      if (!uaCookie) {
        return;
      }

      document.cookie = authCommon.USER_AUTH_COOKIE_NAME + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;';
      var userAuth = this.unmarshallUserAuth(uaCookie);
      this.set(userAuth);
      window.history.replaceState(null, '', this.pageRootUrl());
    }
  }, {
    key: 'clear',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.storage.remove(authCommon.USER_AUTH_KEY);

              case 2:
                _context.next = 4;
                return this.storage.remove(authCommon.REFRESH_TOKEN_KEY);

              case 4:
                _context.next = 6;
                return this.clearImpersonation();

              case 6:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function clear() {
        return _ref.apply(this, arguments);
      }

      return clear;
    }()
  }, {
    key: 'getDeviceId',
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.storage.get(authCommon.DEVICE_ID_KEY);

              case 2:
                return _context2.abrupt('return', _context2.sent);

              case 3:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getDeviceId() {
        return _ref2.apply(this, arguments);
      }

      return getDeviceId;
    }()

    // Returns whether or not the access token is expired or is going to expire within 'withinSeconds'
    // seconds, according to current system time. Returns false if the token is malformed in any way.

  }, {
    key: 'isAccessTokenExpired',
    value: function isAccessTokenExpired() {
      var withinSeconds = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : authCommon.DEFAULT_ACCESS_TOKEN_EXPIRE_WITHIN_SECS;

      var token = this.getAccessToken();
      if (!token) {
        return false;
      }

      var decodedToken = void 0;
      try {
        decodedToken = jwtDecode(token);
      } catch (e) {
        return false;
      }

      if (!decodedToken) {
        return false;
      }

      return decodedToken.exp && Math.floor(Date.now() / 1000) >= decodedToken.exp - withinSeconds;
    }
  }, {
    key: 'getAccessToken',
    value: function getAccessToken() {
      return this._get().accessToken;
    }
  }, {
    key: 'getRefreshToken',
    value: function getRefreshToken() {
      return this.storage.get(authCommon.REFRESH_TOKEN_KEY);
    }
  }, {
    key: 'set',
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(json) {
        var rt, deviceId, newUserAuth;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (json) {
                  _context3.next = 2;
                  break;
                }

                return _context3.abrupt('return');

              case 2:
                if (!json[this.codec.refreshToken]) {
                  _context3.next = 7;
                  break;
                }

                rt = json[this.codec.refreshToken];

                delete json[this.codec.refreshToken];
                _context3.next = 7;
                return this.storage.set(authCommon.REFRESH_TOKEN_KEY, rt);

              case 7:
                if (!json[this.codec.deviceId]) {
                  _context3.next = 12;
                  break;
                }

                deviceId = json[this.codec.deviceId];

                delete json[this.codec.deviceId];
                _context3.next = 12;
                return this.storage.set(authCommon.DEVICE_ID_KEY, deviceId);

              case 12:

                // Merge in new fields with old fields. Typically the first json value
                // is complete with every field inside a user auth, but subsequent requests
                // do not include everything. This merging behavior is safe so long as json
                // value responses with absent fields do not indicate that the field should
                // be unset.
                newUserAuth = {};

                if (json[this.codec.accessToken]) {
                  newUserAuth.accessToken = json[this.codec.accessToken];
                }
                if (json[this.codec.userId]) {
                  newUserAuth.userId = json[this.codec.userId];
                }
                _context3.t0 = Object;
                _context3.next = 18;
                return this._get();

              case 18:
                _context3.t1 = _context3.sent;
                _context3.t2 = newUserAuth;
                newUserAuth = _context3.t0.assign.call(_context3.t0, _context3.t1, _context3.t2);
                _context3.next = 23;
                return this.storage.set(authCommon.USER_AUTH_KEY, JSON.stringify(newUserAuth));

              case 23:
                return _context3.abrupt('return', _context3.sent);

              case 24:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function set(_x2) {
        return _ref3.apply(this, arguments);
      }

      return set;
    }()
  }, {
    key: '_get',
    value: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
        var data;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.storage.get(authCommon.USER_AUTH_KEY);

              case 2:
                data = _context4.sent;

                if (data) {
                  _context4.next = 5;
                  break;
                }

                return _context4.abrupt('return', {});

              case 5:
                _context4.prev = 5;
                return _context4.abrupt('return', JSON.parse(data));

              case 9:
                _context4.prev = 9;
                _context4.t0 = _context4['catch'](5);

                // Need to back out and clear auth otherwise we will never
                // be able to do anything useful.
                this.clear();
                throw new _errors.StitchError('Failure retrieving stored auth');

              case 13:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this, [[5, 9]]);
      }));

      function _get() {
        return _ref4.apply(this, arguments);
      }

      return _get;
    }()
  }, {
    key: 'authedId',
    value: function () {
      var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return this._get();

              case 2:
                return _context5.abrupt('return', _context5.sent.userId);

              case 3:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function authedId() {
        return _ref5.apply(this, arguments);
      }

      return authedId;
    }()
  }, {
    key: 'isImpersonatingUser',
    value: function () {
      var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return this.storage.get(authCommon.IMPERSONATION_ACTIVE_KEY);

              case 2:
                _context6.t0 = _context6.sent;
                return _context6.abrupt('return', _context6.t0 === 'true');

              case 4:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function isImpersonatingUser() {
        return _ref6.apply(this, arguments);
      }

      return isImpersonatingUser;
    }()
  }, {
    key: 'refreshImpersonation',
    value: function () {
      var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(client) {
        var _this2 = this;

        var userId;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return this.storage.get(authCommon.IMPERSONATION_USER_KEY);

              case 2:
                userId = _context7.sent;
                return _context7.abrupt('return', client._do('/admin/users/' + userId + '/impersonate', 'POST', { refreshOnFailure: false, useRefreshToken: true }).then(function (response) {
                  return response.json();
                }).then(function (json) {
                  return _this2.set(json);
                }).catch(function (e) {
                  _this2.stopImpersonation();
                  throw e; // rethrow
                }));

              case 4:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function refreshImpersonation(_x3) {
        return _ref7.apply(this, arguments);
      }

      return refreshImpersonation;
    }()
  }, {
    key: 'startImpersonation',
    value: function () {
      var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(client, userId) {
        var realUserAuth;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.next = 2;
                return !this.authedId();

              case 2:
                if (!_context8.sent) {
                  _context8.next = 4;
                  break;
                }

                return _context8.abrupt('return', Promise.reject(new _errors.StitchError('Must auth first')));

              case 4:
                if (!this.isImpersonatingUser()) {
                  _context8.next = 6;
                  break;
                }

                return _context8.abrupt('return', Promise.reject(new _errors.StitchError('Already impersonating a user')));

              case 6:
                _context8.next = 8;
                return this.storage.set(authCommon.IMPERSONATION_ACTIVE_KEY, 'true');

              case 8:
                _context8.next = 10;
                return this.storage.set(authCommon.IMPERSONATION_USER_KEY, userId);

              case 10:
                _context8.t0 = JSON;
                _context8.next = 13;
                return this.storage.get(authCommon.USER_AUTH_KEY);

              case 13:
                _context8.t1 = _context8.sent;
                realUserAuth = _context8.t0.parse.call(_context8.t0, _context8.t1);
                _context8.next = 17;
                return this.storage.set(authCommon.IMPERSONATION_REAL_USER_AUTH_KEY, JSON.stringify(realUserAuth));

              case 17:
                return _context8.abrupt('return', this.refreshImpersonation(client));

              case 18:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function startImpersonation(_x4, _x5) {
        return _ref8.apply(this, arguments);
      }

      return startImpersonation;
    }()
  }, {
    key: 'stopImpersonation',
    value: function () {
      var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
        var realUserAuth;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                if (this.isImpersonatingUser()) {
                  _context9.next = 2;
                  break;
                }

                throw new _errors.StitchError('Not impersonating a user');

              case 2:
                _context9.t0 = JSON;
                _context9.next = 5;
                return this.storage.get(authCommon.IMPERSONATION_REAL_USER_AUTH_KEY);

              case 5:
                _context9.t1 = _context9.sent;
                realUserAuth = _context9.t0.parse.call(_context9.t0, _context9.t1);
                _context9.next = 9;
                return this.set(realUserAuth);

              case 9:
                _context9.next = 11;
                return this.clearImpersonation();

              case 11:
              case 'end':
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function stopImpersonation() {
        return _ref9.apply(this, arguments);
      }

      return stopImpersonation;
    }()
  }, {
    key: 'clearImpersonation',
    value: function () {
      var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10() {
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                _context10.next = 2;
                return this.storage.remove(authCommon.IMPERSONATION_ACTIVE_KEY);

              case 2:
                _context10.next = 4;
                return this.storage.remove(authCommon.IMPERSONATION_USER_KEY);

              case 4:
                _context10.next = 6;
                return this.storage.remove(authCommon.IMPERSONATION_REAL_USER_AUTH_KEY);

              case 6:
              case 'end':
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function clearImpersonation() {
        return _ref10.apply(this, arguments);
      }

      return clearImpersonation;
    }()
  }, {
    key: 'parseRedirectFragment',
    value: function parseRedirectFragment(fragment, ourState) {
      // After being redirected from oauth, the URL will look like:
      // https://todo.examples.stitch.mongodb.com/#_stitch_state=...&_stitch_ua=...
      // This function parses out stitch-specific tokens from the fragment and
      // builds an object describing the result.
      var vars = fragment.split('&');
      var result = { ua: null, found: false, stateValid: false, lastError: null };
      var shouldBreak = false;
      for (var i = 0; i < vars.length && !shouldBreak; ++i) {
        var pairParts = vars[i].split('=');
        var pairKey = decodeURIComponent(pairParts[0]);
        switch (pairKey) {
          case authCommon.STITCH_ERROR_KEY:
            result.lastError = decodeURIComponent(pairParts[1]);
            result.found = true;
            shouldBreak = true;
            break;
          case authCommon.USER_AUTH_KEY:
            try {
              result.ua = this.unmarshallUserAuth(decodeURIComponent(pairParts[1]));
              result.found = true;
            } catch (e) {
              result.lastError = e;
            }
            continue;
          case authCommon.STITCH_LINK_KEY:
            result.found = true;
            continue;
          case authCommon.STATE_KEY:
            result.found = true;
            var theirState = decodeURIComponent(pairParts[1]);
            if (ourState && ourState === theirState) {
              result.stateValid = true;
            }
            continue;
          default:
            continue;
        }
      }

      return result;
    }
  }, {
    key: 'unmarshallUserAuth',
    value: function unmarshallUserAuth(data) {
      var _ref11;

      var parts = data.split('$');
      if (parts.length !== EMBEDDED_USER_AUTH_DATA_PARTS) {
        throw new RangeError('invalid user auth data provided: ' + data);
      }

      return _ref11 = {}, _defineProperty(_ref11, this.codec.accessToken, parts[0]), _defineProperty(_ref11, this.codec.refreshToken, parts[1]), _defineProperty(_ref11, this.codec.userId, parts[2]), _defineProperty(_ref11, this.codec.deviceId, parts[3]), _ref11;
    }
  }]);

  return Auth;
}();

exports.default = Auth;
module.exports = exports['default'];