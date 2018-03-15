'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StitchClient = exports.StitchClientFactory = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* global window, fetch */
/* eslint no-labels: ['error', { 'allowLoop': true }] */


exports.newStitchClient = newStitchClient;

require('fetch-everywhere');

var _auth = require('./auth');

var _providers = require('./auth/providers');

var _common = require('./auth/common');

var _services = require('./services');

var _services2 = _interopRequireDefault(_services);

var _common2 = require('./common');

var common = _interopRequireWildcard(_common2);

var _mongodbExtjson = require('mongodb-extjson');

var _mongodbExtjson2 = _interopRequireDefault(_mongodbExtjson);

var _queryString = require('query-string');

var _queryString2 = _interopRequireDefault(_queryString);

var _errors = require('./errors');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var v1 = 1;
var v2 = 2;
var v3 = 3;
var API_TYPE_PUBLIC = 'public';
var API_TYPE_PRIVATE = 'private';
var API_TYPE_CLIENT = 'client';
var API_TYPE_APP = 'app';

/**
  * StitchClientFactory is a singleton factory class which can be used to
  * asynchronously create instances of {@link StitchClient}. StitchClientFactory
  * is not meant to be instantiated. Use the static `create()` method to build
  * a new StitchClient.
  */

var StitchClientFactory = exports.StitchClientFactory = function () {
  /**
   * @hideconstructor
   */
  function StitchClientFactory() {
    _classCallCheck(this, StitchClientFactory);

    throw new _errors.StitchError('StitchClient can only be made from the StitchClientFactory.create function');
  }

  /**
   * Creates a new {@link StitchClient}.
   *
   * @param {String} clientAppID the app ID of the Stitch application, which can be found in
   * the "Clients" page of the Stitch admin console.
   * @param {Object} [options = {}] additional options for creating the {@link StitchClient}.
   */


  _createClass(StitchClientFactory, null, [{
    key: 'create',
    value: function create(clientAppID) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      return newStitchClient(StitchClient.prototype, clientAppID, options);
    }
  }]);

  return StitchClientFactory;
}();

function newStitchClient(prototype, clientAppID) {
  var _v, _v2, _v3, _stitchClient$rootURL;

  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var stitchClient = Object.create(prototype);
  var baseUrl = common.DEFAULT_STITCH_SERVER_URL;
  if (options.baseUrl) {
    baseUrl = options.baseUrl;
  }

  stitchClient.clientAppID = clientAppID;

  stitchClient.authUrl = clientAppID ? baseUrl + '/api/client/v2.0/app/' + clientAppID + '/auth' : baseUrl + '/api/admin/v3.0/auth';

  stitchClient.rootURLsByAPIVersion = (_stitchClient$rootURL = {}, _defineProperty(_stitchClient$rootURL, v1, (_v = {}, _defineProperty(_v, API_TYPE_PUBLIC, baseUrl + '/api/public/v1.0'), _defineProperty(_v, API_TYPE_CLIENT, baseUrl + '/api/client/v1.0'), _defineProperty(_v, API_TYPE_PRIVATE, baseUrl + '/api/private/v1.0'), _defineProperty(_v, API_TYPE_APP, clientAppID ? baseUrl + '/api/client/v1.0/app/' + clientAppID : baseUrl + '/api/public/v1.0'), _v)), _defineProperty(_stitchClient$rootURL, v2, (_v2 = {}, _defineProperty(_v2, API_TYPE_PUBLIC, baseUrl + '/api/public/v2.0'), _defineProperty(_v2, API_TYPE_CLIENT, baseUrl + '/api/client/v2.0'), _defineProperty(_v2, API_TYPE_PRIVATE, baseUrl + '/api/private/v2.0'), _defineProperty(_v2, API_TYPE_APP, clientAppID ? baseUrl + '/api/client/v2.0/app/' + clientAppID : baseUrl + '/api/public/v2.0'), _v2)), _defineProperty(_stitchClient$rootURL, v3, (_v3 = {}, _defineProperty(_v3, API_TYPE_PUBLIC, baseUrl + '/api/public/v3.0'), _defineProperty(_v3, API_TYPE_CLIENT, baseUrl + '/api/client/v3.0'), _defineProperty(_v3, API_TYPE_APP, clientAppID ? baseUrl + '/api/client/v3.0/app/' + clientAppID : baseUrl + '/api/admin/v3.0'), _v3)), _stitchClient$rootURL);

  var authOptions = {
    codec: _common.APP_CLIENT_CODEC,
    storage: options.storage
  };

  if (options.storageType) {
    authOptions.storageType = options.storageType;
  }
  if (options.platform) {
    authOptions.platform = options.platform;
  }
  if (options.authCodec) {
    authOptions.codec = options.authCodec;
  }

  var authPromise = _auth.AuthFactory.create(stitchClient, stitchClient.authUrl, authOptions);
  return authPromise.then(function (auth) {
    stitchClient.auth = auth;
    return Promise.all([stitchClient.auth.handleRedirect(), stitchClient.auth.handleCookie()]);
  }).then(function () {
    return stitchClient;
  });
}
/**
 * StitchClient is the fundamental way of communicating with MongoDB Stitch in your
 * application. Use StitchClient to authenticate users and to access Stitch services.
 * StitchClient is not meant to be instantiated directly. Use a
 * {@link StitchClientFactory} to create one.
 */

var StitchClient = exports.StitchClient = function () {
  /**
   * @hideconstructor
   */
  function StitchClient() {
    _classCallCheck(this, StitchClient);

    var classname = this.constructor.name;
    throw new _errors.StitchError(classname + ' can only be made from the ' + classname + 'Factory.create function');
  }

  _createClass(StitchClient, [{
    key: 'login',


    /**
     * Login to Stitch instance, optionally providing a username and password. In
     * the event that these are omitted, anonymous authentication is used.
     *
     * @param {String} [email] the email address used for login
     * @param {String} [password] the password for the provided email address
     * @param {Object} [options = {}] additional authentication options
     * @returns {Promise} which resolve to a String value: the authenticated user ID.
     */
    value: function login(email, password) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      if (email === undefined || password === undefined) {
        return this.authenticate(_providers.PROVIDER_TYPE_ANON, options);
      }

      return this.authenticate('userpass', Object.assign({ username: email, password: password }, options));
    }

    /**
     * Send a request to the server indicating the provided email would like
     * to sign up for an account. This will trigger a confirmation email containing
     * a token which must be used with the `emailConfirm` method of the `userpass`
     * auth provider in order to complete registration. The user will not be able
     * to log in until that flow has been completed.
     *
     * @param {String} email the email used to sign up for the app
     * @param {String} password the password used to sign up for the app
     * @param {Object} [options = {}] additional authentication options
     * @returns {Promise}
     */

  }, {
    key: 'register',
    value: function register(email, password) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      return this.auth.provider('userpass').register(email, password, options);
    }

    /**
     * Links the currently logged in user with another identity.
     *
     * @param {String} providerType the provider of the other identity (e.g. 'userpass', 'facebook', 'google')
     * @param {Object} [options = {}] additional authentication options
     * @returns {Promise} which resolves to a String value: the original user ID
     */

  }, {
    key: 'linkWithProvider',
    value: function linkWithProvider(providerType) {
      var _this = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (!this.isAuthenticated()) {
        throw new _errors.StitchError('Must be authenticated to link an account');
      }

      return this.auth.provider(providerType).authenticate(options, true).then(function () {
        return _this.authedId();
      });
    }

    /**
     * Submits an authentication request to the specified provider providing any
     * included options (read: user data).  If auth data already exists and the
     * existing auth data has an access token, then these credentials are returned.
     *
     * @param {String} providerType the provider used for authentication (The possible
     *                 options are 'anon', 'userpass', 'custom', 'facebook', 'google',
     *                 and 'apiKey')
     * @param {Object} [options = {}] additional authentication options
     * @returns {Promise} which resolves to a String value: the authenticated user ID
     */

  }, {
    key: 'authenticate',
    value: function authenticate(providerType) {
      var _this2 = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      // reuse existing auth if present
      var authenticateFn = function authenticateFn() {
        return _this2.auth.provider(providerType).authenticate(options).then(function () {
          return _this2.authedId();
        });
      };

      if (this.isAuthenticated()) {
        if (providerType === _providers.PROVIDER_TYPE_ANON && this.auth.getLoggedInProviderType() === _providers.PROVIDER_TYPE_ANON) {
          return Promise.resolve(this.auth.authedId); // is authenticated, skip log in
        }

        return this.logout().then(function () {
          return authenticateFn();
        }); // will not be authenticated, continue log in
      }

      // is not authenticated, continue log in
      return authenticateFn();
    }

    /**
     * Ends the session for the current user, and clears auth information from storage.
     *
     * @returns {Promise}
     */

  }, {
    key: 'logout',
    value: function logout() {
      var _this3 = this;

      return this._do('/auth/session', 'DELETE', {
        refreshOnFailure: false,
        useRefreshToken: true,
        rootURL: this.rootURLsByAPIVersion[v2][API_TYPE_CLIENT]
      }).then(function () {
        return _this3.auth.clear();
      }, function () {
        return _this3.auth.clear();
      });
    }

    /**
     * @returns {*} Returns any error from the Stitch authentication system.
     */

  }, {
    key: 'authError',
    value: function authError() {
      return this.auth.error();
    }

    /**
     * Returns profile information for the currently logged in user.
     *
     * @returns {Promise} which resolves to a a JSON object containing user profile information.
     */

  }, {
    key: 'userProfile',
    value: function userProfile() {
      return this._do('/auth/profile', 'GET', { rootURL: this.rootURLsByAPIVersion[v2][API_TYPE_CLIENT] }).then(function (response) {
        return response.json();
      });
    }

    /**
    * @returns {Boolean} whether or not the current client is authenticated.
    */

  }, {
    key: 'isAuthenticated',
    value: function isAuthenticated() {
      return !!this.authedId();
    }

    /**
     *  @returns {String} a string of the currently authenticated user's ID.
     */

  }, {
    key: 'authedId',
    value: function authedId() {
      return this.auth.authedId;
    }

    /**
     * Factory method for accessing Stitch services.
     *
     * @method
     * @param {String} type the service type (e.g. "mongodb", "aws-s3", "aws-ses", "twilio", "http", etc.)
     * @param {String} name the service name specified in the Stitch admin console.
     * @returns {Object} returns an instance of the specified service type.
     */

  }, {
    key: 'service',
    value: function service(type, name) {
      if (this.constructor !== StitchClient) {
        throw new _errors.StitchError('`service` is a factory method, do not use `new`');
      }

      if (!_services2.default.hasOwnProperty(type)) {
        throw new _errors.StitchError('Invalid service type specified: ' + type);
      }

      var ServiceType = _services2.default[type];
      return new ServiceType(this, name);
    }

    /**
     * Executes a function.
     *
     * @param {String} name The name of the function.
     * @param {...*} args Arguments to pass to the function.
     */

  }, {
    key: 'executeFunction',
    value: function executeFunction(name) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return this._doFunctionCall({
        name: name,
        arguments: args
      });
    }

    /**
     * Executes a service function.
     *
     * @param {String} service The name of the service.
     * @param {String} action The name of the service action.
     * @param {...*} args Arguments to pass to the service action.
     */

  }, {
    key: 'executeServiceFunction',
    value: function executeServiceFunction(service, action) {
      for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        args[_key2 - 2] = arguments[_key2];
      }

      return this._doFunctionCall({
        service: service,
        name: action,
        arguments: args
      });
    }
  }, {
    key: '_doFunctionCall',
    value: function _doFunctionCall(request) {
      var responseDecoder = function responseDecoder(d) {
        return _mongodbExtjson2.default.parse(d, { strict: false });
      };
      var responseEncoder = function responseEncoder(d) {
        return _mongodbExtjson2.default.stringify(d);
      };

      return this._do('/functions/call', 'POST', { body: responseEncoder(request) }).then(function (response) {
        return response.text();
      }).then(function (body) {
        return responseDecoder(body);
      });
    }

    /**
     * Returns an access token for the user
     *
     * @private
     * @returns {Promise}
     */

  }, {
    key: 'doSessionPost',
    value: function doSessionPost() {
      return this._do('/auth/session', 'POST', {
        refreshOnFailure: false,
        useRefreshToken: true,
        rootURL: this.rootURLsByAPIVersion[v2][API_TYPE_CLIENT]
      }).then(function (response) {
        return response.json();
      });
    }

    /**
     * Returns the user API keys associated with the current user.
     *
     * @returns {Promise} which resolves to an array of API key objects
     */

  }, {
    key: 'getApiKeys',
    value: function getApiKeys() {
      return this._do('/auth/api_keys', 'GET', {
        rootURL: this.rootURLsByAPIVersion[v2][API_TYPE_CLIENT],
        useRefreshToken: true
      }).then(function (response) {
        return response.json();
      });
    }

    /**
     * Creates a user API key that can be used to authenticate as the current user.
     *
     * @param {String} userApiKeyName a unique name for the user API key
     * @returns {Promise} which resolves to an API key object containing the API key value
     */

  }, {
    key: 'createApiKey',
    value: function createApiKey(userApiKeyName) {
      return this._do('/auth/api_keys', 'POST', { rootURL: this.rootURLsByAPIVersion[v2][API_TYPE_CLIENT],
        useRefreshToken: true,
        body: JSON.stringify({ 'name': userApiKeyName })
      }).then(function (response) {
        return response.json();
      });
    }

    /**
     * Returns a user API key associated with the current user.
     *
     * @param {String} keyID the ID of the key to fetch
     * @returns {Promise} which resolves to an API key object, although the API key value will be omitted
     */

  }, {
    key: 'getApiKeyByID',
    value: function getApiKeyByID(keyID) {
      return this._do('/auth/api_keys/' + keyID, 'GET', {
        rootURL: this.rootURLsByAPIVersion[v2][API_TYPE_CLIENT],
        useRefreshToken: true
      }).then(function (response) {
        return response.json();
      });
    }

    /**
     * Deletes a user API key associated with the current user.
     *
     * @param {String} keyID the ID of the key to delete
     * @returns {Promise}
     */

  }, {
    key: 'deleteApiKeyByID',
    value: function deleteApiKeyByID(keyID) {
      return this._do('/auth/api_keys/' + keyID, 'DELETE', {
        rootURL: this.rootURLsByAPIVersion[v2][API_TYPE_CLIENT],
        useRefreshToken: true
      });
    }

    /**
     * Enables a user API key associated with the current user.
     *
     * @param {String} keyID the ID of the key to enable
     * @returns {Promise}
     */

  }, {
    key: 'enableApiKeyByID',
    value: function enableApiKeyByID(keyID) {
      return this._do('/auth/api_keys/' + keyID + '/enable', 'PUT', {
        rootURL: this.rootURLsByAPIVersion[v2][API_TYPE_CLIENT],
        useRefreshToken: true
      });
    }

    /**
     * Disables a user API key associated with the current user.
     *
     * @param {String} keyID the ID of the key to disable
     * @returns {Promise}
     */

  }, {
    key: 'disableApiKeyByID',
    value: function disableApiKeyByID(keyID) {
      return this._do('/auth/api_keys/' + keyID + '/disable', 'PUT', {
        rootURL: this.rootURLsByAPIVersion[v2][API_TYPE_CLIENT],
        useRefreshToken: true
      });
    }
  }, {
    key: '_fetch',
    value: function _fetch(url, fetchArgs, resource, method, options) {
      var _this4 = this;

      return fetch(url, fetchArgs).then(function (response) {
        // Okay: passthrough
        if (response.status >= 200 && response.status < 300) {
          return Promise.resolve(response);
        }

        if (response.headers.get('Content-Type') === common.JSONTYPE) {
          return response.json().then(function (json) {
            // Only want to try refreshing token when there's an invalid session
            if ('error_code' in json && json.error_code === _errors.ErrInvalidSession) {
              if (!options.refreshOnFailure) {
                return _this4.auth.clear().then(function () {
                  var error = new _errors.StitchError(json.error, json.error_code);
                  error.response = response;
                  error.json = json;
                  throw error;
                });
              }

              return _this4.auth.refreshToken().then(function () {
                options.refreshOnFailure = false;
                return _this4._do(resource, method, options);
              });
            }

            var error = new _errors.StitchError(json.error, json.error_code);
            error.response = response;
            error.json = json;
            return Promise.reject(error);
          });
        }

        var error = new Error(response.statusText);
        error.response = response;
        return Promise.reject(error);
      });
    }
  }, {
    key: '_fetchArgs',
    value: function _fetchArgs(resource, method, options) {
      var appURL = this.rootURLsByAPIVersion[options.apiVersion][options.apiType];
      var url = '' + appURL + resource;
      if (options.rootURL) {
        url = '' + options.rootURL + resource;
      }
      var fetchArgs = common.makeFetchArgs(method, options.body);

      if (!!options.headers) {
        Object.assign(fetchArgs.headers, options.headers);
      }

      if (options.queryParams) {
        url = url + '?' + _queryString2.default.stringify(options.queryParams);
      }

      return { url: url, fetchArgs: fetchArgs };
    }
  }, {
    key: '_do',
    value: function _do(resource, method, options) {
      options = Object.assign({}, {
        refreshOnFailure: true,
        useRefreshToken: false,
        apiVersion: v2,
        apiType: API_TYPE_APP,
        rootURL: undefined
      }, options);

      var _fetchArgs2 = this._fetchArgs(resource, method, options),
          url = _fetchArgs2.url,
          fetchArgs = _fetchArgs2.fetchArgs;

      if (options.noAuth) {
        return this._fetch(url, fetchArgs, resource, method, options);
      }

      if (!this.isAuthenticated()) {
        return Promise.reject(new _errors.StitchError('Must auth first', _errors.ErrUnauthorized));
      }
      var token = options.useRefreshToken ? this.auth.getRefreshToken() : this.auth.getAccessToken();

      fetchArgs.headers.Authorization = 'Bearer ' + token;
      return this._fetch(url, fetchArgs, resource, method, options);
    }
  }, {
    key: 'type',
    get: function get() {
      return common.APP_CLIENT_TYPE;
    }
  }]);

  return StitchClient;
}();