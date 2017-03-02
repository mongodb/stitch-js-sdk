'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* global window, fetch */

/* let authDataStorage;
if(window !== undefined && window.localStorage !== undefined){
  authDataStorage = window.localStorage
}

*/

var _common = require('./common');

var common = _interopRequireWildcard(_common);

var _jsBase = require('js-base64');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AuthDataStorage = function () {
  function AuthDataStorage() {
    _classCallCheck(this, AuthDataStorage);

    this._data = {};
  }

  _createClass(AuthDataStorage, [{
    key: 'setItem',
    value: function setItem(id, val) {
      this._data[id] = String(val);
    }
  }, {
    key: 'getItem',
    value: function getItem(id) {
      return this._data.hasOwnProperty(id) ? this._data[id] : undefined;
    }
  }, {
    key: 'removeItem',
    value: function removeItem(id) {
      return delete this._data[id];
    }
  }, {
    key: 'clear',
    value: function clear() {
      this._data = {};
    }
  }]);

  return AuthDataStorage;
}();

var Auth = function () {
  function Auth(rootUrl) {
    _classCallCheck(this, Auth);

    this.rootUrl = rootUrl;
    if (typeof window !== 'undefined' && window.localStorage !== undefined) {
      this.authDataStorage = window.localStorage;
    } else {
      this.authDataStorage = new AuthDataStorage();
    }
  }

  _createClass(Auth, [{
    key: 'pageRootUrl',
    value: function pageRootUrl() {
      return [window.location.protocol, '//', window.location.host, window.location.pathname].join('');
    }

    // The state we generate is to be used for any kind of request where we will
    // complete an authentication flow via a redirect. We store the generate in
    // a local storage bound to the app's origin. This ensures that any time we
    // receive a redirect, there must be a state parameter and it must match
    // what we ourselves have generated. This state MUST only be sent to
    // a trusted BaaS endpoint in order to preserve its integrity. BaaS will
    // store it in some way on its origin (currently a cookie stored on this client)
    // and use that state at the end of an auth flow as a parameter in the redirect URI.

  }, {
    key: 'setAccessToken',
    value: function setAccessToken(token) {
      var currAuth = this.get();
      currAuth['accessToken'] = token;
      currAuth['refreshToken'] = this.authDataStorage.getItem(common.REFRESH_TOKEN_KEY);
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
      var ourState = this.authDataStorage.getItem(common.STATE_KEY);
      if (typeof window === 'undefined') {
        // This means we're running in some environment other
        // than a browser - so handling a redirect makes no sense here.
        return;
      }
      var redirectFragment = window.location.hash.substring(1);
      var redirectState = common.parseRedirectFragment(redirectFragment, ourState);
      if (redirectState.lastError) {
        console.error('BaasClient: error from redirect: ' + redirectState.lastError);
        this._error = redirectState.lastError;
        window.history.replaceState(null, '', this.pageRootUrl());
        return;
      }
      if (!redirectState.found) {
        return;
      }
      this.authDataStorage.removeItem(common.STATE_KEY);
      if (!redirectState.stateValid) {
        console.error('BaasClient: state values did not match!');
        window.history.replaceState(null, '', this.pageRootUrl());
        return;
      }
      if (!redirectState.ua) {
        console.error('BaasClient: no UA value was returned from redirect!');
        return;
      }
      // If we get here, the state is valid - set auth appropriately.
      this.set(redirectState.ua);
      window.history.replaceState(null, '', this.pageRootUrl());
    }
  }, {
    key: 'getOAuthLoginURL',
    value: function getOAuthLoginURL(providerName, redirectUrl) {
      if (redirectUrl === undefined) {
        redirectUrl = this.pageRootUrl();
      }
      var state = Auth.generateState();
      this.authDataStorage.setItem(common.STATE_KEY, state);
      var result = this.rootUrl + '/oauth2/' + providerName + '?redirect=' + encodeURI(redirectUrl) + '&state=' + state;
      return result;
    }
  }, {
    key: 'anonymousAuth',
    value: function anonymousAuth(cors) {
      var _this = this;

      var init = {
        method: 'GET',
        headers: {
          'Accept': common.JSONTYPE,
          'Content-Type': common.JSONTYPE
        }
      };

      // TODO get rid of the cors flag. it should just be on all the time.
      if (cors) {
        init['cors'] = cors;
      }

      return fetch(this.rootUrl + '/anon/user', init).then(common.checkStatus).then(function (response) {
        return response.json().then(function (json) {
          _this.set(json);
          Promise.resolve();
        });
      });
    }
  }, {
    key: 'apiKeyAuth',
    value: function apiKeyAuth(key) {
      var _this2 = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { cors: true };

      var init = {
        method: 'POST',
        headers: {
          'Accept': common.JSONTYPE,
          'Content-Type': common.JSONTYPE
        },
        body: JSON.stringify({ 'key': key })
      };

      if (options && options.cors === false) {
        init['cors'] = false;
      } else {
        init['cors'] = true;
      }

      return fetch(this.rootUrl + '/api/key', init).then(common.checkStatus).then(function (response) {
        return response.json().then(function (json) {
          _this2.set(json);
          return Promise.resolve();
        });
      });
    }
  }, {
    key: 'localAuth',
    value: function localAuth(username, password) {
      var _this3 = this;

      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : { cors: true };

      var init = {
        method: 'POST',
        headers: {
          'Accept': common.JSONTYPE,
          'Content-Type': common.JSONTYPE
        },
        body: JSON.stringify({ 'username': username, 'password': password })
      };

      if (options && options.cors === false) {
        init['cors'] = false;
      } else {
        init['cors'] = true;
      }

      return fetch(this.rootUrl + '/local/userpass', init).then(common.checkStatus).then(function (response) {
        return response.json().then(function (json) {
          _this3.set(json);
          return Promise.resolve(json);
        });
      });
    }
  }, {
    key: 'clear',
    value: function clear() {
      this.authDataStorage.removeItem(common.USER_AUTH_KEY);
      this.authDataStorage.removeItem(common.REFRESH_TOKEN_KEY);
      this.clearImpersonation();
    }
  }, {
    key: 'getRefreshToken',
    value: function getRefreshToken() {
      return this.authDataStorage.getItem(common.REFRESH_TOKEN_KEY);
    }
  }, {
    key: 'set',
    value: function set(json) {
      var rt = json['refreshToken'];
      delete json['refreshToken'];

      var c = _jsBase.Base64.encode;
      this.authDataStorage.setItem(common.USER_AUTH_KEY, c(JSON.stringify(json)));
      this.authDataStorage.setItem(common.REFRESH_TOKEN_KEY, rt);
    }
  }, {
    key: 'get',
    value: function get() {
      if (!this.authDataStorage.getItem(common.USER_AUTH_KEY)) {
        return null;
      }
      var item = this.authDataStorage.getItem(common.USER_AUTH_KEY);
      return JSON.parse(_jsBase.Base64.decode(item));
    }
  }, {
    key: 'authedId',
    value: function authedId() {
      var id = ((this.get() || {}).user || {})._id;
      if (id) {
        return { '$oid': id };
      }
    }
  }, {
    key: 'isImpersonatingUser',
    value: function isImpersonatingUser() {
      return this.authDataStorage.getItem(common.IMPERSONATION_ACTIVE_KEY) === 'true';
    }
  }, {
    key: 'refreshImpersonation',
    value: function refreshImpersonation(client) {
      var _this4 = this;

      var userId = this.authDataStorage.getItem(common.IMPERSONATION_USER_KEY);
      return client._doAuthed('/admin/users/' + userId + '/impersonate', 'POST', { refreshOnFailure: false, useRefreshToken: true }).then(function (response) {
        return response.json().then(function (json) {
          json['refreshToken'] = _this4.authDataStorage.getItem(common.REFRESH_TOKEN_KEY);
          _this4.set(json);
          return Promise.resolve();
        });
      }).catch(function (e) {
        _this4.stopImpersonation();
        throw e;
      });
    }
  }, {
    key: 'startImpersonation',
    value: function startImpersonation(client, userId) {
      if (this.get() === null) {
        return Promise.reject(new common.BaasError('Must auth first'));
      }
      if (this.isImpersonatingUser()) {
        throw new common.BaasError('Already impersonating a user');
      }
      this.authDataStorage.setItem(common.IMPERSONATION_ACTIVE_KEY, 'true');
      this.authDataStorage.setItem(common.IMPERSONATION_USER_KEY, userId);

      var realUserAuth = JSON.parse(_jsBase.Base64.decode(this.authDataStorage.getItem(common.USER_AUTH_KEY)));
      realUserAuth['refreshToken'] = this.authDataStorage.getItem(common.REFRESH_TOKEN_KEY);
      this.authDataStorage.setItem(common.IMPERSONATION_REAL_USER_AUTH_KEY, _jsBase.Base64.encode(JSON.stringify(realUserAuth)));
      return this.refreshImpersonation(client);
    }
  }, {
    key: 'stopImpersonation',
    value: function stopImpersonation() {
      var root = this;
      return new Promise(function (resolve, reject) {
        if (!root.isImpersonatingUser()) {
          throw new common.BaasError('Not impersonating a user');
        }
        var realUserAuth = JSON.parse(_jsBase.Base64.decode(this.authDataStorage.getItem(common.IMPERSONATION_REAL_USER_AUTH_KEY)));
        root.set(realUserAuth);
        root.clearImpersonation();
        resolve();
      });
    }
  }, {
    key: 'clearImpersonation',
    value: function clearImpersonation() {
      this.authDataStorage.removeItem(common.IMPERSONATION_ACTIVE_KEY);
      this.authDataStorage.removeItem(common.IMPERSONATION_USER_KEY);
      this.authDataStorage.removeItem(common.IMPERSONATION_REAL_USER_AUTH_KEY);
    }
  }], [{
    key: 'generateState',
    value: function generateState() {
      var alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var state = '';
      var stateLength = 64;
      for (var i = 0; i < stateLength; i++) {
        var pos = Math.floor(Math.random() * alpha.length);
        state += alpha.substring(pos, pos + 1);
      }
      return state;
    }
  }]);

  return Auth;
}();

exports.default = Auth;