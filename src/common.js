// @flow
export const JSONTYPE: string = 'application/json';
export const APP_CLIENT_TYPE: string = 'app';
export const ADMIN_CLIENT_TYPE: string = 'admin';
export const DEFAULT_STITCH_SERVER_URL: string = 'https://stitch.mongodb.com';

// VERSION is substituted with the package.json version number at build time
let version: string = 'unknown';
if (typeof VERSION !== 'undefined') {
  version = VERSION;
}

export const SDK_VERSION: string = version;

export async function checkStatus(response: Response): Promise<Object> {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  let error: any = new Error(response.statusText);
  error.response = response;

  // set error to statusText by default; this will be overwritten when (and if)
  // the response is successfully parsed into json below
  error.error = response.statusText;

  return response.json()
    .catch(() => Promise.reject(error))
    .then(json => Promise.reject(Object.assign(error, json)));
};

export function makeFetchArgs(method: string, body: any): Object {
  const init: Object = {
    method: method,
    headers: { 'Accept': JSONTYPE, 'Content-Type': JSONTYPE }
  };

  if (body) {
    init.body = body;
  }

  init.cors = true;
  return init;
};
