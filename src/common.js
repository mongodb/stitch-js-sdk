export const JSONTYPE = 'application/json';
export const APP_CLIENT_TYPE = 'app';
export const ADMIN_CLIENT_TYPE = 'admin';
export const DEFAULT_STITCH_SERVER_URL = 'https://stitch.mongodb.com';

// VERSION is substituted with the package.json version number at build time
let version = 'unknown';
if (typeof VERSION !== 'undefined') {
  version = VERSION;
}
export const SDK_VERSION = version;

export const checkStatus = (response) => {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  let error = new Error(response.statusText);
  error.response = response;

  // set error to statusText by default; this will be overwritten when (and if)
  // the response is successfully parsed into json below
  error.error = response.statusText;

  return response.json()
    .catch(() => Promise.reject(error))
    .then(json => Promise.reject(Object.assign(error, json)));
};

export const makeFetchArgs = (method, body) => {
  const init = {
    method: method,
    headers: { 'Accept': JSONTYPE, 'Content-Type': JSONTYPE }
  };

  if (body) {
    init.body = body;
  }

  init.cors = true;
  return init;
};
