/**
 * @private
 * @module auth
 */
import * as common from '../common';
import * as authCommon from './common';
import { uriEncodeObject } from '../util';

export const PROVIDER_TYPE_ANON = 'anon';
export const PROVIDER_TYPE_CUSTOM = 'custom';
export const PROVIDER_TYPE_USERPASS = 'userpass';
export const PROVIDER_TYPE_APIKEY = 'apiKey';
export const PROVIDER_TYPE_GOOGLE = 'google';
export const PROVIDER_TYPE_FACEBOOK = 'facebook';
export const PROVIDER_TYPE_MONGODB_CLOUD = 'mongodbCloud';

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
    authenticate: (options, link) => {
      const deviceId = auth.getDeviceId();
      const device = auth.getDeviceInfo(deviceId, !!auth.client && auth.client.clientAppID);
      const fetchArgs = common.makeFetchArgs('GET');
      fetchArgs.cors = true;

      return fetch(
        urlWithLinkParam(`${auth.rootUrl}/providers/anon-user/login?device=${uriEncodeObject(device)}`, link),
        auth.fetchArgsWithLink(fetchArgs, link)
      ).then(common.checkStatus)
        .then(response => response.json())
        .then(json => auth.set(json, PROVIDER_TYPE_ANON));
    }
  };
}

/**
  * @private
  * @namespace
  */
function customProvider(auth) {
  const providerRoute = 'providers/custom-token';
  const loginRoute = `${providerRoute}/login`;

  return {
    /**
     * Login to a stitch application using custom authentication
     *
     * @memberof customProvider
     * @instance
     * @param {String} JWT token to use for authentication
     * @returns {Promise} a promise that resolves when authentication succeeds.
     */
    authenticate: (token, link) => {
      const deviceId = auth.getDeviceId();
      const device = auth.getDeviceInfo(deviceId, !!auth.client && auth.client.clientAppID);

      const fetchArgs = common.makeFetchArgs(
        'POST',
        JSON.stringify({ token, options: { device } })
      );
      fetchArgs.cors = true;

      return fetch(urlWithLinkParam(`${auth.rootUrl}/${loginRoute}`, link), auth.fetchArgsWithLink(fetchArgs, link))
        .then(common.checkStatus)
        .then(response => response.json())
        .then(json => auth.set(json, PROVIDER_TYPE_CUSTOM));
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
  const providerRoute = auth.isAppClient() ? 'providers/local-userpass' : 'providers/local-userpass';
  const loginRoute = auth.isAppClient() ? `${providerRoute}/login` : `${providerRoute}/login`;

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
    authenticate: ({ username, password }, link) => {
      const deviceId = auth.getDeviceId();
      const device = auth.getDeviceInfo(deviceId, !!auth.client && auth.client.clientAppID);

      const fetchArgs = common.makeFetchArgs(
        'POST',
        JSON.stringify({ username, password, options: { device } })
      );
      fetchArgs.cors = true;

      return fetch(urlWithLinkParam(`${auth.rootUrl}/${loginRoute}`, link), auth.fetchArgsWithLink(fetchArgs, link))
        .then(common.checkStatus)
        .then(response => response.json())
        .then(json => auth.set(json, PROVIDER_TYPE_USERPASS));
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
    emailConfirm: (tokenId, token) => {
      const fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ tokenId, token }));
      fetchArgs.cors = true;

      return fetch(`${auth.rootUrl}/${providerRoute}/confirm`, fetchArgs)
        .then(common.checkStatus)
        .then(response => response.json());
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
    sendEmailConfirm: (email) => {
      const fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ email }));
      fetchArgs.cors = true;

      return fetch(`${auth.rootUrl}/${providerRoute}/confirm/send`, fetchArgs)
        .then(common.checkStatus)
        .then(response => response.json());
    },

    /**
     * Sends a password reset request to the Stitch server
     *
     * @memberof userPassProvider
     * @instance
     * @param {String} email the email address of the account to reset the password for
     * @returns {Promise}
     */
    sendPasswordReset: (email) => {
      const fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ email }));
      fetchArgs.cors = true;

      return fetch(`${auth.rootUrl}/${providerRoute}/reset/send`, fetchArgs)
        .then(common.checkStatus)
        .then(response => response.json());
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
    passwordReset: (tokenId, token, password) => {
      const fetchArgs =
        common.makeFetchArgs('POST', JSON.stringify({ tokenId, token, password }));
      fetchArgs.cors = true;

      return fetch(`${auth.rootUrl}/${providerRoute}/reset`, fetchArgs)
        .then(common.checkStatus)
        .then(response => response.json());
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
    register: (email, password) => {
      const fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ email, password }));
      fetchArgs.cors = true;

      return fetch(`${auth.rootUrl}/${providerRoute}/register`, fetchArgs)
        .then(common.checkStatus)
        .then(response => response.json());
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
  const loginRoute = auth.isAppClient() ? 'providers/api-key/login' : 'providers/api-key/login';

  return {
    /**
     * Login to a stitch application using an api key
     *
     * @memberof apiKeyProvider
     * @instance
     * @param {String} key the key for authentication
     * @returns {Promise} a promise that resolves when authentication succeeds.
     */
    authenticate: (key, link) => {
      const deviceId = auth.getDeviceId();
      const device = auth.getDeviceInfo(deviceId, !!auth.client && auth.client.clientAppID);
      const fetchArgs = common.makeFetchArgs(
        'POST',
        JSON.stringify({ 'key': key, 'options': { device } })
      );
      fetchArgs.cors = true;

      return fetch(urlWithLinkParam(`${auth.rootUrl}/${loginRoute}`, link), auth.fetchArgsWithLink(fetchArgs, link))
        .then(common.checkStatus)
        .then(response => response.json())
        .then(json => auth.set(json, PROVIDER_TYPE_APIKEY));
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

  const state = generateState();
  return auth.storage.set(authCommon.STATE_KEY, state)
    .then(() => auth.getDeviceId())
    .then(deviceId => {
      const device = auth.getDeviceInfo(deviceId, !!auth.client && auth.client.clientAppID);

      const result = `${auth.rootUrl}/providers/oauth2-${providerName}/login?redirect=${encodeURI(redirectUrl)}&state=${state}&device=${uriEncodeObject(device)}`;
      return result;
    });
}

/**
 * @private
 * @namespace
 */
function googleProvider(auth) {
  const loginRoute = auth.isAppClient() ? 'providers/oauth2-google/login' : 'providers/oauth2-google/login';

  return {
    /**
     * Login to a stitch application using google authentication
     *
     * @memberof googleProvider
     * @instance
     * @param {Object} data the redirectUrl data to use for authentication
     * @returns {Promise} a promise that resolves when authentication succeeds.
     */
    authenticate: (data, link) => {
      let { authCode } = data;
      if (authCode) {
        const deviceId = auth.getDeviceId();
        const device = auth.getDeviceInfo(deviceId, !!auth.client && auth.client.clientAppID);

        const fetchArgs = common.makeFetchArgs(
          'POST',
          JSON.stringify({ authCode, options: { device } })
        );

        return fetch(urlWithLinkParam(`${auth.rootUrl}/${loginRoute}`, link), auth.fetchArgsWithLink(fetchArgs, link))
          .then(common.checkStatus)
          .then(response => response.json())
          .then(json => auth.set(json, PROVIDER_TYPE_GOOGLE));
      }

      const redirectUrl = (data && data.redirectUrl) ? data.redirectUrl : undefined;
      return auth.storage.set(authCommon.STITCH_REDIRECT_PROVIDER, PROVIDER_TYPE_GOOGLE)
        .then(() => getOAuthLoginURL(auth, PROVIDER_TYPE_GOOGLE, redirectUrl))
        .then((res) => window.location.replace(res));
    }
  };
}

/**
 * @private
 * @namespace
 */
function facebookProvider(auth) {
  const loginRoute = auth.isAppClient() ? 'providers/oauth2-facebook/login' : 'providers/oauth2-facebook/login';

  return {
    /**
     * Login to a stitch application using facebook authentication
     *
     * @memberof facebookProvider
     * @instance
     * @param {Object} data the redirectUrl data to use for authentication
     * @returns {Promise} a promise that resolves when authentication succeeds.
     */
    authenticate: (data, link) => {
      let { accessToken } = data;

      if (accessToken) {
        const deviceId = auth.getDeviceId();
        const device = auth.getDeviceInfo(deviceId, !!auth.client && auth.client.clientAppID);

        const fetchArgs = common.makeFetchArgs(
          'POST',
          JSON.stringify({ accessToken, options: { device } })
        );

        return fetch(urlWithLinkParam(`${auth.rootUrl}/${loginRoute}`, link), auth.fetchArgsWithLink(fetchArgs, link))
          .then(common.checkStatus)
          .then(response => response.json())
          .then(json => auth.set(json, PROVIDER_TYPE_FACEBOOK));
      }

      const redirectUrl = (data && data.redirectUrl) ? data.redirectUrl : undefined;
      return auth.storage.set(authCommon.STITCH_REDIRECT_PROVIDER, PROVIDER_TYPE_FACEBOOK)
        .then(() => getOAuthLoginURL(auth, PROVIDER_TYPE_FACEBOOK, redirectUrl))
        .then((res) => window.location.replace(res));
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
  const loginRoute = auth.isAppClient() ? 'providers/mongodb-cloud/login' : 'providers/mongodb-cloud/login';

  return {
    /**
     * Login to a stitch application using mongodb cloud authentication
     *
     * @memberof mongodbCloudProvider
     * @instance
     * @param {Object} data the username, apiKey, cors, and cookie data to use for authentication
     * @returns {Promise} a promise that resolves when authentication succeeds.
     */
    authenticate: (data, link) => {
      const { username, apiKey, cors, cookie } = data;
      const options = Object.assign({}, { cors: true, cookie: false }, { cors: cors, cookie: cookie });
      const deviceId = auth.getDeviceId();
      const device = auth.getDeviceInfo(deviceId, !!auth.client && auth.client.clientAppID);
      const fetchArgs = common.makeFetchArgs(
        'POST',
        JSON.stringify({ username, apiKey, options: { device } })
      );
      fetchArgs.cors = true;  // TODO: shouldn't this use the passed in `cors` value?
      fetchArgs.credentials = 'include';

      let url = urlWithLinkParam(`${auth.rootUrl}/${loginRoute}`, link);
      if (options.cookie) {
        return fetch(url + '?cookie=true', fetchArgs)
          .then(common.checkStatus);
      }

      return fetch(url, auth.fetchArgsWithLink(fetchArgs, link))
        .then(common.checkStatus)
        .then(response => response.json())
        .then(json => auth.set(json, PROVIDER_TYPE_MONGODB_CLOUD));
    }
  };
}

// TODO: support auth-specific options
function createProviders(auth, options = {}) {
  return {
    [PROVIDER_TYPE_ANON]: anonProvider(auth),
    [PROVIDER_TYPE_APIKEY]: apiKeyProvider(auth),
    [PROVIDER_TYPE_GOOGLE]: googleProvider(auth),
    [PROVIDER_TYPE_FACEBOOK]: facebookProvider(auth),
    [PROVIDER_TYPE_MONGODB_CLOUD]: mongodbCloudProvider(auth),
    [PROVIDER_TYPE_USERPASS]: userPassProvider(auth),
    [PROVIDER_TYPE_CUSTOM]: customProvider(auth)
  };
}

export { createProviders };
