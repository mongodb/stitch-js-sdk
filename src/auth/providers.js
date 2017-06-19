import * as common from '../common';

function anonProvider(auth) {
  return {
    login: (opts) => {
      // reuse existing auth if present
      const authData = auth.get();
      if (authData.hasOwnProperty('accessToken')) {
        return Promise.resolve(authData);
      }

      let fetchArgs = common.makeFetchArgs('GET');
      fetchArgs.cors = true;

      return fetch(`${auth.rootUrl}/anon/user`, fetchArgs)
        .then(common.checkStatus)
        .then(response => response.json())
        .then(json => auth.set(json));
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
    login: (username, password, opts) => {
      const fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ username, password }));
      fetchArgs.cors = true;

      return fetch(`${auth.rootUrl}/local/userpass`, fetchArgs)
        .then(common.checkStatus)
        .then(response => response.json())
        .then(json => auth.set(json));
    },

    /**
     * Completes the confirmation workflow from the stitch server
     *
     * @param {String} tokenId the tokenId provided by the stitch server
     * @param {String} token the token provided by the stitch server
     * @returns {Promise}
     */
    emailConfirm: (tokenId, token) => {
      const fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ tokenId, token }));
      fetchArgs.cors = true;

      return fetch(`${auth.rootUrl}/local/userpass/confirm`, fetchArgs)
        .then(common.checkStatus)
        .then(response => response.json());
    },

    /**
     * Request that the stitch server send another email confirmation
     * for account creation.
     *
     * @param {String} email the email to send a confirmation email for
     * @returns {Promise}
     */
    sendEmailConfirm: (email) => {
      const fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ email }));
      fetchArgs.cors = true;

      return fetch(`${auth.rootUrl}/local/userpass/confirm/send`, fetchArgs)
        .then(common.checkStatus)
        .then(response => response.json());
    },

    /**
     * Sends a password reset request to the stitch server
     *
     * @param {String} email the email of the account to reset the password for
     * @returns {Promise}
     */
    sendPasswordReset: (email) => {
      const fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ email }));
      fetchArgs.cors = true;

      return fetch(`${auth.rootUrl}/local/userpass/reset/send`, fetchArgs)
        .then(common.checkStatus)
        .then(response => response.json());
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
    passwordReset: (tokenId, token, password) => {
      const fetchArgs =
        common.makeFetchArgs('POST', JSON.stringify({ tokenId, token, password }));
      fetchArgs.cors = true;

      return fetch(`${auth.rootUrl}/local/userpass/reset`, fetchArgs)
        .then(common.checkStatus)
        .then(response => response.json());
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
    register: (email, password) => {
      const fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ email, password }));
      fetchArgs.cors = true;

      return fetch(`${auth.rootUrl}/local/userpass/register`, fetchArgs)
        .then(common.checkStatus)
        .then(response => response.json());
    }
  };
}

function apiKeyProvider(auth) {
  return {
    authenticate: key => {
      const fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ 'key': key }));
      fetchArgs.cors = true;

      return fetch(`${auth.rootUrl}/api/key`, fetchArgs)
        .then(common.checkStatus)
        .then(response => response.json())
        .then(json => auth.set(json));
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
const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
function generateState() {
  let state = '';
  for (let i = 0; i < 64; ++i) {
    state += alpha.charAt(Math.floor(Math.random() * alpha.length));
  }

  return state;
}

function getOAuthLoginURL(auth, providerName, redirectUrl) {
  if (redirectUrl === undefined) {
    redirectUrl = auth.pageRootUrl();
  }

  let state = generateState();
  auth.storage.set(common.STATE_KEY, state);
  let result = `${auth.rootUrl}/oauth2/${providerName}?redirect=${encodeURI(redirectUrl)}&state=${state}`;
  return result;
}

function googleProvider(auth) {
  return {
    authenticate: data => {
      const redirectUrl = (data && data.redirectUrl) ? data.redirectUrl : undefined;
      window.location.replace(getOAuthLoginURL(auth, 'google', redirectUrl));
      return Promise.resolve();
    }
  };
}

function facebookProvider(auth) {
  return {
    authenticate: data => {
      const redirectUrl = (data && data.redirectUrl) ? data.redirectUrl : undefined;
      window.location.replace(getOAuthLoginURL(auth, 'facebook', redirectUrl));
      return Promise.resolve();
    }
  };
}

function mongodbCloudProvider(auth) {
  return {
    authenticate: data => {
      const { username, apiKey, cors, cookie } = data;
      const options = Object.assign({}, { cors: true, cookie: false }, { cors: cors, cookie: cookie });
      const fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ username, apiKey }));
      fetchArgs.cors = true;  // TODO: shouldn't this use the passed in `cors` value?
      fetchArgs.credentials = 'include';

      let url = `${auth.rootUrl}/mongodb/cloud`;
      if (options.cookie) {
        return fetch(url + '?cookie=true', fetchArgs)
          .then(common.checkStatus);
      }

      return fetch(url, fetchArgs)
        .then(common.checkStatus)
        .then(response => response.json())
        .then(json => auth.set(json));
    }
  };
}

// TODO: support auth-specific options
function createProviders(auth, options = {}) {
  return {
    anon: anonProvider(auth),
    apiKey: apiKeyProvider(auth),
    google: googleProvider(auth),
    facebook: facebookProvider(auth),
    mongodbCloud: mongodbCloudProvider(auth),
    userpass: userPassProvider(auth)
  };
}

export { createProviders };
