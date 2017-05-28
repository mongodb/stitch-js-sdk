import * as common from '../common';

function localProvider(auth) {
  return {
    login: (email, password, opts) => {
      if (email === undefined || password === undefined) {
        let fetchArgs = common.makeFetchArgs('GET');
        fetchArgs.cors = true;

        return fetch(`${auth.rootUrl}/anon/user`, fetchArgs)
          .then(common.checkStatus)
          .then(response => response.json())
          .then(json => auth.set(json));
      }

      const fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ email, password }));
      fetchArgs.cors = true;

      return fetch(`${auth.rootUrl}/local/userpass`, fetchArgs)
        .then(common.checkStatus)
        .then(response => response.json())
        .then(json => auth.set(json));
    },

    signup: (email) => {
      throw new Error('not implemented!');
    },

    emailConfirm: (tokenId, token) => {
      const fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ tokenId, token }));
      fetchArgs.cors = true;

      return fetch(`${auth.rootUrl}/local/userpass/confirm`, fetchArgs)
        .then(common.checkStatus)
        .then(response => response.json())
        .then(json => {
          auth.set(json);
          return json;
        });
    },

    sendEmailConfirm: (email) => {
      const fetchArgs = common.makeFetchArgs('POST', JSON.stringify({email}));
      fetchArgs.cors = true;

      return fetch(`${auth.rootUrl}/local/userpass/confirm/send`, fetchArgs)
        .then(common.checkStatus)
        .then(response => response.json())
        .then(json => {
          auth.set(json);
          return json;
        });
    },

    sendPasswordReset: (email) => {
      const fetchArgs = common.makeFetchArgs('POST', JSON.stringify({email}));
      fetchArgs.cors = true;

      return fetch(`${auth.rootUrl}/local/userpass/reset/send`, fetchArgs)
        .then(common.checkStatus)
        .then(response => response.json())
        .then(json => {
          auth.set(json);
          return json;
        });
    },

    passwordReset: (tokenId, token) => {
      const fetchArgs = common.makeFetchArgs('POST', JSON.stringify({tokenId, token}));
      fetchArgs.cors = true;

      return fetch(`${auth.rootUrl}/local/userpass/reset`, fetchArgs)
        .then(common.checkStatus)
        .then(response => response.json())
        .then(json => {
          auth.set(json);
          return json;
        });
    },

    register: (email, password) => {
      const fetchArgs = common.makeFetchArgs('POST', JSON.stringify({email, password}));
      fetchArgs.cors = true;

      return fetch(`${auth.rootUrl}/local/userpass/register`, fetchArgs)
        .then(common.checkStatus)
        .then(response => response.json())
        .then(json => {
          auth.set(json);
          return json;
        });
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
function generateState() {
  let alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let state = '';
  const stateLength = 64;
  for (let i = 0; i < stateLength; i++) {
    let pos = Math.floor(Math.random() * alpha.length);
    state += alpha.substring(pos, pos + 1);
  }

  return state;
}

function getOAuthLoginURL(auth, providerName, redirectUrl) {
  if (redirectUrl === undefined) {
    redirectUrl = auth.pageRootUrl();
  }

  let state = generateState();
  this.storage.set(common.STATE_KEY, state);
  let result = `${this.rootUrl}/oauth2/${providerName}?redirect=${encodeURI(redirectUrl)}&state=${state}`;
  return result;
}

function googleProvider(auth) {
  return {
    authenticate: data => {
      const { redirectUrl } = data;
      window.location.replace(getOAuthLoginURL(auth, 'google', redirectUrl));
    }
  };
}

function facebookProvider(auth) {
  return {
    authenticate: data => {
      const { redirectUrl } = data;
      window.location.replace(getOAuthLoginURL(auth, 'facebook', redirectUrl));
    }
  };
}

function mongodbCloudProvider(auth) {
  return {
    authenticate: data => {
      const { username, apiKey, cors, cookie } = data;
      options = Object.assign({}, { cors: true, cookie: false }, { cors: cors, cookie: cookie });
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

function createProviders(auth) {
  let providers = new Map();
  providers.set('local', localProvider(auth));
  providers.set('apiKey', apiKeyProvider(auth));
  providers.set('google', googleProvider(auth));
  providers.set('facebook', facebookProvider(auth));
  providers.set('mongodbCloud', mongodbCloudProvider(auth));
  return providers;
}

export { createProviders };
