'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Auth = exports.AuthFactory = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* global window, document, fetch */

exports.newAuth = newAuth;

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

/** @private */

var AuthFactory = exports.AuthFactory = function () {
  function AuthFactory() {
    _classCallCheck(this, AuthFactory);

    throw new _errors.StitchError('Auth can only be made from the AuthFactory.create function');
  }

  _createClass(AuthFactory, null, [{
    key: 'create',
    value: function create(client, rootUrl, options) {
      return newAuth(client, rootUrl, options);
    }
  }]);

  return AuthFactory;
}();

/** @private */


function newAuth(client, rootUrl, options) {
  var auth = Object.create(Auth.prototype);
  var namespace = void 0;
  if (!client || client.clientAppID === '') {
    namespace = 'admin';
  } else {
    namespace = 'client.' + client.clientAppID;
  }

  options = Object.assign({
    codec: authCommon.APP_CLIENT_CODEC,
    namespace: namespace,
    storageType: 'localStorage'
  }, options);

  auth.client = client;
  auth.rootUrl = rootUrl;
  auth.codec = options.codec;
  auth.platform = options.platform || _platform;
  auth.storage = (0, _storage.createStorage)(options);
  auth.providers = (0, _providers.createProviders)(auth, options);

  return Promise.all([auth._get(), auth.storage.get(authCommon.REFRESH_TOKEN_KEY), auth.storage.get(authCommon.USER_LOGGED_IN_PT_KEY), auth.storage.get(authCommon.DEVICE_ID_KEY)]).then(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 4),
        authObj = _ref2[0],
        rt = _ref2[1],
        loggedInProviderType = _ref2[2],
        deviceId = _ref2[3];

    auth.auth = authObj;
    auth.authedId = authObj.userId;
    auth.rt = rt;
    auth.loggedInProviderType = loggedInProviderType;
    auth.deviceId = deviceId;

    return auth;
  });
}

/** @private */

var Auth = exports.Auth = function () {
  function Auth(client, rootUrl, options) {
    _classCallCheck(this, Auth);

    throw new _errors.StitchError('Auth can only be made from the AuthFactory.create function');
  }

  /**
   * Create the device info for this client.
   *
   * @private
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
      var _this2 = this;

      if (typeof window === 'undefined') {
        // This means we're running in some environment other
        // than a browser - so handling a redirect makes no sense here.
        return;
      }
      if (!window.location || !window.location.hash) {
        return;
      }

      return Promise.all([this.storage.get(authCommon.STATE_KEY), this.storage.get(authCommon.STITCH_REDIRECT_PROVIDER)]).then(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
            ourState = _ref4[0],
            redirectProvider = _ref4[1];

        var redirectFragment = window.location.hash.substring(1);
        var redirectState = _this2.parseRedirectFragment(redirectFragment, ourState);
        if (redirectState.lastError || redirectState.found && !redirectProvider) {
          console.error('StitchClient: error from redirect: ' + (redirectState.lastError ? redirectState.lastError : 'provider type not set'));
          _this2._error = redirectState.lastError;
          window.history.replaceState(null, '', _this2.pageRootUrl());
          return Promise.reject();
        }

        if (!redirectState.found) {
          return Promise.reject();
        }

        return Promise.all([_this2.storage.remove(authCommon.STATE_KEY), _this2.storage.remove(authCommon.STITCH_REDIRECT_PROVIDER)]).then(function () {
          return { redirectState: redirectState, redirectProvider: redirectProvider };
        });
      }).then(function (_ref5) {
        var redirectState = _ref5.redirectState,
            redirectProvider = _ref5.redirectProvider;

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
        return _this2.set(redirectState.ua, redirectProvider);
      }).then(function () {
        return window.history.replaceState(null, '', _this2.pageRootUrl());
      }).catch(function (error) {
        if (error) {
          throw error;
        }
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
      return this.set(userAuth, _providers.PROVIDER_TYPE_MONGODB_CLOUD).then(function () {
        return window.history.replaceState(null, '', _this3.pageRootUrl());
      });
    }
  }, {
    key: 'clear',
    value: function clear() {
      this.auth = null;
      this.authedId = null;
      this.rt = null;
      this.loggedInProviderType = null;

      return Promise.all([this.storage.remove(authCommon.USER_AUTH_KEY), this.storage.remove(authCommon.REFRESH_TOKEN_KEY), this.storage.remove(authCommon.USER_LOGGED_IN_PT_KEY), this.storage.remove(authCommon.STITCH_REDIRECT_PROVIDER)]);
    }
  }, {
    key: 'getDeviceId',
    value: function getDeviceId() {
      return this.deviceId;
    }

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
      return this.auth.accessToken;
    }
  }, {
    key: 'getRefreshToken',
    value: function getRefreshToken() {
      return this.rt;
    }
  }, {
    key: 'set',
    value: function set(json) {
      var _this4 = this;

      var authType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

      if (!json) {
        return;
      }

      var newUserAuth = {};
      var setters = [];

      if (authType) {
        this.loggedInProviderType = authType;
        setters.push(this.storage.set(authCommon.USER_LOGGED_IN_PT_KEY, authType));
      }

      if (json[this.codec.refreshToken]) {
        this.rt = json[this.codec.refreshToken];
        delete json[this.codec.refreshToken];
        setters.push(this.storage.set(authCommon.REFRESH_TOKEN_KEY, this.rt));
      }

      if (json[this.codec.deviceId]) {
        this.deviceId = json[this.codec.deviceId];
        delete json[this.codec.deviceId];
        setters.push(this.storage.set(authCommon.DEVICE_ID_KEY, this.deviceId));
      }

      // Merge in new fields with old fields. Typically the first json value
      // is complete with every field inside a user auth, but subsequent requests
      // do not include everything. This merging behavior is safe so long as json
      // value responses with absent fields do not indicate that the field should
      // be unset.
      if (json[this.codec.accessToken]) {
        newUserAuth.accessToken = json[this.codec.accessToken];
      }
      if (json[this.codec.userId]) {
        newUserAuth.userId = json[this.codec.userId];
      }

      this.auth = Object.assign(this.auth ? this.auth : {}, newUserAuth);
      this.authedId = this.auth.userId;
      setters.push(this.storage.set(authCommon.USER_AUTH_KEY, JSON.stringify(this.auth)));
      return Promise.all(setters).then(function () {
        return _this4.auth;
      });
    }
  }, {
    key: '_get',
    value: function _get() {
      var _this5 = this;

      return this.storage.get(authCommon.USER_AUTH_KEY).then(function (data) {
        if (!data) {
          return {};
        }

        try {
          return JSON.parse(data);
        } catch (e) {
          // Need to back out and clear auth otherwise we will never
          // be able to do anything useful.
          return _this5.clear().then(function () {
            throw new _errors.StitchError('Failure retrieving stored auth');
          });
        }
      });
    }
  }, {
    key: 'getLoggedInProviderType',
    value: function getLoggedInProviderType() {
      return this.loggedInProviderType;
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
      var _ref6;

      var parts = data.split('$');
      if (parts.length !== EMBEDDED_USER_AUTH_DATA_PARTS) {
        throw new RangeError('invalid user auth data provided: ' + data);
      }

      return _ref6 = {}, _defineProperty(_ref6, this.codec.accessToken, parts[0]), _defineProperty(_ref6, this.codec.refreshToken, parts[1]), _defineProperty(_ref6, this.codec.userId, parts[2]), _defineProperty(_ref6, this.codec.deviceId, parts[3]), _ref6;
    }
  }, {
    key: 'fetchArgsWithLink',
    value: function fetchArgsWithLink(fetchArgs, link) {
      if (link) {
        fetchArgs.headers.Authorization = 'Bearer ' + this.getAccessToken();
      }

      return fetchArgs;
    }
  }]);

  return Auth;
}();