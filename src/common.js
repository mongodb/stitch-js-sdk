import { StitchError } from './errors';

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

  if (response.headers.get('Content-Type') === JSONTYPE) {
    return response.json()
      .then(json => {
        const error = new StitchError(json.error, json.error_code);
        error.response = response;
        error.json = json;
        return Promise.reject(error);
      });
  }

  const error = new Error(response.statusText);
  error.response = response;
  return Promise.reject(error);
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
