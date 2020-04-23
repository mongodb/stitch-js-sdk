import { RealmError, ResponseError } from './Errors';

export const JSONTYPE = 'application/json';
export const DEFAULT_REALM_SERVER_URL = 'https://realm.mongodb.com';

declare global {
  const VERSION: string;
}

// VERSION is substituted with the package.json version number at build time
let version = 'unknown';
if (typeof VERSION !== 'undefined') {
  version = VERSION;
}
export const SDK_VERSION = version;

export const checkStatus = (response: Response) => {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  if (response.headers.get('Content-Type') === JSONTYPE) {
    return response.json().then((json) => {
      const realmErr = new RealmError(json.error, json.error_code);
      realmErr.response = response;
      realmErr.json = json;
      return Promise.reject(realmErr);
    });
  }

  const error = new ResponseError(response.statusText);
  error.response = response;
  return Promise.reject(error);
};

export interface FetchOptions {
  apiVersion?: number;
  apiType?: string;
  credentials?: RequestCredentials;
  headers?: Record<string, string>;
  noAuth?: boolean;
  refreshOnFailure?: boolean;
  useRefreshToken?: boolean;
  multipart?: boolean;
  body?: string | FormData;
  rootURL?: string;
  queryParams?: { [key: string]: any };
  skipDraft?: boolean;
}

export const makeFetchArgs = (method: string, options?: FetchOptions): RequestInit => {
  const headers = options?.headers ?? {};
  if (!headers.Accept) {
    headers.Accept = JSONTYPE;
  }
  if (!options?.multipart && !headers['Content-Type']) {
    headers['Content-Type'] = JSONTYPE;
  }
  return {
    body: options?.body,
    credentials: options?.credentials,
    headers,
    method,
    mode: 'cors',
  };
};
