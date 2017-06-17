'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* global window, document, fetch */

var _storage = require('./storage');

var _providers = require('./providers');

var _errors = require('../errors');

var _common = require('../common');

var common = _interopRequireWildcard(_common);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Auth = function () {
  function Auth(client, rootUrl, options) {
    _classCallCheck(this, Auth);

    options = Object.assign({}, {
      storageType: 'localStorage'
    }, options);

    this.client = client;
    this.rootUrl = rootUrl;
    this.storage = (0, _storage.createStorage)(options.storageType);
    this.providers = (0, _providers.createProviders)(this);
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

      var requestOptions = { refreshOnFailure: false, useRefreshToken: true };
      return this.client._do('/auth/newAccessToken', 'POST', requestOptions).then(function (response) {
        return response.json();
      }).then(function (json) {
        return _this.setAccessToken(json.accessToken);
      });
    }
  }, {
    key: 'pageRootUrl',
    value: function pageRootUrl() {
      return [window.location.protocol, '//', window.location.host, window.location.pathname].join('');
    }
  }, {
    key: 'setAccessToken',
    value: function setAccessToken(token) {
      var currAuth = this.get();
      currAuth.accessToken = token;
      currAuth.refreshToken = this.storage.get(common.REFRESH_TOKEN_KEY);
      this.set(currAuth);
    }
  }, {
    key: 'error',
    value: function error() {
      return this._error;
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

      var ourState = this.storage.get(common.STATE_KEY);
      var redirectFragment = window.location.hash.substring(1);
      var redirectState = common.parseRedirectFragment(redirectFragment, ourState);
      if (redirectState.lastError) {
        console.error('StitchClient: error from redirect: ' + redirectState.lastError);
        this._error = redirectState.lastError;
        window.history.replaceState(null, '', this.pageRootUrl());
        return;
      }

      if (!redirectState.found) {
        return;
      }

      this.storage.remove(common.STATE_KEY);
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

      var uaCookie = this.getCookie(common.USER_AUTH_COOKIE_NAME);
      if (!uaCookie) {
        return;
      }

      document.cookie = common.USER_AUTH_COOKIE_NAME + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;';
      var userAuth = common.unmarshallUserAuth(uaCookie);
      this.set(userAuth);
      window.history.replaceState(null, '', this.pageRootUrl());
    }
  }, {
    key: 'clear',
    value: function clear() {
      this.storage.remove(common.USER_AUTH_KEY);
      this.storage.remove(common.REFRESH_TOKEN_KEY);
      this.clearImpersonation();
    }
  }, {
    key: 'getAccessToken',
    value: function getAccessToken() {
      return this.get()['accessToken'];
    }
  }, {
    key: 'getRefreshToken',
    value: function getRefreshToken() {
      return this.storage.get(common.REFRESH_TOKEN_KEY);
    }
  }, {
    key: 'set',
    value: function set(json) {
      if (json && json.refreshToken) {
        var rt = json.refreshToken;
        delete json.refreshToken;
        this.storage.set(common.REFRESH_TOKEN_KEY, rt);
      }

      this.storage.set(common.USER_AUTH_KEY, JSON.stringify(json));
      return json;
    }
  }, {
    key: 'get',
    value: function get() {
      var data = this.storage.get(common.USER_AUTH_KEY);
      if (!data) {
        return {};
      }

      try {
        return JSON.parse(data);
      } catch (e) {
        // Need to back out and clear auth otherwise we will never
        // be able to do anything useful.
        this.clear();
        throw new _errors.StitchError('Failure retrieving stored auth');
      }
    }
  }, {
    key: 'authedId',
    value: function authedId() {
      var authData = this.get();
      if (authData.user) {
        return authData.user._id;
      }

      return authData.userId;
    }
  }, {
    key: 'isImpersonatingUser',
    value: function isImpersonatingUser() {
      return this.storage.get(common.IMPERSONATION_ACTIVE_KEY) === 'true';
    }
  }, {
    key: 'refreshImpersonation',
    value: function refreshImpersonation(client) {
      var _this2 = this;

      var userId = this.storage.get(common.IMPERSONATION_USER_KEY);
      return client._do('/admin/users/' + userId + '/impersonate', 'POST', { refreshOnFailure: false, useRefreshToken: true }).then(function (response) {
        return response.json();
      }).then(function (json) {
        json.refreshToken = _this2.storage.get(common.REFRESH_TOKEN_KEY);
        _this2.set(json);
      }).catch(function (e) {
        _this2.stopImpersonation();
        throw e; // rethrow
      });
    }
  }, {
    key: 'startImpersonation',
    value: function startImpersonation(client, userId) {
      if (this.get() === null) {
        return Promise.reject(new _errors.StitchError('Must auth first'));
      }

      if (this.isImpersonatingUser()) {
        return Promise.reject(new _errors.StitchError('Already impersonating a user'));
      }

      this.storage.set(common.IMPERSONATION_ACTIVE_KEY, 'true');
      this.storage.set(common.IMPERSONATION_USER_KEY, userId);

      var realUserAuth = JSON.parse(this.storage.get(common.USER_AUTH_KEY));
      realUserAuth.refreshToken = this.storage.get(common.REFRESH_TOKEN_KEY);
      this.storage.set(common.IMPERSONATION_REAL_USER_AUTH_KEY, JSON.stringify(realUserAuth));
      return this.refreshImpersonation(client);
    }
  }, {
    key: 'stopImpersonation',
    value: function stopImpersonation() {
      var _this3 = this;

      if (!this.isImpersonatingUser()) {
        throw new _errors.StitchError('Not impersonating a user');
      }

      return new Promise(function (resolve, reject) {
        var realUserAuth = JSON.parse(_this3.storage.get(common.IMPERSONATION_REAL_USER_AUTH_KEY));
        _this3.set(realUserAuth);
        _this3.clearImpersonation();
        resolve();
      });
    }
  }, {
    key: 'clearImpersonation',
    value: function clearImpersonation() {
      this.storage.remove(common.IMPERSONATION_ACTIVE_KEY);
      this.storage.remove(common.IMPERSONATION_USER_KEY);
      this.storage.remove(common.IMPERSONATION_REAL_USER_AUTH_KEY);
    }
  }]);

  return Auth;
}();

exports.default = Auth;