'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* global window, fetch */
/* eslint no-labels: ['error', { 'allowLoop': true }] */


require('fetch-everywhere');

var _auth = require('./auth');

var _auth2 = _interopRequireDefault(_auth);

var _common = require('./auth/common');

var _services = require('./services');

var _services2 = _interopRequireDefault(_services);

var _common2 = require('./common');

var common = _interopRequireWildcard(_common2);

var _mongodbExtjson = require('mongodb-extjson');

var _mongodbExtjson2 = _interopRequireDefault(_mongodbExtjson);

var _queryString = require('query-string');

var _queryString2 = _interopRequireDefault(_queryString);

var _util = require('./util');

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
 * Create a new StitchClient instance.
 *
 * @class
 * @return {StitchClient} a StitchClient instance.
 */

var StitchClient = function () {
  function StitchClient(clientAppID, options) {
    var _v,
        _v2,
        _v3,
        _rootURLsByAPIVersion,
        _this = this;

    _classCallCheck(this, StitchClient);

    var baseUrl = common.DEFAULT_STITCH_SERVER_URL;
    if (options && options.baseUrl) {
      baseUrl = options.baseUrl;
    }

    this.clientAppID = clientAppID;

    this.authUrl = clientAppID ? baseUrl + '/api/client/v2.0/app/' + clientAppID + '/auth' : baseUrl + '/api/admin/v3.0/auth';

    this.rootURLsByAPIVersion = (_rootURLsByAPIVersion = {}, _defineProperty(_rootURLsByAPIVersion, v1, (_v = {}, _defineProperty(_v, API_TYPE_PUBLIC, baseUrl + '/api/public/v1.0'), _defineProperty(_v, API_TYPE_CLIENT, baseUrl + '/api/client/v1.0'), _defineProperty(_v, API_TYPE_PRIVATE, baseUrl + '/api/private/v1.0'), _defineProperty(_v, API_TYPE_APP, clientAppID ? baseUrl + '/api/client/v1.0/app/' + clientAppID : baseUrl + '/api/public/v1.0'), _v)), _defineProperty(_rootURLsByAPIVersion, v2, (_v2 = {}, _defineProperty(_v2, API_TYPE_PUBLIC, baseUrl + '/api/public/v2.0'), _defineProperty(_v2, API_TYPE_CLIENT, baseUrl + '/api/client/v2.0'), _defineProperty(_v2, API_TYPE_PRIVATE, baseUrl + '/api/private/v2.0'), _defineProperty(_v2, API_TYPE_APP, clientAppID ? baseUrl + '/api/client/v2.0/app/' + clientAppID : baseUrl + '/api/public/v2.0'), _v2)), _defineProperty(_rootURLsByAPIVersion, v3, (_v3 = {}, _defineProperty(_v3, API_TYPE_PUBLIC, baseUrl + '/api/public/v3.0'), _defineProperty(_v3, API_TYPE_CLIENT, baseUrl + '/api/client/v3.0'), _defineProperty(_v3, API_TYPE_APP, clientAppID ? baseUrl + '/api/client/v3.0/app/' + clientAppID : baseUrl + '/api/admin/v3.0'), _v3)), _rootURLsByAPIVersion);

    var authOptions = { codec: _common.APP_CLIENT_CODEC };
    if (options && options.authCodec) {
      authOptions.codec = options.authCodec;
    }
    this.auth = new _auth2.default(this, this.authUrl, authOptions);
    this.auth.handleRedirect();
    this.auth.handleCookie();

    // deprecated API
    this.authManager = {
      apiKeyAuth: function apiKeyAuth(key) {
        return _this.authenticate('apiKey', key);
      },
      localAuth: function localAuth(email, password) {
        return _this.login(email, password);
      },
      mongodbCloudAuth: function mongodbCloudAuth(username, apiKey, opts) {
        return _this.authenticate('mongodbCloud', Object.assign({ username: username, apiKey: apiKey }, opts));
      }
    };

    this.authManager.apiKeyAuth = (0, _util.deprecate)(this.authManager.apiKeyAuth, 'use `client.authenticate("apiKey", "key")` instead of `client.authManager.apiKey`');
    this.authManager.localAuth = (0, _util.deprecate)(this.authManager.localAuth, 'use `client.login` instead of `client.authManager.localAuth`');
    this.authManager.mongodbCloudAuth = (0, _util.deprecate)(this.authManager.mongodbCloudAuth, 'use `client.authenticate("mongodbCloud", opts)` instead of `client.authManager.mongodbCloudAuth`');
  }

  _createClass(StitchClient, [{
    key: 'login',


    /**
     * Login to stitch instance, optionally providing a username and password. In
     * the event that these are omitted, anonymous authentication is used.
     *
     * @param {String} [email] the email address used for login
     * @param {String} [password] the password for the provided email address
     * @param {Object} [options] additional authentication options
     * @returns {Promise}
     */
    value: function login(email, password) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      if (email === undefined || password === undefined) {
        return this.authenticate('anon', options);
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
     * @param {Object} [options] additional authentication options
     * @returns {Promise}
     */

  }, {
    key: 'register',
    value: function register(email, password) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      return this.auth.provider('userpass').register(email, password, options);
    }

    /**
     * Submits an authentication request to the specified provider providing any
     * included options (read: user data).  If auth data already exists and the
     * existing auth data has an access token, then these credentials are returned.
     *
     * @param {String} providerType the provider used for authentication (e.g. 'userpass', 'facebook', 'google')
     * @param {Object} [options] additional authentication options
     * @returns {Promise} which resolves to a String value: the authed userId
     */

  }, {
    key: 'authenticate',
    value: function authenticate(providerType) {
      var _this2 = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      // reuse existing auth if present
      if (this.auth.getAccessToken()) {
        return Promise.resolve(this.auth.authedId());
      }

      return this.auth.provider(providerType).authenticate(options).then(function () {
        return _this2.auth.authedId();
      });
    }

    /**
     * Ends the session for the current user.
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
      });
    }

    /**
     * @return {*} Returns any error from the Stitch authentication system.
     */

  }, {
    key: 'authError',
    value: function authError() {
      return this.auth.error();
    }

    /**
     * Returns profile information for the currently logged in user
     *
     * @returns {Promise}
     */

  }, {
    key: 'userProfile',
    value: function userProfile() {
      return this._do('/auth/profile', 'GET', { rootURL: this.rootURLsByAPIVersion[v2][API_TYPE_CLIENT] }).then(function (response) {
        return response.json();
      });
    }
    /**
     *  @return {String} Returns the currently authed user's ID.
     */

  }, {
    key: 'authedId',
    value: function authedId() {
      return this.auth.authedId();
    }

    /**
     * Factory method for accessing Stitch services.
     *
     * @method
     * @param {String} type The service type [mongodb, {String}]
     * @param {String} name The service name.
     * @return {Object} returns a named service.
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
  }, {
    key: '_do',
    value: function _do(resource, method, options) {
      var _this4 = this;

      options = Object.assign({}, {
        refreshOnFailure: true,
        useRefreshToken: false,
        apiVersion: v2,
        apiType: API_TYPE_APP,
        rootURL: undefined
      }, options);

      if (!options.noAuth) {
        if (!this.authedId()) {
          return Promise.reject(new _errors.StitchError('Must auth first', _errors.ErrUnauthorized));
        }

        // If access token is expired, proactively get a new one
        if (!options.useRefreshToken && this.auth.isAccessTokenExpired()) {
          return this.auth.refreshToken().then(function () {
            options.refreshOnFailure = false;
            return _this4._do(resource, method, options);
          });
        }
      }

      var appURL = this.rootURLsByAPIVersion[options.apiVersion][options.apiType];
      var url = '' + appURL + resource;
      if (options.rootURL) {
        url = '' + options.rootURL + resource;
      }
      var fetchArgs = common.makeFetchArgs(method, options.body);

      if (!!options.headers) {
        Object.assign(fetchArgs.headers, options.headers);
      }

      if (!options.noAuth) {
        var token = options.useRefreshToken ? this.auth.getRefreshToken() : this.auth.getAccessToken();
        fetchArgs.headers.Authorization = 'Bearer ' + token;
      }

      if (options.queryParams) {
        url = url + '?' + _queryString2.default.stringify(options.queryParams);
      }

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
                _this4.auth.clear();
                var _error = new _errors.StitchError(json.error, json.error_code);
                _error.response = response;
                _error.json = json;
                throw _error;
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

    // Deprecated API

  }, {
    key: 'authWithOAuth',
    value: function authWithOAuth(providerType, redirectUrl) {
      return this.auth.provider(providerType).authenticate({ redirectUrl: redirectUrl });
    }
  }, {
    key: 'anonymousAuth',
    value: function anonymousAuth() {
      return this.authenticate('anon');
    }
  }, {
    key: 'type',
    get: function get() {
      return common.APP_CLIENT_TYPE;
    }
  }]);

  return StitchClient;
}();

exports.default = StitchClient;


StitchClient.prototype.authWithOAuth = (0, _util.deprecate)(StitchClient.prototype.authWithOAuth, 'use `authenticate` instead of `authWithOAuth`');
StitchClient.prototype.anonymousAuth = (0, _util.deprecate)(StitchClient.prototype.anonymousAuth, 'use `login()` instead of `anonymousAuth`');
module.exports = exports['default'];