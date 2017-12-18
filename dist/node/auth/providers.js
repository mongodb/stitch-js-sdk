'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserPassProvider = exports.ProviderCache = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
/** @module auth  */


var _fetchUserId = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(auth, url, body) {
    var device, fetchArgs, response, json;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.t0 = getDeviceInfo;
            _context.next = 3;
            return auth.getDeviceId();

          case 3:
            _context.t1 = _context.sent;
            _context.t2 = auth.client.clientAppID;
            device = (0, _context.t0)(_context.t1, _context.t2);


            Object.assign(body, { options: { device: device } });
            fetchArgs = common.makeFetchArgs('POST', JSON.stringify(body));

            fetchArgs.cors = true;

            _context.next = 11;
            return fetch(url, fetchArgs);

          case 11:
            response = _context.sent;
            _context.prev = 12;
            _context.next = 15;
            return common.checkStatus(response);

          case 15:
            _context.next = 20;
            break;

          case 17:
            _context.prev = 17;
            _context.t3 = _context['catch'](12);
            return _context.abrupt('return', Promise.reject(_context.t3));

          case 20:
            _context.next = 22;
            return response.json();

          case 22:
            json = _context.sent;
            _context.next = 25;
            return auth.set(json);

          case 25:
            if (!(json.userId == null)) {
              _context.next = 27;
              break;
            }

            return _context.abrupt('return', json.user_id);

          case 27:
            return _context.abrupt('return', json.userId);

          case 28:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[12, 17]]);
  }));

  return function _fetchUserId(_x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
}();

// @namespace


exports.fetchProvider = fetchProvider;
exports.createProviders = createProviders;

var _common = require('../common');

var common = _interopRequireWildcard(_common);

var _common2 = require('./common');

var authCommon = _interopRequireWildcard(_common2);

var _index = require('./index.js');

var _index2 = _interopRequireDefault(_index);

var _util = require('../util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var providers = {
  anon: 'anon',
  apiKey: 'apiKey',
  google: 'google',
  facebook: 'facebook',
  mongodbCloud: 'mongodbCloud',
  userpass: 'userpass',
  custom: 'custom'
};

var ProviderCache = exports.ProviderCache = function () {
  function ProviderCache(auth) {
    _classCallCheck(this, ProviderCache);

    this.auth = auth;
    this._providerCache = {
      anon: AnonProvider,
      apiKey: ApiKeyProvider,
      google: GoogleProvider,
      facebook: FacebookProvider,
      mongodbCloud: MongoDBCloudProvider,
      userpass: UserPassProvider,
      custom: CustomProvider
    };
    this._providerMap = {};
  }

  _createClass(ProviderCache, [{
    key: 'get',
    value: function get(provider) {
      var providerInst = this._providerMap[provider];
      if (providerInst != null) {
        return providerInst;
      }

      var ctor = this._providerCache[provider];
      providerInst = new ctor(this.auth);
      if (providerInst == null) {
        throw new Error('Invalid auth provider specified: ' + provider);
      }
      this._providerMap[provider] = providerInst;
      return providerInst;
    }
  }]);

  return ProviderCache;
}();

/**
 * Create the device info for this client.
 *
 * @memberof module:auth
 * @method getDeviceInfo
 * @param {String} deviceId the id of this device
 * @param {String} appId The app ID for this client
 * @param {string} appVersion The version of the app
 * @returns {Object} The device info object
 */


function getDeviceInfo(deviceId, appId) {
  var appVersion = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

  var deviceInfo = { appId: appId, appVersion: appVersion, sdkVersion: common.SDK_VERSION };

  if (deviceId) {
    deviceInfo.deviceId = deviceId;
  }

  var platform = (0, _util.getPlatform)();

  if (platform) {
    deviceInfo.platform = platform.name;
    deviceInfo.platformVersion = platform.version;
  }

  return deviceInfo;
}

var AnonProvider = function () {
  function AnonProvider(auth) {
    _classCallCheck(this, AnonProvider);

    this.auth = auth;
    this.providerType = providers.anon;
  }

  /**
   * Login to a stitch application using anonymous authentication
   *
   * @memberof anonProvider
   * @instance
   * @returns {Promise} a promise that resolves when authentication succeeds.
   */


  _createClass(AnonProvider, [{
    key: 'authenticate',
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var device;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.t0 = getDeviceInfo;
                _context2.next = 3;
                return this.auth.getDeviceId();

              case 3:
                _context2.t1 = _context2.sent;
                _context2.t2 = this.auth.client.clientAppID;
                device = (0, _context2.t0)(_context2.t1, _context2.t2);
                _context2.next = 8;
                return _fetchUserId(this.auth, this.auth.rootUrl + '/providers/anon-user/login?device=' + (0, _util.uriEncodeObject)(device), device);

              case 8:
                return _context2.abrupt('return', _context2.sent);

              case 9:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function authenticate() {
        return _ref2.apply(this, arguments);
      }

      return authenticate;
    }()
  }]);

  return AnonProvider;
}();

var CustomProvider = function () {
  function CustomProvider(auth) {
    _classCallCheck(this, CustomProvider);

    this.auth = auth;
    this.providerType = providers.custom;
    this.providerRoute = 'providers/custom-token';
    this.loginRoute = this.providerRoute + '/login';
  }

  /**
   * Login to a stitch application using custom authentication
   *
   * @memberof customProvider
   * @instance
   * @param {String} JWT token to use for authentication
   * @returns {Promise} a promise that resolves when authentication succeeds.
   */


  _createClass(CustomProvider, [{
    key: 'authenticate',
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(_ref4) {
        var token = _ref4.token;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return _fetchUserId(this.auth, this.auth.rootUrl + '/' + this.loginRoute, { token: token });

              case 2:
                return _context3.abrupt('return', _context3.sent);

              case 3:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function authenticate(_x5) {
        return _ref3.apply(this, arguments);
      }

      return authenticate;
    }()
  }]);

  return CustomProvider;
}();

var UserPassProvider = exports.UserPassProvider = function () {
  // The ternary expression here is redundant but is just preserving previous behavior based on whether or not
  // the client is for the admin or client API.
  function UserPassProvider(auth) {
    _classCallCheck(this, UserPassProvider);

    this.auth = auth;
    this.providerType = providers.userpass;
    this.providerRoute = this.auth.isAppClient() ? 'providers/local-userpass' : 'providers/local-userpass';
    this.loginRoute = this.auth.isAppClient() ? this.providerRoute + '/login' : this.providerRoute + '/login';
  }

  /**
   * Login to a stitch application using username and password authentication
   *
   * @memberof userPassProvider
   * @instance
   * @param {String} username the username to use for authentication
   * @param {String} password the password to use for authentication
   * @returns {Promise} a promise that resolves when authentication succeeds.
   */


  _createClass(UserPassProvider, [{
    key: 'authenticate',
    value: function () {
      var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(_ref6) {
        var username = _ref6.username,
            password = _ref6.password;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return _fetchUserId(this.auth, this.auth.rootUrl + '/' + this.loginRoute, { username: username, password: password });

              case 2:
                return _context4.abrupt('return', _context4.sent);

              case 3:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function authenticate(_x6) {
        return _ref5.apply(this, arguments);
      }

      return authenticate;
    }()

    /**
     * Completes the confirmation workflow from the stitch server
     * @memberof userPassProvider
     * @instance
     * @param {String} tokenId the tokenId provided by the stitch server
     * @param {String} token the token provided by the stitch server
     * @returns {Promise}
     */

  }, {
    key: 'emailConfirm',
    value: function () {
      var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(tokenId, token) {
        var fetchArgs;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ tokenId: tokenId, token: token }));

                fetchArgs.cors = true;

                return _context5.abrupt('return', fetch(this.auth.rootUrl + '/' + this.providerRoute + '/confirm', fetchArgs).then(common.checkStatus).then(function (response) {
                  return response.json();
                }));

              case 3:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function emailConfirm(_x7, _x8) {
        return _ref7.apply(this, arguments);
      }

      return emailConfirm;
    }()

    /**
     * Request that the stitch server send another email confirmation
     * for account creation.
     *
     * @memberof userPassProvider
     * @instance
     * @param {String} email the email to send a confirmation email for
     * @returns {Promise}
     */

  }, {
    key: 'sendEmailConfirm',
    value: function () {
      var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(email) {
        var fetchArgs;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ email: email }));

                fetchArgs.cors = true;

                return _context6.abrupt('return', fetch(this.auth.rootUrl + '/' + this.providerRoute + '/confirm/send', fetchArgs).then(common.checkStatus).then(function (response) {
                  return response.json();
                }));

              case 3:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function sendEmailConfirm(_x9) {
        return _ref8.apply(this, arguments);
      }

      return sendEmailConfirm;
    }()

    /**
     * Sends a password reset request to the stitch server
     *
     * @memberof userPassProvider
     * @instance
     * @param {String} email the email of the account to reset the password for
     * @returns {Promise}
     */

  }, {
    key: 'sendPasswordReset',
    value: function () {
      var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(email) {
        var fetchArgs;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ email: email }));

                fetchArgs.cors = true;

                return _context7.abrupt('return', fetch(this.auth.rootUrl + '/' + this.providerRoute + '/reset/send', fetchArgs).then(common.checkStatus).then(function (response) {
                  return response.json();
                }));

              case 3:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function sendPasswordReset(_x10) {
        return _ref9.apply(this, arguments);
      }

      return sendPasswordReset;
    }()

    /**
     * Use information returned from the stitch server to complete the password
     * reset flow for a given email account, providing a new password for the account.
     *
     * @memberof userPassProvider
     * @instance
     * @param {String} tokenId the tokenId provided by the stitch server
     * @param {String} token the token provided by the stitch server
     * @param {String} password the new password requested for this account
     * @returns {Promise}
     */

  }, {
    key: 'passwordReset',
    value: function () {
      var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(tokenId, token, password) {
        var fetchArgs;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ tokenId: tokenId, token: token, password: password }));

                fetchArgs.cors = true;

                return _context8.abrupt('return', fetch(this.auth.rootUrl + '/' + this.providerRoute + '/reset', fetchArgs).then(common.checkStatus).then(function (response) {
                  return response.json();
                }));

              case 3:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function passwordReset(_x11, _x12, _x13) {
        return _ref10.apply(this, arguments);
      }

      return passwordReset;
    }()

    /**
     * Will trigger an email to the requested account containing a link with the
     * token and tokenId that must be returned to the server using emailConfirm()
     * to activate the account.
     *
     * @memberof userPassProvider
     * @instance
     * @param {String} email the requested email for the account
     * @param {String} password the requested password for the account
     * @returns {Promise}
     */

  }, {
    key: 'register',
    value: function () {
      var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(email, password) {
        var fetchArgs;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ email: email, password: password }));

                fetchArgs.cors = true;

                return _context9.abrupt('return', fetch(this.auth.rootUrl + '/' + this.providerRoute + '/register', fetchArgs).then(common.checkStatus).then(function (response) {
                  return response.json();
                }));

              case 3:
              case 'end':
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function register(_x14, _x15) {
        return _ref11.apply(this, arguments);
      }

      return register;
    }()
  }]);

  return UserPassProvider;
}();

var ApiKeyProvider = function () {
  function ApiKeyProvider(auth) {
    _classCallCheck(this, ApiKeyProvider);

    this.auth = auth;
    this.providerType = providers.apiKey;
    this.loginRoute = this.auth.isAppClient() ? 'providers/api-key/login' : 'providers/api-key/login';
  }
  /**
   * Login to a stitch application using an api key
   *
   * @memberof apiKeyProvider
   * @instance
   * @param {String} key the key for authentication
   * @returns {Promise} a promise that resolves when authentication succeeds.
   */

  // The ternary expression here is redundant but is just preserving previous behavior based on whether or not
  // the client is for the admin or client API.


  _createClass(ApiKeyProvider, [{
    key: 'authenticate',
    value: function () {
      var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(key) {
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                _context10.next = 2;
                return _fetchUserId(this.auth, this.auth.rootUrl + '/' + this.loginRoute, { key: key });

              case 2:
                return _context10.abrupt('return', _context10.sent);

              case 3:
              case 'end':
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function authenticate(_x16) {
        return _ref12.apply(this, arguments);
      }

      return authenticate;
    }()
  }]);

  return ApiKeyProvider;
}();

var GoogleProvider = function () {
  function GoogleProvider(auth) {
    _classCallCheck(this, GoogleProvider);

    this.auth = auth;
    this.providerType = providers.google;
    this.loginRoute = this.auth.isAppClient() ? 'providers/oauth2-google/login' : 'providers/oauth2-google/login';
  }

  /**
   * Login to a stitch application using google authentication
   *
   * @memberof googleProvider
   * @instance
   * @param {Object} data the redirectUrl data to use for authentication
   * @returns {Promise} a promise that resolves when authentication succeeds.
   */


  _createClass(GoogleProvider, [{
    key: 'authenticate',
    value: function () {
      var _ref13 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(data) {
        var authCode, redirectUrl;
        return regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                authCode = data.authCode;

                if (!(authCode !== null)) {
                  _context11.next = 5;
                  break;
                }

                _context11.next = 4;
                return _fetchUserId(this.auth, this.auth.rootUrl + '/' + this.loginRoute, { authCode: authCode });

              case 4:
                return _context11.abrupt('return', _context11.sent);

              case 5:
                redirectUrl = data && data.redirectUrl ? data.redirectUrl : undefined;

                window.location.replace(getOAuthLoginURL(this.auth, 'google', redirectUrl));
                return _context11.abrupt('return', Promise.resolve(''));

              case 8:
              case 'end':
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function authenticate(_x17) {
        return _ref13.apply(this, arguments);
      }

      return authenticate;
    }()
  }]);

  return GoogleProvider;
}();

var FacebookProvider = function () {
  function FacebookProvider(auth) {
    _classCallCheck(this, FacebookProvider);

    this.auth = auth;
    this.providerType = providers.facebook;
    this.loginRoute = this.auth.isAppClient() ? 'providers/oauth2-facebook/login' : 'providers/oauth2-facebook/login';
  }

  /**
   * Login to a stitch application using facebook authentication
   *
   * @memberof facebookProvider
   * @instance
   * @param {Object} data the redirectUrl data to use for authentication
   * @returns {Promise} a promise that resolves when authentication succeeds.
   */


  _createClass(FacebookProvider, [{
    key: 'authenticate',
    value: function () {
      var _ref14 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(data) {
        var accessToken, redirectUrl;
        return regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                accessToken = data.accessToken;

                if (!(accessToken !== null)) {
                  _context12.next = 5;
                  break;
                }

                _context12.next = 4;
                return _fetchUserId(this.auth, this.auth.rootUrl + '/' + this.loginRoute, { accessToken: accessToken });

              case 4:
                return _context12.abrupt('return', _context12.sent);

              case 5:
                redirectUrl = data && data.redirectUrl ? data.redirectUrl : undefined;

                window.location.replace(getOAuthLoginURL(this.auth, 'facebook', redirectUrl));
                return _context12.abrupt('return', Promise.resolve(''));

              case 8:
              case 'end':
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function authenticate(_x18) {
        return _ref14.apply(this, arguments);
      }

      return authenticate;
    }()
  }]);

  return FacebookProvider;
}();

var MongoDBCloudProvider = function () {
  function MongoDBCloudProvider(auth) {
    _classCallCheck(this, MongoDBCloudProvider);

    this.auth = auth;
    this.providerType = providers.mongodbCloud;
    this.loginRoute = this.auth.isAppClient() ? 'providers/mongodb-cloud/login' : 'providers/mongodb-cloud/login';
  }

  /**
   * Login to a stitch application using mongodb cloud authentication
   *
   * @memberof mongodbCloudProvider
   * @instance
   * @param {Object} data the username, apiKey, cors, and cookie data to use for authentication
   * @returns {Promise} a promise that resolves when authentication succeeds.
   */


  _createClass(MongoDBCloudProvider, [{
    key: 'authenticate',
    value: function () {
      var _ref15 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13(data) {
        var username, apiKey, cors, cookie, options, device, fetchArgs, url, response, json;
        return regeneratorRuntime.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                username = data.username, apiKey = data.apiKey, cors = data.cors, cookie = data.cookie;
                options = Object.assign({}, { cors: true, cookie: false }, { cors: cors, cookie: cookie });
                device = getDeviceInfo(this.auth.getDeviceId(), this.auth.client.clientAppID);
                fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ username: username, apiKey: apiKey, options: { device: device } }));

                fetchArgs.cors = true; // TODO: shouldn't this use the passed in `cors` value?
                fetchArgs.credentials = 'include';

                url = this.auth.rootUrl + '/' + this.loginRoute;

                if (!options.cookie) {
                  _context13.next = 9;
                  break;
                }

                return _context13.abrupt('return', fetch(url + '?cookie=true', fetchArgs).then(common.checkStatus));

              case 9:
                _context13.next = 11;
                return fetch(url, fetchArgs);

              case 11:
                response = _context13.sent;
                _context13.next = 14;
                return common.checkStatus(response);

              case 14:
                _context13.next = 16;
                return response.json();

              case 16:
                json = _context13.sent;

                this.auth.set(json);

                if (!(json.userId == null)) {
                  _context13.next = 20;
                  break;
                }

                return _context13.abrupt('return', json.user_id);

              case 20:
                return _context13.abrupt('return', json.userId);

              case 21:
              case 'end':
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));

      function authenticate(_x19) {
        return _ref15.apply(this, arguments);
      }

      return authenticate;
    }()
  }]);

  return MongoDBCloudProvider;
}();

// The state we generate is to be used for any kind of request where we will
// complete an authentication flow via a redirect. We store the generate in
// a local storage bound to the app's origin. This ensures that any time we
// receive a redirect, there must be a state parameter and it must match
// what we ourselves have generated. This state MUST only be sent to
// a trusted Stitch endpoint in order to preserve its integrity. Stitch will
// store it in some way on its origin (currently a cookie stored on this client)
// and use that state at the end of an auth flow as a parameter in the redirect URI.


var alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
function generateState() {
  var state = '';
  for (var i = 0; i < 64; ++i) {
    state += alpha.charAt(Math.floor(Math.random() * alpha.length));
  }

  return state;
}

function getOAuthLoginURL(auth, providerName, maybeRedirectUrl) {
  var redirectUrl;
  if (maybeRedirectUrl == null) {
    redirectUrl = auth.pageRootUrl();
  } else {
    redirectUrl = maybeRedirectUrl;
  }

  var state = generateState();
  auth.storage.set(authCommon.STATE_KEY, state);

  var device = getDeviceInfo(auth.getDeviceId(), auth.client.clientAppID);

  var result = auth.rootUrl + '/providers/oauth2-' + providerName + '/login?redirect=' + encodeURI(redirectUrl) + '&state=' + state + '&device=' + (0, _util.uriEncodeObject)(device);
  return result;
}

function fetchProvider(auth, ctor) {
  return new ctor(auth);
}

// TODO: support auth-specific options
function createProviders(auth) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return {
    anon: new AnonProvider(auth),
    apiKey: new ApiKeyProvider(auth),
    google: new GoogleProvider(auth),
    facebook: new FacebookProvider(auth),
    mongodbCloud: new MongoDBCloudProvider(auth),
    userpass: new UserPassProvider(auth),
    custom: new CustomProvider(auth)
  };
}