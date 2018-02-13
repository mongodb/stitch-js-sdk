'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createProviders = exports.PROVIDER_TYPE_MONGODB_CLOUD = exports.PROVIDER_TYPE_FACEBOOK = exports.PROVIDER_TYPE_GOOGLE = exports.PROVIDER_TYPE_APIKEY = exports.PROVIDER_TYPE_USERPASS = exports.PROVIDER_TYPE_CUSTOM = exports.PROVIDER_TYPE_ANON = undefined;

var _common = require('../common');

var common = _interopRequireWildcard(_common);

var _common2 = require('./common');

var authCommon = _interopRequireWildcard(_common2);

var _util = require('../util');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; } /**
                                                                                                                                                                                                                   * @private
                                                                                                                                                                                                                   * @module auth
                                                                                                                                                                                                                   */


var PROVIDER_TYPE_ANON = exports.PROVIDER_TYPE_ANON = 'anon';
var PROVIDER_TYPE_CUSTOM = exports.PROVIDER_TYPE_CUSTOM = 'custom';
var PROVIDER_TYPE_USERPASS = exports.PROVIDER_TYPE_USERPASS = 'userpass';
var PROVIDER_TYPE_APIKEY = exports.PROVIDER_TYPE_APIKEY = 'apiKey';
var PROVIDER_TYPE_GOOGLE = exports.PROVIDER_TYPE_GOOGLE = 'google';
var PROVIDER_TYPE_FACEBOOK = exports.PROVIDER_TYPE_FACEBOOK = 'facebook';
var PROVIDER_TYPE_MONGODB_CLOUD = exports.PROVIDER_TYPE_MONGODB_CLOUD = 'mongodbCloud';

function urlWithLinkParam(url, link) {
  if (link) {
    return url + '?link=true';
  }

  return url;
}

/**
 * @private
 * @namespace
 */
function anonProvider(auth) {
  return {
    /**
     * Login to a stitch application using anonymous authentication
     *
     * @memberof anonProvider
     * @instance
     * @returns {Promise} a promise that resolves when authentication succeeds.
     */
    authenticate: function authenticate(options, link) {
      var deviceId = auth.getDeviceId();
      var device = auth.getDeviceInfo(deviceId, !!auth.client && auth.client.clientAppID);
      var fetchArgs = common.makeFetchArgs('GET');
      fetchArgs.cors = true;

      return fetch(urlWithLinkParam(auth.rootUrl + '/providers/anon-user/login?device=' + (0, _util.uriEncodeObject)(device), link), auth.fetchArgsWithLink(fetchArgs, link)).then(common.checkStatus).then(function (response) {
        return response.json();
      }).then(function (json) {
        return auth.set(json, PROVIDER_TYPE_ANON);
      });
    }
  };
}

/**
  * @private
  * @namespace
  */
function customProvider(auth) {
  var providerRoute = 'providers/custom-token';
  var loginRoute = providerRoute + '/login';

  return {
    /**
     * Login to a stitch application using custom authentication
     *
     * @memberof customProvider
     * @instance
     * @param {String} JWT token to use for authentication
     * @returns {Promise} a promise that resolves when authentication succeeds.
     */
    authenticate: function authenticate(token, link) {
      var deviceId = auth.getDeviceId();
      var device = auth.getDeviceInfo(deviceId, !!auth.client && auth.client.clientAppID);

      var fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ token: token, options: { device: device } }));
      fetchArgs.cors = true;

      return fetch(urlWithLinkParam(auth.rootUrl + '/' + loginRoute, link), auth.fetchArgsWithLink(fetchArgs, link)).then(common.checkStatus).then(function (response) {
        return response.json();
      }).then(function (json) {
        return auth.set(json, PROVIDER_TYPE_CUSTOM);
      });
    }
  };
}

/**
 * userPassProvider offers several methods for completing certain tasks necessary for email/password
 * authentication. userPassProvider cannot be instantiated directly. To instantiate,
 * use `.auth.providers('userpass')` on a {@link StitchClient}.
 *
 * @namespace
 */
function userPassProvider(auth) {
  // The ternary expression here is redundant but is just preserving previous behavior based on whether or not
  // the client is for the admin or client API.
  var providerRoute = auth.isAppClient() ? 'providers/local-userpass' : 'providers/local-userpass';
  var loginRoute = auth.isAppClient() ? providerRoute + '/login' : providerRoute + '/login';

  return {
    /**
     * Login to a stitch application using username and password authentication
     *
     * @private
     * @memberof userPassProvider
     * @instance
     * @param {String} username the username to use for authentication
     * @param {String} password the password to use for authentication
     * @returns {Promise} a promise that resolves when authentication succeeds.
     */
    authenticate: function authenticate(_ref, link) {
      var username = _ref.username,
          password = _ref.password;

      var deviceId = auth.getDeviceId();
      var device = auth.getDeviceInfo(deviceId, !!auth.client && auth.client.clientAppID);

      var fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ username: username, password: password, options: { device: device } }));
      fetchArgs.cors = true;

      return fetch(urlWithLinkParam(auth.rootUrl + '/' + loginRoute, link), auth.fetchArgsWithLink(fetchArgs, link)).then(common.checkStatus).then(function (response) {
        return response.json();
      }).then(function (json) {
        return auth.set(json, PROVIDER_TYPE_USERPASS);
      });
    },

    /**
     * Completes the email confirmation workflow from the Stitch server
     *
     * @memberof userPassProvider
     * @instance
     * @param {String} tokenId the tokenId provided by the Stitch server
     * @param {String} token the token provided by the Stitch server
     * @returns {Promise}
     */
    emailConfirm: function emailConfirm(tokenId, token) {
      var fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ tokenId: tokenId, token: token }));
      fetchArgs.cors = true;

      return fetch(auth.rootUrl + '/' + providerRoute + '/confirm', fetchArgs).then(common.checkStatus).then(function (response) {
        return response.json();
      });
    },

    /**
     * Request that the stitch server send another email confirmation
     * for account creation.
     *
     * @memberof userPassProvider
     * @instance
     * @param {String} email the email address to send a confirmation email for
     * @returns {Promise}
     */
    sendEmailConfirm: function sendEmailConfirm(email) {
      var fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ email: email }));
      fetchArgs.cors = true;

      return fetch(auth.rootUrl + '/' + providerRoute + '/confirm/send', fetchArgs).then(common.checkStatus).then(function (response) {
        return response.json();
      });
    },

    /**
     * Sends a password reset request to the Stitch server
     *
     * @memberof userPassProvider
     * @instance
     * @param {String} email the email address of the account to reset the password for
     * @returns {Promise}
     */
    sendPasswordReset: function sendPasswordReset(email) {
      var fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ email: email }));
      fetchArgs.cors = true;

      return fetch(auth.rootUrl + '/' + providerRoute + '/reset/send', fetchArgs).then(common.checkStatus).then(function (response) {
        return response.json();
      });
    },

    /**
     * Use information returned from the Stitch server to complete the password
     * reset flow for a given email account, providing a new password for the account.
     *
     * @memberof userPassProvider
     * @instance
     * @param {String} tokenId the tokenId provided by the Stitch server
     * @param {String} token the token provided by the Stitch server
     * @param {String} password the new password requested for this account
     * @returns {Promise}
     */
    passwordReset: function passwordReset(tokenId, token, password) {
      var fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ tokenId: tokenId, token: token, password: password }));
      fetchArgs.cors = true;

      return fetch(auth.rootUrl + '/' + providerRoute + '/reset', fetchArgs).then(common.checkStatus).then(function (response) {
        return response.json();
      });
    },

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
    register: function register(email, password) {
      var fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ email: email, password: password }));
      fetchArgs.cors = true;

      return fetch(auth.rootUrl + '/' + providerRoute + '/register', fetchArgs).then(common.checkStatus).then(function (response) {
        return response.json();
      });
    }
  };
}

/**
 * @private
 * @namespace
 */
function apiKeyProvider(auth) {
  // The ternary expression here is redundant but is just preserving previous behavior based on whether or not
  // the client is for the admin or client API.
  var loginRoute = auth.isAppClient() ? 'providers/api-key/login' : 'providers/api-key/login';

  return {
    /**
     * Login to a stitch application using an api key
     *
     * @memberof apiKeyProvider
     * @instance
     * @param {String} key the key for authentication
     * @returns {Promise} a promise that resolves when authentication succeeds.
     */
    authenticate: function authenticate(key, link) {
      var deviceId = auth.getDeviceId();
      var device = auth.getDeviceInfo(deviceId, !!auth.client && auth.client.clientAppID);
      var fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ 'key': key, 'options': { device: device } }));
      fetchArgs.cors = true;

      return fetch(urlWithLinkParam(auth.rootUrl + '/' + loginRoute, link), auth.fetchArgsWithLink(fetchArgs, link)).then(common.checkStatus).then(function (response) {
        return response.json();
      }).then(function (json) {
        return auth.set(json, PROVIDER_TYPE_APIKEY);
      });
    }
  };
}

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

function getOAuthLoginURL(auth, providerName, redirectUrl) {
  if (redirectUrl === undefined) {
    redirectUrl = auth.pageRootUrl();
  }

  var state = generateState();
  return auth.storage.set(authCommon.STATE_KEY, state).then(function () {
    return auth.getDeviceId();
  }).then(function (deviceId) {
    var device = auth.getDeviceInfo(deviceId, !!auth.client && auth.client.clientAppID);

    var result = auth.rootUrl + '/providers/oauth2-' + providerName + '/login?redirect=' + encodeURI(redirectUrl) + '&state=' + state + '&device=' + (0, _util.uriEncodeObject)(device);
    return result;
  });
}

/**
 * @private
 * @namespace
 */
function googleProvider(auth) {
  var loginRoute = auth.isAppClient() ? 'providers/oauth2-google/login' : 'providers/oauth2-google/login';

  return {
    /**
     * Login to a stitch application using google authentication
     *
     * @memberof googleProvider
     * @instance
     * @param {Object} data the redirectUrl data to use for authentication
     * @returns {Promise} a promise that resolves when authentication succeeds.
     */
    authenticate: function authenticate(data, link) {
      var authCode = data.authCode;

      if (authCode) {
        var deviceId = auth.getDeviceId();
        var device = auth.getDeviceInfo(deviceId, !!auth.client && auth.client.clientAppID);

        var fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ authCode: authCode, options: { device: device } }));

        return fetch(urlWithLinkParam(auth.rootUrl + '/' + loginRoute, link), auth.fetchArgsWithLink(fetchArgs, link)).then(common.checkStatus).then(function (response) {
          return response.json();
        }).then(function (json) {
          return auth.set(json, PROVIDER_TYPE_GOOGLE);
        });
      }

      var redirectUrl = data && data.redirectUrl ? data.redirectUrl : undefined;
      return auth.storage.set(authCommon.STITCH_REDIRECT_PROVIDER, PROVIDER_TYPE_GOOGLE).then(function () {
        return getOAuthLoginURL(auth, PROVIDER_TYPE_GOOGLE, redirectUrl);
      }).then(function (res) {
        return window.location.replace(res);
      });
    }
  };
}

/**
 * @private
 * @namespace
 */
function facebookProvider(auth) {
  var loginRoute = auth.isAppClient() ? 'providers/oauth2-facebook/login' : 'providers/oauth2-facebook/login';

  return {
    /**
     * Login to a stitch application using facebook authentication
     *
     * @memberof facebookProvider
     * @instance
     * @param {Object} data the redirectUrl data to use for authentication
     * @returns {Promise} a promise that resolves when authentication succeeds.
     */
    authenticate: function authenticate(data, link) {
      var accessToken = data.accessToken;


      if (accessToken) {
        var deviceId = auth.getDeviceId();
        var device = auth.getDeviceInfo(deviceId, !!auth.client && auth.client.clientAppID);

        var fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ accessToken: accessToken, options: { device: device } }));

        return fetch(urlWithLinkParam(auth.rootUrl + '/' + loginRoute, link), auth.fetchArgsWithLink(fetchArgs, link)).then(common.checkStatus).then(function (response) {
          return response.json();
        }).then(function (json) {
          return auth.set(json, PROVIDER_TYPE_FACEBOOK);
        });
      }

      var redirectUrl = data && data.redirectUrl ? data.redirectUrl : undefined;
      return auth.storage.set(authCommon.STITCH_REDIRECT_PROVIDER, PROVIDER_TYPE_FACEBOOK).then(function () {
        return getOAuthLoginURL(auth, PROVIDER_TYPE_FACEBOOK, redirectUrl);
      }).then(function (res) {
        return window.location.replace(res);
      });
    }
  };
}

/**
 * @private
 * @namespace
 */
function mongodbCloudProvider(auth) {
  // The ternary expression here is redundant but is just preserving previous behavior based on whether or not
  // the client is for the admin or client API.
  var loginRoute = auth.isAppClient() ? 'providers/mongodb-cloud/login' : 'providers/mongodb-cloud/login';

  return {
    /**
     * Login to a stitch application using mongodb cloud authentication
     *
     * @memberof mongodbCloudProvider
     * @instance
     * @param {Object} data the username, apiKey, cors, and cookie data to use for authentication
     * @returns {Promise} a promise that resolves when authentication succeeds.
     */
    authenticate: function authenticate(data, link) {
      var username = data.username,
          apiKey = data.apiKey,
          cors = data.cors,
          cookie = data.cookie;

      var options = Object.assign({}, { cors: true, cookie: false }, { cors: cors, cookie: cookie });
      var deviceId = auth.getDeviceId();
      var device = auth.getDeviceInfo(deviceId, !!auth.client && auth.client.clientAppID);
      var fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ username: username, apiKey: apiKey, options: { device: device } }));
      fetchArgs.cors = true; // TODO: shouldn't this use the passed in `cors` value?
      fetchArgs.credentials = 'include';

      var url = urlWithLinkParam(auth.rootUrl + '/' + loginRoute, link);
      if (options.cookie) {
        return fetch(url + '?cookie=true', fetchArgs).then(common.checkStatus);
      }

      return fetch(url, auth.fetchArgsWithLink(fetchArgs, link)).then(common.checkStatus).then(function (response) {
        return response.json();
      }).then(function (json) {
        return auth.set(json, PROVIDER_TYPE_MONGODB_CLOUD);
      });
    }
  };
}

// TODO: support auth-specific options
function createProviders(auth) {
  var _ref2;

  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return _ref2 = {}, _defineProperty(_ref2, PROVIDER_TYPE_ANON, anonProvider(auth)), _defineProperty(_ref2, PROVIDER_TYPE_APIKEY, apiKeyProvider(auth)), _defineProperty(_ref2, PROVIDER_TYPE_GOOGLE, googleProvider(auth)), _defineProperty(_ref2, PROVIDER_TYPE_FACEBOOK, facebookProvider(auth)), _defineProperty(_ref2, PROVIDER_TYPE_MONGODB_CLOUD, mongodbCloudProvider(auth)), _defineProperty(_ref2, PROVIDER_TYPE_USERPASS, userPassProvider(auth)), _defineProperty(_ref2, PROVIDER_TYPE_CUSTOM, customProvider(auth)), _ref2;
}

exports.createProviders = createProviders;