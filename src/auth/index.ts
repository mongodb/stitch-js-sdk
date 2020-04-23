import RealmAdminClient from '../Client';
import { RealmError } from '../Errors';

import * as authCommon from './Common';
import createProviders from './Providers';
import { createStorage, Storage } from './Storage';

import jwtDecode from 'jwt-decode';

const EMBEDDED_USER_AUTH_DATA_PARTS = 4;

interface AuthOptions {
  codec?: Record<string, string>;
  namespace?: string;
  storage?: Storage;
  storageType?: string;
  requestOrigin?: string;
}

/** @private */
export default class Auth {
  public authedId?: string;

  public readonly requestOrigin?: string;

  public error: string;

  public readonly storage: Storage;

  private readonly codec: { [key: string]: string };

  private readonly providers: Record<string, any>;

  private auth?: Record<string, any>;

  private rt?: string;

  constructor(private readonly client: RealmAdminClient, public readonly rootUrl: string, options: AuthOptions) {
    options = {
      codec: {
        accessToken: 'access_token',
        deviceId: 'device_id',
        refreshToken: 'refresh_token',
        userId: 'user_id',
      },
      namespace: 'admin',
      storageType: 'localStorage',
      ...options,
    };

    this.client = client;
    this.rootUrl = rootUrl;
    this.codec = options.codec!;
    this.requestOrigin = options.requestOrigin;
    this.storage =
      options.storage ??
      createStorage({
        namespace: options.namespace!,
        storageType: options.storageType!,
      });
    this.providers = createProviders(this);

    const authObj = this._get();
    this.auth = authObj;
    this.authedId = authObj.userId;
    this.rt = this.storage.get(authCommon.REFRESH_TOKEN_KEY);
    return this;
  }

  public provider(name: string) {
    if (!Object.prototype.hasOwnProperty.call(this.providers, name)) {
      throw new Error(`Invalid auth provider specified: ${name}`);
    }

    return this.providers[name];
  }

  public refreshToken() {
    return this.client.doSessionPost().then((json: Record<string, any>) => this.set(json));
  }

  public static pageRootUrl() {
    return [window.location.protocol, '//', window.location.host, window.location.pathname].join('');
  }

  public static getCookie(name: string) {
    const splitCookies = document.cookie.split(' ');
    for (let i = 0; i < splitCookies.length; i++) {
      const cookie = splitCookies[i];
      const sepIdx = cookie.indexOf('=');
      const cookieName = cookie.substring(0, sepIdx);
      if (cookieName === name) {
        const cookieVal = cookie.substring(sepIdx + 1, cookie.length);
        if (cookieVal[cookieVal.length - 1] === ';') {
          return cookieVal.substring(0, cookieVal.length - 1);
        }
        return cookieVal;
      }
    }
    return '';
  }

  public handleCookie() {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      // This means we're running in some environment other
      // than a browser - so handling a cookie makes no sense here.
      return;
    }
    if (!document.cookie) {
      return;
    }

    const uaCookie = Auth.getCookie(authCommon.USER_AUTH_COOKIE_NAME);
    if (!uaCookie) {
      return;
    }

    document.cookie = `${authCommon.USER_AUTH_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
    const userAuth = this.unmarshallUserAuth(uaCookie);
    this.set(userAuth);
    window.history.replaceState(undefined, '', Auth.pageRootUrl());
  }

  public clear() {
    this.auth = undefined;
    this.authedId = undefined;
    this.rt = undefined;

    this.storage.remove(authCommon.USER_AUTH_KEY);
    this.storage.remove(authCommon.REFRESH_TOKEN_KEY);
  }

  // Returns whether or not the access token is expired or is going to expire within 'withinSeconds'
  // seconds, according to current system time. Returns false if the token is malformed in any way.
  public isAccessTokenExpired(withinSeconds = authCommon.DEFAULT_ACCESS_TOKEN_EXPIRE_WITHIN_SECS) {
    const token = this.getAccessToken();
    if (!token) {
      return false;
    }

    let decodedToken: Record<string, any>;
    try {
      decodedToken = jwtDecode(token);
    } catch (e) {
      return false;
    }

    if (!decodedToken) {
      return false;
    }

    return decodedToken.exp && Math.floor(Date.now() / 1000) >= decodedToken.exp - withinSeconds;
  }

  public getAccessToken() {
    return this.auth?.accessToken;
  }

  public getRefreshToken() {
    return this.rt;
  }

  public set(json: Record<string, any>) {
    if (!json) {
      return;
    }

    const newUserAuth: { accessToken?: string; userId?: string } = {};

    if (json[this.codec.refreshToken]) {
      this.rt = json[this.codec.refreshToken];
      delete json[this.codec.refreshToken];
      this.storage.set(authCommon.REFRESH_TOKEN_KEY, this.rt);
    }

    // Merge in new fields with old fields. Typically the first json value
    // is complete with every field inside a user auth, but subsequent requests
    // do not include everything. This merging behavior is safe so long as json
    // value responses with absent fields do not indicate that the field should
    // be unset.
    if (json[this.codec.accessToken]) {
      newUserAuth.accessToken = json[this.codec.accessToken];
    }
    if (json[this.codec.userId]) {
      newUserAuth.userId = json[this.codec.userId];
    }

    this.auth = { ...(this.auth ? this.auth : {}), ...newUserAuth };
    this.authedId = this.auth.userId;
    this.storage.set(authCommon.USER_AUTH_KEY, JSON.stringify(this.auth));
  }

  public _get() {
    const data = this.storage.get(authCommon.USER_AUTH_KEY);
    if (!data) {
      return {};
    }

    try {
      return JSON.parse(data);
    } catch (e) {
      // Need to back out and clear auth otherwise we will never
      // be able to do anything useful.
      this.clear();
      throw new RealmError('Failure retrieving stored auth');
    }
  }

  public unmarshallUserAuth(data: string) {
    const parts = data.split('$');
    if (parts.length !== EMBEDDED_USER_AUTH_DATA_PARTS) {
      throw new RangeError(`invalid user auth data provided: ${data}`);
    }

    return {
      [this.codec.accessToken]: parts[0],
      [this.codec.refreshToken]: parts[1],
      [this.codec.userId]: parts[2],
    };
  }
}
