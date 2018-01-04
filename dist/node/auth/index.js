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

var _detectBrowser = require('detect-browser');

var _platform = _interopRequireWildcard(_detectBrowser);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
    this.platform = options.platform || _platform;
    this.storage = (0, _storage.createStorage)(options);
    this.providers = (0, _providers.createProviders)(this, options);
  }

  /**
   * Create the device info for this client.
   *
   * @memberof module:auth
   * @method getDeviceInfo
   * @param {String} appId The app ID for this client
   * @param {String} appVersion The version of the app
   * @returns {Object} The device info object
   */


  _createClass(Auth, [{
    key: 'getDeviceInfo',
    value: function getDeviceInfo(deviceId, appId) {
      var appVersion = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

      var deviceInfo = { appId: appId, appVersion: appVersion, sdkVersion: common.SDK_VERSION };

      if (deviceId) {
        deviceInfo.deviceId = deviceId;
      }

      if (this.platform) {
        deviceInfo.platform = this.platform.name;
        deviceInfo.platformVersion = this.platform.version;
      }

      return deviceInfo;
    }
  }, {
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

      return this.isImpersonatingUser().then(function (isImpersonatingUser) {
        if (isImpersonatingUser) {
          return _this.refreshImpersonation(_this.client);
        }

        return _this.client.doSessionPost();
      }).then(function (json) {
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
      var _this2 = this;

      if (typeof window === 'undefined') {
        // This means we're running in some environment other
        // than a browser - so handling a redirect makes no sense here.
        return;
      }
      if (!window.location || !window.location.hash) {
        return;
      }

      return this.storage.get(authCommon.STATE_KEY).then(function (ourState) {
        var redirectFragment = window.location.hash.substring(1);
        var redirectState = _this2.parseRedirectFragment(redirectFragment, ourState);
        if (redirectState.lastError) {
          console.error('StitchClient: error from redirect: ' + redirectState.lastError);
          _this2._error = redirectState.lastError;
          window.history.replaceState(null, '', _this2.pageRootUrl());
          return;
        }

        if (!redirectState.found) {
          return;
        }

        return _this2.storage.remove(authCommon.STATE_KEY);
      }).then(function () {
        if (!redirectState.stateValid) {
          console.error('StitchClient: state values did not match!');
          window.history.replaceState(null, '', _this2.pageRootUrl());
          return;
        }

        if (!redirectState.ua) {
          console.error('StitchClient: no UA value was returned from redirect!');
          return;
        }

        // If we get here, the state is valid - set auth appropriately.
        return _this2.set(redirectState.ua);
      }).then(function () {
        return window.history.replaceState(null, '', _this2.pageRootUrl());
      });
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
      var _this3 = this;

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
      return this.set(userAuth).then(function () {
        return window.history.replaceState(null, '', _this3.pageRootUrl());
      });
    }
  }, {
    key: 'clear',
    value: function clear() {
      var _this4 = this;

      return this.storage.remove(authCommon.USER_AUTH_KEY).then(function () {
        return _this4.storage.remove(authCommon.REFRESH_TOKEN_KEY);
      }).then(function () {
        return _this4.clearImpersonation;
      });
    }
  }, {
    key: 'getDeviceId',
    value: function getDeviceId() {
      return this.storage.get(authCommon.DEVICE_ID_KEY);
    }

    // Returns whether or not the access token is expired or is going to expire within 'withinSeconds'
    // seconds, according to current system time. Returns false if the token is malformed in any way.

  }, {
    key: 'isAccessTokenExpired',
    value: function isAccessTokenExpired() {
      var withinSeconds = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : authCommon.DEFAULT_ACCESS_TOKEN_EXPIRE_WITHIN_SECS;

      return this.getAccessToken().then(function (token) {
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
      });
    }
  }, {
    key: 'getAccessToken',
    value: function getAccessToken() {
      return this._get().then(function (auth) {
        return auth.accessToken;
      });
    }
  }, {
    key: 'getRefreshToken',
    value: function getRefreshToken() {
      return this.storage.get(authCommon.REFRESH_TOKEN_KEY);
    }
  }, {
    key: 'set',
    value: function set(json) {
      var _this5 = this;

      if (!json) {
        return;
      }

      var newUserAuth = {};
      return new Promise(function (resolve) {
        if (json[_this5.codec.refreshToken]) {
          var rt = json[_this5.codec.refreshToken];
          delete json[_this5.codec.refreshToken];
          resolve(_this5.storage.set(authCommon.REFRESH_TOKEN_KEY, rt));
        }
        resolve();
      }).then(function () {
        if (json[_this5.codec.deviceId]) {
          var deviceId = json[_this5.codec.deviceId];
          delete json[_this5.codec.deviceId];
          return _this5.storage.set(authCommon.DEVICE_ID_KEY, deviceId);
        }
        return;
      }).then(function () {
        // Merge in new fields with old fields. Typically the first json value
        // is complete with every field inside a user auth, but subsequent requests
        // do not include everything. This merging behavior is safe so long as json
        // value responses with absent fields do not indicate that the field should
        // be unset.
        if (json[_this5.codec.accessToken]) {
          newUserAuth.accessToken = json[_this5.codec.accessToken];
        }
        if (json[_this5.codec.userId]) {
          newUserAuth.userId = json[_this5.codec.userId];
        }

        return _this5._get();
      }).then(function (auth) {
        newUserAuth = Object.assign(auth, newUserAuth);
        return _this5.storage.set(authCommon.USER_AUTH_KEY, JSON.stringify(newUserAuth));
      });
    }
  }, {
    key: '_get',
    value: function _get() {
      var _this6 = this;

      return this.storage.get(authCommon.USER_AUTH_KEY).then(function (data) {
        if (!data) {
          return {};
        }

        try {
          return JSON.parse(data);
        } catch (e) {
          // Need to back out and clear auth otherwise we will never
          // be able to do anything useful.
          return _this6.clear().then(function () {
            throw new _errors.StitchError('Failure retrieving stored auth');
          });
        }
      });
    }
  }, {
    key: 'authedId',
    value: function authedId() {
      return this._get().then(function (auth) {
        return auth.userId;
      });
    }
  }, {
    key: 'isImpersonatingUser',
    value: function isImpersonatingUser() {
      return this.storage.get(authCommon.IMPERSONATION_ACTIVE_KEY).then(function (isImpersonationActive) {
        return isImpersonationActive === 'true';
      });
    }
  }, {
    key: 'refreshImpersonation',
    value: function refreshImpersonation(client) {
      var _this7 = this;

      return this.storage.get(authCommon.IMPERSONATION_USER_KEY).then(function (userId) {
        return client._do('/admin/users/' + userId + '/impersonate', 'POST', { refreshOnFailure: false, useRefreshToken: true });
      }).then(function (response) {
        return response.json();
      }).then(function (json) {
        return _this7.set(json);
      }).catch(function (e) {
        return _this7.stopImpersonation().then(function () {
          throw e; // rethrow
        });
      });
    }
  }, {
    key: 'startImpersonation',
    value: function startImpersonation(client, userId) {
      var _this8 = this;

      return this.authedId().then(function (authedId) {
        if (!authedId) {
          Promise.reject(new _errors.StitchError('Must auth first'));
        }
        return _this8.isImpersonatingUser();
      }).then(function (isImpersonatingUser) {
        if (isImpersonatingUser) {
          return Promise.reject(new _errors.StitchError('Already impersonating a user'));
        }

        return _this8.storage.set(authCommon.IMPERSONATION_ACTIVE_KEY, 'true');
      }).then(function () {
        return _this8.storage.set(authCommon.IMPERSONATION_USER_KEY, userId);
      }).then(function () {
        return _this8.storage.get(authCommon.USER_AUTH_KEY);
      }).then(function (userAuth) {
        var realUserAuth = JSON.parse(userAuth);
        return _this8.storage.set(authCommon.IMPERSONATION_REAL_USER_AUTH_KEY, JSON.stringify(realUserAuth));
      }).then(function () {
        return _this8.refreshImpersonation(client);
      });
    }
  }, {
    key: 'stopImpersonation',
    value: function stopImpersonation() {
      var _this9 = this;

      return this.isImpersonatingUser().then(function (isImpersonatingUser) {
        if (!isImpersonatingUser) {
          throw new _errors.StitchError('Not impersonating a user');
        }

        return _this9.storage.get(authCommon.IMPERSONATION_REAL_USER_AUTH_KEY);
      }).then(function (userAuth) {
        var realUserAuth = JSON.parse(userAuth);
        return _this9.set(realUserAuth);
      }).then(function () {
        return _this9.clearImpersonation();
      });
    }
  }, {
    key: 'clearImpersonation',
    value: function clearImpersonation() {
      return Promise.all([this.storage.remove(authCommon.IMPERSONATION_ACTIVE_KEY), this.storage.remove(authCommon.IMPERSONATION_USER_KEY), this.storage.remove(authCommon.IMPERSONATION_REAL_USER_AUTH_KEY)]);
    }
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
      var _ref;

      var parts = data.split('$');
      if (parts.length !== EMBEDDED_USER_AUTH_DATA_PARTS) {
        throw new RangeError('invalid user auth data provided: ' + data);
      }

      return _ref = {}, _defineProperty(_ref, this.codec.accessToken, parts[0]), _defineProperty(_ref, this.codec.refreshToken, parts[1]), _defineProperty(_ref, this.codec.userId, parts[2]), _defineProperty(_ref, this.codec.deviceId, parts[3]), _ref;
    }
  }]);

  return Auth;
}();

exports.default = Auth;
module.exports = exports['default'];