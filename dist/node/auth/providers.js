'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createProviders = undefined;

var _common = require('../common');

var common = _interopRequireWildcard(_common);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function anonProvider(auth) {
  return {
    login: function login(opts) {
      // reuse existing auth if present
      var authData = auth.get();
      if (authData.hasOwnProperty('accessToken')) {
        return Promise.resolve(authData);
      }

      var fetchArgs = common.makeFetchArgs('GET');
      fetchArgs.cors = true;

      return fetch(auth.rootUrl + '/anon/user', fetchArgs).then(common.checkStatus).then(function (response) {
        return response.json();
      }).then(function (json) {
        return auth.set(json);
      });
    }
  };
}

function userPassProvider(auth) {
  return {
    /**
     * Login to a stitch application using username and password authentication
     *
     * @param {String} username the username to use for authentication
     * @param {String} password the password to use for authentication
     * @returns {Promise}
     */
    login: function login(username, password, opts) {
      var fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ username: username, password: password }));
      fetchArgs.cors = true;

      return fetch(auth.rootUrl + '/local/userpass', fetchArgs).then(common.checkStatus).then(function (response) {
        return response.json();
      }).then(function (json) {
        return auth.set(json);
      });
    },

    /**
     * Completes the confirmation workflow from the stitch server
     *
     * @param {String} tokenId the tokenId provided by the stitch server
     * @param {String} token the token provided by the stitch server
     * @returns {Promise}
     */
    emailConfirm: function emailConfirm(tokenId, token) {
      var fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ tokenId: tokenId, token: token }));
      fetchArgs.cors = true;

      return fetch(auth.rootUrl + '/local/userpass/confirm', fetchArgs).then(common.checkStatus).then(function (response) {
        return response.json();
      });
    },

    /**
     * Request that the stitch server send another email confirmation
     * for account creation.
     *
     * @param {String} email the email to send a confirmation email for
     * @returns {Promise}
     */
    sendEmailConfirm: function sendEmailConfirm(email) {
      var fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ email: email }));
      fetchArgs.cors = true;

      return fetch(auth.rootUrl + '/local/userpass/confirm/send', fetchArgs).then(common.checkStatus).then(function (response) {
        return response.json();
      });
    },

    /**
     * Sends a password reset request to the stitch server
     *
     * @param {String} email the email of the account to reset the password for
     * @returns {Promise}
     */
    sendPasswordReset: function sendPasswordReset(email) {
      var fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ email: email }));
      fetchArgs.cors = true;

      return fetch(auth.rootUrl + '/local/userpass/reset/send', fetchArgs).then(common.checkStatus).then(function (response) {
        return response.json();
      });
    },

    /**
     * Use information returned from the stitch server to complete the password
     * reset flow for a given email account, providing a new password for the account.
     *
     * @param {String} tokenId the tokenId provided by the stitch server
     * @param {String} token the token provided by the stitch server
     * @param {String} password the new password requested for this account
     * @returns {Promise}
     */
    passwordReset: function passwordReset(tokenId, token, password) {
      var fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ tokenId: tokenId, token: token, password: password }));
      fetchArgs.cors = true;

      return fetch(auth.rootUrl + '/local/userpass/reset', fetchArgs).then(common.checkStatus).then(function (response) {
        return response.json();
      });
    },

    /**
     * Will trigger an email to the requested account containing a link with the
     * token and tokenId that must be returned to the server using emailConfirm()
     * to activate the account.
     *
     * @param {String} email the requested email for the account
     * @param {String} password the requested password for the account
     * @returns {Promise}
     */
    register: function register(email, password) {
      var fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ email: email, password: password }));
      fetchArgs.cors = true;

      return fetch(auth.rootUrl + '/local/userpass/register', fetchArgs).then(common.checkStatus).then(function (response) {
        return response.json();
      });
    }
  };
}

function apiKeyProvider(auth) {
  return {
    authenticate: function authenticate(key) {
      var fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ 'key': key }));
      fetchArgs.cors = true;

      return fetch(auth.rootUrl + '/api/key', fetchArgs).then(common.checkStatus).then(function (response) {
        return response.json();
      }).then(function (json) {
        return auth.set(json);
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
  auth.storage.set(common.STATE_KEY, state);
  var result = auth.rootUrl + '/oauth2/' + providerName + '?redirect=' + encodeURI(redirectUrl) + '&state=' + state;
  return result;
}

function googleProvider(auth) {
  return {
    authenticate: function authenticate(data) {
      var redirectUrl = data && data.redirectUrl ? data.redirectUrl : undefined;
      window.location.replace(getOAuthLoginURL(auth, 'google', redirectUrl));
      return Promise.resolve();
    }
  };
}

function facebookProvider(auth) {
  return {
    authenticate: function authenticate(data) {
      var redirectUrl = data && data.redirectUrl ? data.redirectUrl : undefined;
      window.location.replace(getOAuthLoginURL(auth, 'facebook', redirectUrl));
      return Promise.resolve();
    }
  };
}

function mongodbCloudProvider(auth) {
  return {
    authenticate: function authenticate(data) {
      var username = data.username,
          apiKey = data.apiKey,
          cors = data.cors,
          cookie = data.cookie;

      var options = Object.assign({}, { cors: true, cookie: false }, { cors: cors, cookie: cookie });
      var fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ username: username, apiKey: apiKey }));
      fetchArgs.cors = true; // TODO: shouldn't this use the passed in `cors` value?
      fetchArgs.credentials = 'include';

      var url = auth.rootUrl + '/mongodb/cloud';
      if (options.cookie) {
        return fetch(url + '?cookie=true', fetchArgs).then(common.checkStatus);
      }

      return fetch(url, fetchArgs).then(common.checkStatus).then(function (response) {
        return response.json();
      }).then(function (json) {
        return auth.set(json);
      });
    }
  };
}

// TODO: support auth-specific options
function createProviders(auth) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return {
    anon: anonProvider(auth),
    apiKey: apiKeyProvider(auth),
    google: googleProvider(auth),
    facebook: facebookProvider(auth),
    mongodbCloud: mongodbCloudProvider(auth),
    userpass: userPassProvider(auth)
  };
}

exports.createProviders = createProviders;