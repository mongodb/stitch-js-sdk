import { AuthProviderType } from '../api/v3/AuthProviders';
import * as common from '../Common';

import Auth from './index';

/**
 * userPassProvider offers several methods for completing certain tasks necessary for email/password
 * authentication. userPassProvider cannot be instantiated directly. To instantiate,
 * use `.auth.providers('userpass')` on a {@link RealmAdminClient}.
 *
 * @namespace
 */
function userPassProvider(auth: Auth) {
  // The ternary expression here is redundant but is just preserving previous behavior based on whether or not
  // the client is for the admin or client API.
  const providerRoute = 'providers/local-userpass';
  const loginRoute = `${providerRoute}/login`;

  return {
    /**
     * Login to admin API using username and password authentication
     *
     * @private
     * @memberof userPassProvider
     * @instance
     * @param {String} username the username to use for authentication
     * @param {String} password the password to use for authentication
     * @returns {Promise} a promise that resolves when authentication succeeds.
     */
    authenticate: ({ username, password }: { username: string; password: string }) => {
      const fetchArgs = common.makeFetchArgs('POST', {
        body: JSON.stringify({ username, password }),
      });

      return fetch(`${auth.rootUrl}/${loginRoute}`, fetchArgs)
        .then(common.checkStatus)
        .then((response) => response.json())
        .then((json) => auth.set(json));
    },
  };
}

/**
 * @private
 * @namespace
 */
function apiKeyProvider(auth: Auth) {
  // The ternary expression here is redundant but is just preserving previous behavior based on whether or not
  // the client is for the admin or client API.
  const loginRoute = 'providers/api-key/login';

  return {
    /**
     * Login to admin API application using an api key
     *
     * @memberof apiKeyProvider
     * @instance
     * @param {String} key the key for authentication
     * @returns {Promise} a promise that resolves when authentication succeeds.
     */
    authenticate: (key: string) => {
      const fetchArgs = common.makeFetchArgs('POST', {
        body: JSON.stringify({ key }),
      });

      return fetch(`${auth.rootUrl}/${loginRoute}`, fetchArgs)
        .then(common.checkStatus)
        .then((response) => response.json())
        .then((json) => auth.set(json));
    },
  };
}

/**
 * @private
 * @namespace
 */
function mongodbCloudProvider(auth: Auth) {
  // The ternary expression here is redundant but is just preserving previous behavior based on whether or not
  // the client is for the admin or client API.
  const loginRoute = 'providers/mongodb-cloud/login';

  return {
    /**
     * Login to admin API using mongodb cloud authentication
     *
     * @memberof mongodbCloudProvider
     * @instance
     * @param {Object} data the username, apiKey, cors, and cookie data to use for authentication
     * @returns {Promise} a promise that resolves when authentication succeeds.
     */
    authenticate: (data: { username: string; apiKey: string; cors?: boolean; cookie?: boolean }) => {
      const { username, apiKey, cors, cookie } = data;
      const options = {
        cookie: cookie || false,
        cors: cors || true,
      };
      const fetchArgs = common.makeFetchArgs('POST', {
        body: JSON.stringify({ username, apiKey }),
      });
      fetchArgs.credentials = 'include';

      const url = `${auth.rootUrl}/${loginRoute}`;
      if (options.cookie) {
        return fetch(`${url}?cookie=true`, fetchArgs).then(common.checkStatus);
      }

      return fetch(url, fetchArgs)
        .then(common.checkStatus)
        .then((response) => response.json())
        .then((json) => auth.set(json));
    },
  };
}

function createProviders(auth: Auth) {
  return {
    [AuthProviderType.MongoDBCloud]: mongodbCloudProvider(auth),
    [AuthProviderType.APIKey]: apiKeyProvider(auth),
    [AuthProviderType.Userpass]: userPassProvider(auth),
  };
}

export default createProviders;
