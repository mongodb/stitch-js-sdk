var $9YOrT$bson = require("bson");
var $9YOrT$querystring = require("query-string");
var $9YOrT$nodefetch = require("node-fetch");
var $9YOrT$detectbrowser = require("detect-browser");
var $9YOrT$jwtdecode = require("jwt-decode");
var $9YOrT$Base64 = require("Base64");
var $9YOrT$formdata = require("form-data");

function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}
function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "StitchClientFactory", () => $d2cfa4d3af65293b$export$bcd553e5cdd70e04);
$parcel$export(module.exports, "StitchAdminClientFactory", () => $6f16075a09f08c90$export$1cc308f04deaa7a1);
$parcel$export(module.exports, "BSON", () => $9087f773fbd3a326$re_export$BSON);
const $8eda865a3f59ae91$export$6ad5149ddc5975aa = '_baas_ua';
const $8eda865a3f59ae91$export$b315e18d7776b217 = '_baas_rt';
const $8eda865a3f59ae91$export$27679e29a5d747dd = '_baas_did';
const $8eda865a3f59ae91$export$b56c47f66926ce06 = '_baas_state';
const $8eda865a3f59ae91$export$98dc88e4299e0f63 = 'baas_ua';
const $8eda865a3f59ae91$export$95c7c81c07ded128 = '_baas_error';
const $8eda865a3f59ae91$export$1e66525f78624edb = '_baas_link';
const $8eda865a3f59ae91$export$f7ebad5035fb5d3a = '_baas_pt';
const $8eda865a3f59ae91$export$b932e4f5204468ed = '_baas_rp';
const $8eda865a3f59ae91$export$a0144ec7f076612d = 10;
const $8eda865a3f59ae91$export$ef2912c5a4434709 = {
    'accessToken': 'access_token',
    'refreshToken': 'refresh_token',
    'deviceId': 'device_id',
    'userId': 'user_id'
};
const $8eda865a3f59ae91$export$790cb3fe07c4778b = {
    'accessToken': 'access_token',
    'refreshToken': 'refresh_token',
    'deviceId': 'device_id',
    'userId': 'user_id'
};


class $8787ab7cf5bf0367$export$d7392285c701ecf5 {
    constructor(){
        this._data = {
        };
        this._orderedKeys = [];
        this.length = 0;
    }
    getItem(key3) {
        return key3 in this._data ? this._data[key3] : null;
    }
    setItem(key1, value) {
        this._orderedKeys.push(key1);
        this._data[key1] = value;
        this.length++;
        return this._data[key1];
    }
    removeItem(key2) {
        this._orderedKeys.pop(key2);
        delete this._data[key2];
        this.length--;
        return undefined;
    }
    key(index) {
        return this._orderedKeys[index];
    }
}
const $8787ab7cf5bf0367$var$_VERSION = 1;
const $8787ab7cf5bf0367$var$_VERSION_KEY = '__baas_storage_version__';
/**
  * Run a migration on the currently used storage
  * that checks to see if the current version is up to date.
  * If the version has not been set, this method will migrate
  * to the latest version.
  *
  * @private
  * @param {Integer} version version number of storage
  * @param {Object} storage storage class being checked
  * @returns {Promise} nullable promise containing migration logic
  */ function $8787ab7cf5bf0367$var$_runMigration(version, storage) {
    switch(version){
        case null:
        case undefined:
            // return a promise,
            // mapping each of the store's keys to a Promise
            // that fetches the each value for each key,
            // sets the old value to the new "namespaced" key
            // remove the old key value pair,
            // and set the version number
            let migrations = [
                $8eda865a3f59ae91$export$6ad5149ddc5975aa,
                $8eda865a3f59ae91$export$b315e18d7776b217,
                $8eda865a3f59ae91$export$27679e29a5d747dd,
                $8eda865a3f59ae91$export$b56c47f66926ce06
            ].map((key)=>Promise.resolve(storage.store.getItem(key)).then((item)=>!!item && storage.store.setItem(storage._generateKey(key), item)
                ).then(()=>storage.store.removeItem(key)
                )
            );
            return Promise.all(migrations).then(()=>storage.store.setItem($8787ab7cf5bf0367$var$_VERSION_KEY, $8787ab7cf5bf0367$var$_VERSION)
            );
        // in future versions, `case 1:`, `case 2:` and so on
        // could be added to perform similar migrations
        default:
            break;
    }
}
/** @private */ class $8787ab7cf5bf0367$var$Storage {
    /**
   * @param {Storage} store implementer of Storage interface
   * @param {String} namespace clientAppID to be used for namespacing
   * @param
  */ constructor(store, namespace1){
        this.store = store;
        this.namespace = `_baas.${namespace1}`;
        this._migration = Promise.resolve(this.store.getItem($8787ab7cf5bf0367$var$_VERSION_KEY)).then((version)=>$8787ab7cf5bf0367$var$_runMigration(version, this)
        );
    }
    _generateKey(key) {
        return `${this.namespace}.${key}`;
    }
    get(key4) {
        return Promise.resolve(this._migration).then(()=>this.store.getItem(this._generateKey(key4))
        );
    }
    set(key5, value1) {
        return Promise.resolve(this._migration).then(()=>this.store.setItem(this._generateKey(key5), value1)
        ).then(()=>value1
        );
    }
    remove(key6) {
        return Promise.resolve(this._migration).then(()=>this.store.removeItem(this._generateKey(key6))
        );
    }
}
function $8787ab7cf5bf0367$export$d184a47a971dd4b9(options) {
    let { storageType: storageType , storage: storage , namespace: namespace  } = options;
    if (storageType === 'localStorage') {
        if (typeof window !== 'undefined' && 'localStorage' in window && window.localStorage !== null) return new $8787ab7cf5bf0367$var$Storage(window.localStorage, namespace);
    } else if (storageType === 'sessionStorage') {
        if (typeof window !== 'undefined' && 'sessionStorage' in window && window.sessionStorage !== null) return new $8787ab7cf5bf0367$var$Storage(window.sessionStorage, namespace);
    } else if (storageType == 'customStorage') return new $8787ab7cf5bf0367$var$Storage(storage, namespace);
    // default to memory storage
    return new $8787ab7cf5bf0367$var$Storage(new $8787ab7cf5bf0367$export$d7392285c701ecf5(), namespace);
}


const $6d165377d3770b7e$var$_Error = function(message, code) {
    Error.call(this, message);
    if (Error.captureStackTrace) Error.captureStackTrace(this);
    this.message = message;
    this.name = this.constructor.name;
    if (code !== undefined) this.code = code;
};
$6d165377d3770b7e$var$_Error.prototype = Object.create(Error.prototype);
/**
 * StitchError represents general errors for SDK operations
 *
 * @class
 * @return {StitchError} a StitchError instance.
 */ class $6d165377d3770b7e$export$92aa0aa8f60e5a4f extends $6d165377d3770b7e$var$_Error {
}
const $6d165377d3770b7e$export$d3641f3066a48dcb = 'AuthProviderNotFound';
const $6d165377d3770b7e$export$604c120584438724 = 'InvalidSession';
const $6d165377d3770b7e$export$14a25834bf5fa686 = 'Unauthorized';


const $da95daf8c95a7a82$export$ad106c78fd3b6e6 = 'application/json';
const $da95daf8c95a7a82$export$347e6d9936c9829 = 'app';
const $da95daf8c95a7a82$export$7ca39f6d0f92b2ab = 'admin';
const $da95daf8c95a7a82$export$15e777aff03fd23c = 'https://realm.mongodb.com';
// VERSION is substituted with the package.json version number at build time
let $da95daf8c95a7a82$var$version = 'unknown';
if (typeof VERSION !== 'undefined') $da95daf8c95a7a82$var$version = VERSION;
const $da95daf8c95a7a82$export$31499a9cd224b78c = $da95daf8c95a7a82$var$version;
const $da95daf8c95a7a82$export$1c8f61c1db5300d2 = (response)=>{
    if (response.status >= 200 && response.status < 300) return response;
    if (response.headers.get('Content-Type') === $da95daf8c95a7a82$export$ad106c78fd3b6e6) return response.json().then((json)=>{
        const error = new $6d165377d3770b7e$export$92aa0aa8f60e5a4f(json.error, json.error_code);
        error.response = response;
        error.json = json;
        return Promise.reject(error);
    });
    const error1 = new Error(response.statusText);
    error1.response = response;
    return Promise.reject(error1);
};
const $da95daf8c95a7a82$export$f269dc256bdbf2f8 = (method, body, options)=>{
    const init = {
        method: method,
        headers: {
            'Accept': $da95daf8c95a7a82$export$ad106c78fd3b6e6,
            'Content-Type': $da95daf8c95a7a82$export$ad106c78fd3b6e6
        }
    };
    if (options && options.credentials) init.credentials = options.credentials;
    if (body) init.body = body;
    init.cors = true;
    return init;
};




/**
 * @namespace util
 * @private
 */ /**
 * Utility method for executing a service action as a function call.
 *
 * @memberof util
 * @param {Object} service the service to execute the action on
 * @param {String} action the service action to execute
 * @param {Array} args the arguments to supply to the service action invocation
 * @returns {Promise} the API response from the executed service action
 */ function $0def88d1384b5b9e$export$f0b7529ba755d680(service, { serviceName: serviceName = service.serviceName , action: action , args: args  }) {
    const { client: client  } = service;
    if (!client) throw new Error('Service has no client');
    return client.executeServiceFunction(serviceName, action, args);
}
/**
 * Utility function to encode a JSON object into a valid string that can be
 * inserted in a URI. The object is first stringified, then encoded in base64,
 * and finally encoded via the builtin encodeURIComponent function.
 *
 * @memberof util
 * @param {Object} obj The object to encode
 * @returns {String} The encoded object
 */ function $0def88d1384b5b9e$export$eb8b1f60ba4589aa(obj) {
    return encodeURIComponent($9YOrT$Base64.btoa(JSON.stringify(obj)));
}


const $7aeb857d9fc35f5f$export$a79c91b221bb4dea = 'anon';
const $7aeb857d9fc35f5f$export$e48f71866ac8652a = 'custom';
const $7aeb857d9fc35f5f$export$3b9f1faf0c9c41fb = 'userpass';
const $7aeb857d9fc35f5f$export$55a72882668e67f5 = 'apiKey';
const $7aeb857d9fc35f5f$export$62be50743fab570 = 'google';
const $7aeb857d9fc35f5f$export$43c1e19648991f7b = 'facebook';
const $7aeb857d9fc35f5f$export$a71df098a182ee3a = 'mongodbCloud';

const $7aeb857d9fc35f5f$export$47fdd40111eda34c = ()=>typeof fetch === 'undefined' ? $9YOrT$nodefetch : fetch
;
function $7aeb857d9fc35f5f$var$urlWithLinkParam(url, link) {
    if (link) return url + '?link=true';
    return url;
}
/**
 * @private
 * @namespace
 */ function $7aeb857d9fc35f5f$var$anonProvider(auth) {
    return {
        /**
     * Login to a stitch application using anonymous authentication
     *
     * @memberof anonProvider
     * @instance
     * @returns {Promise} a promise that resolves when authentication succeeds.
     */ authenticate: (options, link)=>{
            const deviceId = auth.getDeviceId();
            const device = auth.getDeviceInfo(deviceId, !!auth.client && auth.client.clientAppID);
            const fetchArgs = $da95daf8c95a7a82$export$f269dc256bdbf2f8('GET');
            fetchArgs.cors = true;
            const doFetch = $7aeb857d9fc35f5f$export$47fdd40111eda34c();
            return doFetch($7aeb857d9fc35f5f$var$urlWithLinkParam(`${auth.rootUrl}/providers/anon-user/login?device=${$0def88d1384b5b9e$export$eb8b1f60ba4589aa(device)}`, link), auth.fetchArgsWithLink(fetchArgs, link)).then($da95daf8c95a7a82$export$1c8f61c1db5300d2).then((response)=>response.json()
            ).then((json)=>auth.set(json, $7aeb857d9fc35f5f$export$a79c91b221bb4dea)
            );
        }
    };
}
/**
 * @private
 * @namespace
 */ function $7aeb857d9fc35f5f$var$customProvider(auth) {
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
     */ authenticate: (token, link)=>{
            const deviceId = auth.getDeviceId();
            const device = auth.getDeviceInfo(deviceId, !!auth.client && auth.client.clientAppID);
            const fetchArgs = $da95daf8c95a7a82$export$f269dc256bdbf2f8('POST', JSON.stringify({
                token: token,
                options: {
                    device: device
                }
            }));
            fetchArgs.cors = true;
            const doFetch = $7aeb857d9fc35f5f$export$47fdd40111eda34c();
            return doFetch($7aeb857d9fc35f5f$var$urlWithLinkParam(`${auth.rootUrl}/${loginRoute}`, link), auth.fetchArgsWithLink(fetchArgs, link)).then($da95daf8c95a7a82$export$1c8f61c1db5300d2).then((response)=>response.json()
            ).then((json)=>auth.set(json, $7aeb857d9fc35f5f$export$e48f71866ac8652a)
            );
        }
    };
}
/**
 * userPassProvider offers several methods for completing certain tasks necessary for email/password
 * authentication. userPassProvider cannot be instantiated directly. To instantiate,
 * use `.auth.providers('userpass')` on a {@link StitchClient}.
 *
 * @namespace
 */ function $7aeb857d9fc35f5f$var$userPassProvider(auth) {
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
     */ authenticate: ({ username: username , password: password  }, link)=>{
            const deviceId = auth.getDeviceId();
            const device = auth.getDeviceInfo(deviceId, !!auth.client && auth.client.clientAppID);
            const fetchArgs = $da95daf8c95a7a82$export$f269dc256bdbf2f8('POST', JSON.stringify({
                username: username,
                password: password,
                options: {
                    device: device
                }
            }));
            fetchArgs.cors = true;
            const doFetch = $7aeb857d9fc35f5f$export$47fdd40111eda34c();
            return doFetch($7aeb857d9fc35f5f$var$urlWithLinkParam(`${auth.rootUrl}/${loginRoute}`, link), auth.fetchArgsWithLink(fetchArgs, link)).then($da95daf8c95a7a82$export$1c8f61c1db5300d2).then((response)=>response.json()
            ).then((json)=>auth.set(json, $7aeb857d9fc35f5f$export$3b9f1faf0c9c41fb)
            );
        },
        /**
     * Completes the email confirmation workflow from the Stitch server
     *
     * @memberof userPassProvider
     * @instance
     * @param {String} tokenId the tokenId provided by the Stitch server
     * @param {String} token the token provided by the Stitch server
     * @returns {Promise}
     */ emailConfirm: (tokenId, token)=>{
            const fetchArgs = $da95daf8c95a7a82$export$f269dc256bdbf2f8('POST', JSON.stringify({
                tokenId: tokenId,
                token: token
            }));
            fetchArgs.cors = true;
            const doFetch = $7aeb857d9fc35f5f$export$47fdd40111eda34c();
            return doFetch(`${auth.rootUrl}/${providerRoute}/confirm`, fetchArgs).then($da95daf8c95a7a82$export$1c8f61c1db5300d2).then((response)=>response.json()
            );
        },
        /**
     * Request that the stitch server send another email confirmation
     * for account creation.
     *
     * @memberof userPassProvider
     * @instance
     * @param {String} email the email address to send a confirmation email for
     * @returns {Promise}
     */ sendEmailConfirm: (email)=>{
            const fetchArgs = $da95daf8c95a7a82$export$f269dc256bdbf2f8('POST', JSON.stringify({
                email: email
            }));
            fetchArgs.cors = true;
            const doFetch = $7aeb857d9fc35f5f$export$47fdd40111eda34c();
            return doFetch(`${auth.rootUrl}/${providerRoute}/confirm/send`, fetchArgs).then($da95daf8c95a7a82$export$1c8f61c1db5300d2).then((response)=>response.json()
            );
        },
        /**
     * Sends a password reset request to the Stitch server
     *
     * @memberof userPassProvider
     * @instance
     * @param {String} email the email address of the account to reset the password for
     * @returns {Promise}
     */ sendPasswordReset: (email)=>{
            const fetchArgs = $da95daf8c95a7a82$export$f269dc256bdbf2f8('POST', JSON.stringify({
                email: email
            }));
            fetchArgs.cors = true;
            const doFetch = $7aeb857d9fc35f5f$export$47fdd40111eda34c();
            return doFetch(`${auth.rootUrl}/${providerRoute}/reset/send`, fetchArgs).then($da95daf8c95a7a82$export$1c8f61c1db5300d2).then((response)=>response.json()
            );
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
     */ passwordReset: (tokenId, token, password)=>{
            const fetchArgs = $da95daf8c95a7a82$export$f269dc256bdbf2f8('POST', JSON.stringify({
                tokenId: tokenId,
                token: token,
                password: password
            }));
            fetchArgs.cors = true;
            const doFetch = $7aeb857d9fc35f5f$export$47fdd40111eda34c();
            return doFetch(`${auth.rootUrl}/${providerRoute}/reset`, fetchArgs).then($da95daf8c95a7a82$export$1c8f61c1db5300d2).then((response)=>response.json()
            );
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
     */ register: (email, password)=>{
            const fetchArgs = $da95daf8c95a7a82$export$f269dc256bdbf2f8('POST', JSON.stringify({
                email: email,
                password: password
            }));
            fetchArgs.cors = true;
            const doFetch = $7aeb857d9fc35f5f$export$47fdd40111eda34c();
            return doFetch(`${auth.rootUrl}/${providerRoute}/register`, fetchArgs).then($da95daf8c95a7a82$export$1c8f61c1db5300d2).then((response)=>response.json()
            );
        }
    };
}
/**
 * @private
 * @namespace
 */ function $7aeb857d9fc35f5f$var$apiKeyProvider(auth) {
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
     */ authenticate: (key, link)=>{
            const deviceId = auth.getDeviceId();
            const device = auth.getDeviceInfo(deviceId, !!auth.client && auth.client.clientAppID);
            const fetchArgs = $da95daf8c95a7a82$export$f269dc256bdbf2f8('POST', JSON.stringify({
                key: key,
                options: {
                    device: device
                }
            }));
            fetchArgs.cors = true;
            const doFetch = $7aeb857d9fc35f5f$export$47fdd40111eda34c();
            return doFetch($7aeb857d9fc35f5f$var$urlWithLinkParam(`${auth.rootUrl}/${loginRoute}`, link), auth.fetchArgsWithLink(fetchArgs, link)).then($da95daf8c95a7a82$export$1c8f61c1db5300d2).then((response)=>response.json()
            ).then((json)=>auth.set(json, $7aeb857d9fc35f5f$export$55a72882668e67f5)
            );
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
const $7aeb857d9fc35f5f$var$alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
function $7aeb857d9fc35f5f$var$generateState() {
    let state = '';
    for(let i = 0; i < 64; ++i)state += $7aeb857d9fc35f5f$var$alpha.charAt(Math.floor(Math.random() * $7aeb857d9fc35f5f$var$alpha.length));
    return state;
}
function $7aeb857d9fc35f5f$var$getOAuthLoginURL(auth, providerName, redirectUrl) {
    if (redirectUrl === undefined) redirectUrl = auth.pageRootUrl();
    const state = $7aeb857d9fc35f5f$var$generateState();
    return auth.storage.set($8eda865a3f59ae91$export$b56c47f66926ce06, state).then(()=>auth.getDeviceId()
    ).then((deviceId)=>{
        const device = auth.getDeviceInfo(deviceId, !!auth.client && auth.client.clientAppID);
        const result = `${auth.rootUrl}/providers/oauth2-${providerName}/login?redirect=${encodeURI(redirectUrl)}&state=${state}&device=${$0def88d1384b5b9e$export$eb8b1f60ba4589aa(device)}`;
        return result;
    });
}
/**
 * @private
 * @namespace
 */ function $7aeb857d9fc35f5f$var$googleProvider(auth) {
    const loginRoute = auth.isAppClient() ? 'providers/oauth2-google/login' : 'providers/oauth2-google/login';
    return {
        /**
     * Login to a stitch application using google authentication
     *
     * @memberof googleProvider
     * @instance
     * @param {Object} data the redirectUrl data to use for authentication
     * @returns {Promise} a promise that resolves when authentication succeeds.
     */ authenticate: (data, link)=>{
            let { authCode: authCode  } = data;
            if (authCode) {
                const deviceId = auth.getDeviceId();
                const device = auth.getDeviceInfo(deviceId, !!auth.client && auth.client.clientAppID);
                const fetchArgs = $da95daf8c95a7a82$export$f269dc256bdbf2f8('POST', JSON.stringify({
                    authCode: authCode,
                    options: {
                        device: device
                    }
                }));
                const doFetch = $7aeb857d9fc35f5f$export$47fdd40111eda34c();
                return doFetch($7aeb857d9fc35f5f$var$urlWithLinkParam(`${auth.rootUrl}/${loginRoute}`, link), auth.fetchArgsWithLink(fetchArgs, link)).then($da95daf8c95a7a82$export$1c8f61c1db5300d2).then((response)=>response.json()
                ).then((json)=>auth.set(json, $7aeb857d9fc35f5f$export$62be50743fab570)
                );
            }
            const redirectUrl = data && data.redirectUrl ? data.redirectUrl : undefined;
            return auth.storage.set($8eda865a3f59ae91$export$b932e4f5204468ed, $7aeb857d9fc35f5f$export$62be50743fab570).then(()=>$7aeb857d9fc35f5f$var$getOAuthLoginURL(auth, $7aeb857d9fc35f5f$export$62be50743fab570, redirectUrl)
            ).then((res)=>window.location.replace(res)
            );
        }
    };
}
/**
 * @private
 * @namespace
 */ function $7aeb857d9fc35f5f$var$facebookProvider(auth) {
    const loginRoute = auth.isAppClient() ? 'providers/oauth2-facebook/login' : 'providers/oauth2-facebook/login';
    return {
        /**
     * Login to a stitch application using facebook authentication
     *
     * @memberof facebookProvider
     * @instance
     * @param {Object} data the redirectUrl data to use for authentication
     * @returns {Promise} a promise that resolves when authentication succeeds.
     */ authenticate: (data, link)=>{
            let { accessToken: accessToken  } = data;
            if (accessToken) {
                const deviceId = auth.getDeviceId();
                const device = auth.getDeviceInfo(deviceId, !!auth.client && auth.client.clientAppID);
                const fetchArgs = $da95daf8c95a7a82$export$f269dc256bdbf2f8('POST', JSON.stringify({
                    accessToken: accessToken,
                    options: {
                        device: device
                    }
                }));
                const doFetch = $7aeb857d9fc35f5f$export$47fdd40111eda34c();
                return doFetch($7aeb857d9fc35f5f$var$urlWithLinkParam(`${auth.rootUrl}/${loginRoute}`, link), auth.fetchArgsWithLink(fetchArgs, link)).then($da95daf8c95a7a82$export$1c8f61c1db5300d2).then((response)=>response.json()
                ).then((json)=>auth.set(json, $7aeb857d9fc35f5f$export$43c1e19648991f7b)
                );
            }
            const redirectUrl = data && data.redirectUrl ? data.redirectUrl : undefined;
            return auth.storage.set($8eda865a3f59ae91$export$b932e4f5204468ed, $7aeb857d9fc35f5f$export$43c1e19648991f7b).then(()=>$7aeb857d9fc35f5f$var$getOAuthLoginURL(auth, $7aeb857d9fc35f5f$export$43c1e19648991f7b, redirectUrl)
            ).then((res)=>window.location.replace(res)
            );
        }
    };
}
/**
 * @private
 * @namespace
 */ function $7aeb857d9fc35f5f$var$mongodbCloudProvider(auth) {
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
     */ authenticate: (data, link)=>{
            const { username: username , apiKey: apiKey , cors: cors , cookie: cookie  } = data;
            const options = Object.assign({
            }, {
                cors: true,
                cookie: false
            }, {
                cors: cors,
                cookie: cookie
            });
            const deviceId = auth.getDeviceId();
            const device = auth.getDeviceInfo(deviceId, !!auth.client && auth.client.clientAppID);
            const fetchArgs = $da95daf8c95a7a82$export$f269dc256bdbf2f8('POST', JSON.stringify({
                username: username,
                apiKey: apiKey,
                options: {
                    device: device
                }
            }));
            fetchArgs.cors = true; // TODO: shouldn't this use the passed in `cors` value?
            fetchArgs.credentials = 'include';
            const doFetch = $7aeb857d9fc35f5f$export$47fdd40111eda34c();
            let url = $7aeb857d9fc35f5f$var$urlWithLinkParam(`${auth.rootUrl}/${loginRoute}`, link);
            if (options.cookie) return doFetch(url + '?cookie=true', fetchArgs).then($da95daf8c95a7a82$export$1c8f61c1db5300d2);
            return doFetch(url, auth.fetchArgsWithLink(fetchArgs, link)).then($da95daf8c95a7a82$export$1c8f61c1db5300d2).then((response)=>response.json()
            ).then((json)=>auth.set(json, $7aeb857d9fc35f5f$export$a71df098a182ee3a)
            );
        }
    };
}
// TODO: support auth-specific options
function $7aeb857d9fc35f5f$export$814e607a4dbc5ea7(auth, options = {
}) {
    return {
        [$7aeb857d9fc35f5f$export$a79c91b221bb4dea]: $7aeb857d9fc35f5f$var$anonProvider(auth),
        [$7aeb857d9fc35f5f$export$55a72882668e67f5]: $7aeb857d9fc35f5f$var$apiKeyProvider(auth),
        [$7aeb857d9fc35f5f$export$62be50743fab570]: $7aeb857d9fc35f5f$var$googleProvider(auth),
        [$7aeb857d9fc35f5f$export$43c1e19648991f7b]: $7aeb857d9fc35f5f$var$facebookProvider(auth),
        [$7aeb857d9fc35f5f$export$a71df098a182ee3a]: $7aeb857d9fc35f5f$var$mongodbCloudProvider(auth),
        [$7aeb857d9fc35f5f$export$3b9f1faf0c9c41fb]: $7aeb857d9fc35f5f$var$userPassProvider(auth),
        [$7aeb857d9fc35f5f$export$e48f71866ac8652a]: $7aeb857d9fc35f5f$var$customProvider(auth)
    };
}







const $9fd5db7e3909eb7f$var$EMBEDDED_USER_AUTH_DATA_PARTS = 4;
class $9fd5db7e3909eb7f$export$a4b63a972049ab97 {
    constructor(){
        throw new $6d165377d3770b7e$export$92aa0aa8f60e5a4f('Auth can only be made from the AuthFactory.create function');
    }
    static create(client1, rootUrl1, options1) {
        return $9fd5db7e3909eb7f$export$2294c375cbb7cefa(client1, rootUrl1, options1);
    }
}
function $9fd5db7e3909eb7f$export$2294c375cbb7cefa(client, rootUrl, options) {
    let auth = Object.create($9fd5db7e3909eb7f$export$334c29725a78c21d.prototype);
    let namespace;
    if (!client || client.clientAppID === '') namespace = 'admin';
    else namespace = `client.${client.clientAppID}`;
    options = Object.assign({
        codec: $8eda865a3f59ae91$export$ef2912c5a4434709,
        namespace: namespace,
        storageType: 'localStorage'
    }, options);
    auth.client = client;
    auth.rootUrl = rootUrl;
    auth.codec = options.codec;
    auth.requestOrigin = options.requestOrigin;
    auth.platform = options.platform || $9YOrT$detectbrowser;
    auth.storage = $8787ab7cf5bf0367$export$d184a47a971dd4b9(options);
    auth.providers = $7aeb857d9fc35f5f$export$814e607a4dbc5ea7(auth, options);
    return Promise.all([
        auth._get(),
        auth.storage.get($8eda865a3f59ae91$export$b315e18d7776b217),
        auth.storage.get($8eda865a3f59ae91$export$f7ebad5035fb5d3a),
        auth.storage.get($8eda865a3f59ae91$export$27679e29a5d747dd)
    ]).then(([authObj, rt, loggedInProviderType, deviceId])=>{
        auth.auth = authObj;
        auth.authedId = authObj.userId;
        auth.rt = rt;
        auth.loggedInProviderType = loggedInProviderType;
        auth.deviceId = deviceId;
        return auth;
    });
}
class $9fd5db7e3909eb7f$export$334c29725a78c21d {
    constructor(client, rootUrl, options){
        throw new $6d165377d3770b7e$export$92aa0aa8f60e5a4f('Auth can only be made from the AuthFactory.create function');
    }
    /**
   * Create the device info for this client.
   *
   * @private
   * @memberof module:auth
   * @method getDeviceInfo
   * @param {String} appId The app ID for this client
   * @param {String} appVersion The version of the app
   * @returns {Object} The device info object
   */ getDeviceInfo(deviceId, appId, appVersion = '') {
        const deviceInfo = {
            appId: appId,
            appVersion: appVersion,
            sdkVersion: $da95daf8c95a7a82$export$31499a9cd224b78c
        };
        if (deviceId) deviceInfo.deviceId = deviceId;
        if (this.platform) {
            deviceInfo.platform = this.platform.name;
            deviceInfo.platformVersion = this.platform.version;
        }
        return deviceInfo;
    }
    provider(name) {
        if (!this.providers.hasOwnProperty(name)) throw new Error('Invalid auth provider specified: ' + name);
        return this.providers[name];
    }
    refreshToken() {
        return this.client.doSessionPost().then((json)=>this.set(json)
        );
    }
    pageRootUrl() {
        return [
            window.location.protocol,
            '//',
            window.location.host,
            window.location.pathname
        ].join('');
    }
    error() {
        return this._error;
    }
    isAppClient() {
        if (!this.client) return true; // Handle the case where Auth is constructed with null
        return this.client.type === $da95daf8c95a7a82$export$347e6d9936c9829;
    }
    handleRedirect() {
        if (typeof window === 'undefined') // This means we're running in some environment other
        // than a browser - so handling a redirect makes no sense here.
        return;
        if (!window.location || !window.location.hash) return;
        return Promise.all([
            this.storage.get($8eda865a3f59ae91$export$b56c47f66926ce06),
            this.storage.get($8eda865a3f59ae91$export$b932e4f5204468ed)
        ]).then(([ourState, redirectProvider])=>{
            let redirectFragment = window.location.hash.substring(1);
            const redirectState = this.parseRedirectFragment(redirectFragment, ourState);
            if (redirectState.lastError || redirectState.found && !redirectProvider) {
                console.error(`StitchClient: error from redirect: ${redirectState.lastError ? redirectState.lastError : 'provider type not set'}`);
                this._error = redirectState.lastError;
                window.history.replaceState(null, '', this.pageRootUrl());
                return Promise.reject();
            }
            if (!redirectState.found) return Promise.reject();
            return Promise.all([
                this.storage.remove($8eda865a3f59ae91$export$b56c47f66926ce06),
                this.storage.remove($8eda865a3f59ae91$export$b932e4f5204468ed)
            ]).then(()=>({
                    redirectState: redirectState,
                    redirectProvider: redirectProvider
                })
            );
        }).then(({ redirectState: redirectState , redirectProvider: redirectProvider  })=>{
            if (!redirectState.stateValid) {
                console.error('StitchClient: state values did not match!');
                window.history.replaceState(null, '', this.pageRootUrl());
                return;
            }
            if (!redirectState.ua) {
                console.error('StitchClient: no UA value was returned from redirect!');
                return;
            }
            // If we get here, the state is valid - set auth appropriately.
            return this.set(redirectState.ua, redirectProvider);
        }).then(()=>window.history.replaceState(null, '', this.pageRootUrl())
        ).catch((error)=>{
            if (error) throw error;
        });
    }
    getCookie(name1) {
        let splitCookies = document.cookie.split(' ');
        for(let i = 0; i < splitCookies.length; i++){
            let cookie = splitCookies[i];
            let sepIdx = cookie.indexOf('=');
            let cookieName = cookie.substring(0, sepIdx);
            if (cookieName === name1) {
                let cookieVal = cookie.substring(sepIdx + 1, cookie.length);
                if (cookieVal[cookieVal.length - 1] === ';') return cookieVal.substring(0, cookieVal.length - 1);
                return cookieVal;
            }
        }
    }
    handleCookie() {
        if (typeof window === 'undefined' || typeof document === 'undefined') // This means we're running in some environment other
        // than a browser - so handling a cookie makes no sense here.
        return;
        if (!document.cookie) return;
        let uaCookie = this.getCookie($8eda865a3f59ae91$export$98dc88e4299e0f63);
        if (!uaCookie) return;
        document.cookie = `${$8eda865a3f59ae91$export$98dc88e4299e0f63}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
        const userAuth = this.unmarshallUserAuth(uaCookie);
        return this.set(userAuth, $7aeb857d9fc35f5f$export$a71df098a182ee3a).then(()=>window.history.replaceState(null, '', this.pageRootUrl())
        );
    }
    clear() {
        this.auth = null;
        this.authedId = null;
        this.rt = null;
        this.loggedInProviderType = null;
        return Promise.all([
            this.storage.remove($8eda865a3f59ae91$export$6ad5149ddc5975aa),
            this.storage.remove($8eda865a3f59ae91$export$b315e18d7776b217),
            this.storage.remove($8eda865a3f59ae91$export$f7ebad5035fb5d3a),
            this.storage.remove($8eda865a3f59ae91$export$b932e4f5204468ed)
        ]);
    }
    getDeviceId() {
        return this.deviceId;
    }
    // Returns whether or not the access token is expired or is going to expire within 'withinSeconds'
    // seconds, according to current system time. Returns false if the token is malformed in any way.
    isAccessTokenExpired(withinSeconds = $8eda865a3f59ae91$export$a0144ec7f076612d) {
        const token = this.getAccessToken();
        if (!token) return false;
        let decodedToken;
        try {
            decodedToken = $9YOrT$jwtdecode(token);
        } catch (e) {
            return false;
        }
        if (!decodedToken) return false;
        return decodedToken.exp && Math.floor(Date.now() / 1000) >= decodedToken.exp - withinSeconds;
    }
    getAccessToken() {
        return this.auth.accessToken;
    }
    getRefreshToken() {
        return this.rt;
    }
    set(json, authType = '') {
        if (!json) return;
        let newUserAuth = {
        };
        let setters = [];
        if (authType) {
            this.loggedInProviderType = authType;
            setters.push(this.storage.set($8eda865a3f59ae91$export$f7ebad5035fb5d3a, authType));
        }
        if (json[this.codec.refreshToken]) {
            this.rt = json[this.codec.refreshToken];
            delete json[this.codec.refreshToken];
            setters.push(this.storage.set($8eda865a3f59ae91$export$b315e18d7776b217, this.rt));
        }
        if (json[this.codec.deviceId]) {
            this.deviceId = json[this.codec.deviceId];
            delete json[this.codec.deviceId];
            setters.push(this.storage.set($8eda865a3f59ae91$export$27679e29a5d747dd, this.deviceId));
        }
        // Merge in new fields with old fields. Typically the first json value
        // is complete with every field inside a user auth, but subsequent requests
        // do not include everything. This merging behavior is safe so long as json
        // value responses with absent fields do not indicate that the field should
        // be unset.
        if (json[this.codec.accessToken]) newUserAuth.accessToken = json[this.codec.accessToken];
        if (json[this.codec.userId]) newUserAuth.userId = json[this.codec.userId];
        this.auth = Object.assign(this.auth ? this.auth : {
        }, newUserAuth);
        this.authedId = this.auth.userId;
        setters.push(this.storage.set($8eda865a3f59ae91$export$6ad5149ddc5975aa, JSON.stringify(this.auth)));
        return Promise.all(setters).then(()=>this.auth
        );
    }
    _get() {
        return this.storage.get($8eda865a3f59ae91$export$6ad5149ddc5975aa).then((data)=>{
            if (!data) return {
            };
            try {
                return JSON.parse(data);
            } catch (e) {
                // Need to back out and clear auth otherwise we will never
                // be able to do anything useful.
                return this.clear().then(()=>{
                    throw new $6d165377d3770b7e$export$92aa0aa8f60e5a4f('Failure retrieving stored auth');
                });
            }
        });
    }
    getLoggedInProviderType() {
        return this.loggedInProviderType;
    }
    parseRedirectFragment(fragment, ourState) {
        // After being redirected from oauth, the URL will look like:
        // https://todo.examples.stitch.mongodb.com/#_baas_state=...&_baas_ua=...
        // This function parses out stitch-specific tokens from the fragment and
        // builds an object describing the result.
        const vars = fragment.split('&');
        const result = {
            ua: null,
            found: false,
            stateValid: false,
            lastError: null
        };
        let shouldBreak = false;
        for(let i = 0; i < vars.length && !shouldBreak; ++i){
            const pairParts = vars[i].split('=');
            const pairKey = decodeURIComponent(pairParts[0]);
            switch(pairKey){
                case $8eda865a3f59ae91$export$95c7c81c07ded128:
                    result.lastError = decodeURIComponent(pairParts[1]);
                    result.found = true;
                    shouldBreak = true;
                    break;
                case $8eda865a3f59ae91$export$6ad5149ddc5975aa:
                    try {
                        result.ua = this.unmarshallUserAuth(decodeURIComponent(pairParts[1]));
                        result.found = true;
                    } catch (e) {
                        result.lastError = e;
                    }
                    continue;
                case $8eda865a3f59ae91$export$1e66525f78624edb:
                    result.found = true;
                    continue;
                case $8eda865a3f59ae91$export$b56c47f66926ce06:
                    result.found = true;
                    let theirState = decodeURIComponent(pairParts[1]);
                    if (ourState && ourState === theirState) result.stateValid = true;
                    continue;
                default:
                    continue;
            }
        }
        return result;
    }
    unmarshallUserAuth(data) {
        let parts = data.split('$');
        if (parts.length !== $9fd5db7e3909eb7f$var$EMBEDDED_USER_AUTH_DATA_PARTS) throw new RangeError('invalid user auth data provided: ' + data);
        return {
            [this.codec.accessToken]: parts[0],
            [this.codec.refreshToken]: parts[1],
            [this.codec.userId]: parts[2],
            [this.codec.deviceId]: parts[3]
        };
    }
    fetchArgsWithLink(fetchArgs, link) {
        if (link) fetchArgs.headers.Authorization = `Bearer ${this.getAccessToken()}`;
        return fetchArgs;
    }
}





/**
 * Convenience wrapper around AWS S3 service (not meant to be instantiated directly,
 * use `.service('aws-s3', '<service-name>')` on a {@link StitchClient} instance).
 *
 * @class
 * @return {S3Service} a S3Service instance.
 */ class $7981134092bfd45b$var$S3Service {
    constructor(stitchClient, serviceName){
        this.client = stitchClient;
        this.serviceName = serviceName;
    }
    /**
   * Put an object to S3 via Stitch. For small uploads
   *
   * @param {String} bucket which S3 bucket to use
   * @param {String} key which key (filename) to use
   * @param {String} acl which policy to apply
   * @param {String} contentType content type of uploaded data
   * @param {String|BSON.Binary} body the content to put in the bucket
   * @return {Promise} which resolves to an object containing a single field "location"
   *                   which is the URL of the object that was put into the S3 bucket
   */ put(bucket, key, acl, contentType, body) {
        return $0def88d1384b5b9e$export$f0b7529ba755d680(this, {
            action: 'put',
            args: {
                bucket: bucket,
                key: key,
                acl: acl,
                contentType: contentType,
                body: body
            }
        });
    }
    /**
   * Sign a policy for putting via Stitch. For large uploads
   *
   * @param {String} bucket which S3 bucket to use
   * @param {String} key which key (filename) to use
   * @param {String} acl which policy to apply
   * @param {String} contentType content type of uploaded data
   * @return {Promise}
   */ signPolicy(bucket1, key1, acl1, contentType1) {
        return $0def88d1384b5b9e$export$f0b7529ba755d680(this, {
            action: 'signPolicy',
            args: {
                bucket: bucket1,
                key: key1,
                acl: acl1,
                contentType: contentType1
            }
        });
    }
}
var $7981134092bfd45b$export$2e2bcd8739ae039 = $7981134092bfd45b$var$S3Service;



/**
 * Convenience wrapper around AWS SES service (not meant to be instantiated directly,
 * use `.service('aws-ses', '<service-name>')` on a {@link StitchClient} instance).
 *
 * @class
 * @return {SESService} a SESService instance.
 */ class $f5ec7025a7ca60a9$var$SESService {
    constructor(stitchClient, serviceName){
        this.client = stitchClient;
        this.serviceName = serviceName;
    }
    /**
   * Send an email
   *
   * @method
   * @param {String} fromAddress the email to send from
   * @param {String} toAddress the email to send to
   * @param {String} subject the subject of the email
   * @param {String} body the body of the email
   * @return {Promise} resolving to an object which contains the single string field
   *                   "messageId", which is the SES message ID for the email message.
   */ send(fromAddress, toAddress, subject, body) {
        return $0def88d1384b5b9e$export$f0b7529ba755d680(this, {
            action: 'send',
            args: {
                fromAddress: fromAddress,
                toAddress: toAddress,
                subject: subject,
                body: body
            }
        });
    }
}
var $f5ec7025a7ca60a9$export$2e2bcd8739ae039 = $f5ec7025a7ca60a9$var$SESService;



/**
 * Convenience wrapper for HTTP service (not meant to be instantiated directly,
 * use `.service('http', '<service-name>')` on a {@link StitchClient} instance).
 *
 * @class
 * @return {HTTPService} a HTTPService instance.
 */ class $06262552bb4e9767$var$HTTPService {
    constructor(client, serviceName){
        this.client = client;
        this.serviceName = serviceName;
    }
    /**
   * Send a GET request to a resource (result must be application/json)
   *
   * @param {String|Object} urlOrOptions the url to request, or an object of GET args
   * @param {Object} [options] optional settings for the GET operation
   * @param {String} [options.authUrl] url that grants a cookie
   * @return {Promise}
   */ get(urlOrOptions6, options6 = {
    }) {
        return $06262552bb4e9767$var$buildResponse('get', this, $06262552bb4e9767$var$buildArgs(urlOrOptions6, options6));
    }
    /**
   * Send a POST request to a resource with payload
   *
   * @param {String|Object} urlOrOptions the url to request, or an object of POST args
   * @param {Object} [options] optional settings for the POST operation
   * @param {String} [options.authUrl] url that grants a cookie
   * @return {Promise}
   */ post(urlOrOptions1, options1 = {
    }) {
        return $06262552bb4e9767$var$buildResponse('post', this, $06262552bb4e9767$var$buildArgs(urlOrOptions1, options1));
    }
    /**
   * Send a PUT request to a resource with payload
   *
   * @param {String|Object} urlOrOptions the url to request, or an object of PUT args
   * @param {Object} [options] optional settings for the PUT operation
   * @param {String} [options.authUrl] url that grants a cookie
   * @return {Promise}
   */ put(urlOrOptions2, options2 = {
    }) {
        return $06262552bb4e9767$var$buildResponse('put', this, $06262552bb4e9767$var$buildArgs(urlOrOptions2, options2));
    }
    /**
   * Send a PATCH request to a resource with payload
   *
   * @param {String|Object} urlOrOptions the url to request, or an object of PATCH args
   * @param {Object} [options] optional settings for the PATCH operation
   * @param {String} [options.authUrl] url that grants a cookie
   * @return {Promise}
   */ patch(urlOrOptions3, options3 = {
    }) {
        return $06262552bb4e9767$var$buildResponse('patch', this, $06262552bb4e9767$var$buildArgs(urlOrOptions3, options3));
    }
    /**
   * Send a DELETE request to a resource
   *
   * @param {String|Object} urlOrOptions the url to request, or an object of DELETE args
   * @param {Object} [options] optional settings for the DELETE operation
   * @param {String} [options.authUrl] url that grants a cookie
   * @return {Promise}
   */ delete(urlOrOptions4, options4 = {
    }) {
        return $06262552bb4e9767$var$buildResponse('delete', this, $06262552bb4e9767$var$buildArgs(urlOrOptions4, options4));
    }
    /**
   * Send a HEAD request to a resource
   *
   * @param {String|Object} urlOrOptions the url to request, or an object of HEAD args
   * @param {Object} [options] optional settings for the HEAD operation
   * @param {String} [options.authUrl] url that grants a cookie
   * @return {Promise}
   */ head(urlOrOptions5, options5 = {
    }) {
        return $06262552bb4e9767$var$buildResponse('head', this, $06262552bb4e9767$var$buildArgs(urlOrOptions5, options5));
    }
}
function $06262552bb4e9767$var$buildArgs(urlOrOptions, options) {
    let args;
    if (typeof urlOrOptions !== 'string') args = urlOrOptions;
    else {
        args = {
            url: urlOrOptions
        };
        if (!!options.authUrl) args.authUrl = options.authUrl;
    }
    return args;
}
function $06262552bb4e9767$var$buildResponse(action, service, args) {
    return $0def88d1384b5b9e$export$f0b7529ba755d680(service, {
        action: action,
        args: args
    });
}
var $06262552bb4e9767$export$2e2bcd8739ae039 = $06262552bb4e9767$var$HTTPService;



/**
 * Creates a new Collection instance (not meant to be instantiated directly,
 * use `.collection()` on a {@link DB} instance).
 *
 * @class
 * @return {Collection} a Collection instance.
 */ class $2c7a0368812d9d18$var$Collection {
    /**
   * @hideconstructor
   */ constructor(db, name){
        this.db = db;
        this.name = name;
    }
    /**
   * Inserts a single document.
   *
   * @method
   * @param {Object} doc The document to insert.
   * @return {Promise<Object, Error>} a Promise for the operation.
   */ insertOne(doc) {
        const args = {
            document: doc
        };
        return $2c7a0368812d9d18$var$buildResponse('insertOne', this, $2c7a0368812d9d18$var$buildArgs(this, args));
    }
    /**
   * Inserts multiple documents.
   *
   * @method
   * @param {Array} docs The documents to insert.
   * @return {Promise<Object, Error>} Returns a Promise for the operation.
   */ insertMany(docs) {
        const args = {
            documents: Array.isArray(docs) ? docs : [
                docs
            ]
        };
        return $2c7a0368812d9d18$var$buildResponse('insertMany', this, $2c7a0368812d9d18$var$buildArgs(this, args));
    }
    /**
   * Deletes a single document.
   *
   * @method
   * @param {Object} query The query used to match a single document.
   * @return {Promise<Object, Error>} Returns a Promise for the operation.
   */ deleteOne(query7) {
        return $2c7a0368812d9d18$var$buildResponse('deleteOne', this, $2c7a0368812d9d18$var$buildArgs(this, {
            query: query7
        }));
    }
    /**
   * Deletes all documents matching query.
   *
   * @method
   * @param {Object} query The query used to match the documents to delete.
   * @return {Promise<Object, Error>} Returns a Promise for the operation.
   */ deleteMany(query1) {
        return $2c7a0368812d9d18$var$buildResponse('deleteMany', this, $2c7a0368812d9d18$var$buildArgs(this, {
            query: query1
        }));
    }
    /**
   * Updates a single document.
   *
   * @method
   * @param {Object} query The query used to match a single document.
   * @param {Object} update The update operations to perform on the matching document.
   * @param {Object} [options] Additional options object.
   * @param {Boolean} [options.upsert=false] Perform an upsert operation.
   * @return {Promise<Object, Error>} A Promise for the operation.
   */ updateOne(query2, update2, options2 = {
    }) {
        return $2c7a0368812d9d18$var$updateOp(this, false, query2, update2, options2);
    }
    /**
   * Updates multiple documents.
   *
   * @method
   * @param {Object} query The query used to match the documents.
   * @param {Object} update The update operations to perform on the matching documents.
   * @param {Object} [options] Additional options object.
   * @param {Boolean} [options.upsert=false] Perform an upsert operation.
   * @return {Promise<Object, Error>} Returns a Promise for the operation.
   */ updateMany(query3, update1) {
        return $2c7a0368812d9d18$var$updateOp(this, true, query3, update1);
    }
    /**
   * Finds documents.
   *
   * @method
   * @param {Object} query The query used to match documents.
   * @param {Object} [project] The query document projection.
   * @return {MongoQuery} An object which allows for `limit` and `sort` parameters to be set.
   * `execute` will return a {Promise} for the operation.
   */ find(query4, project2) {
        return new $2c7a0368812d9d18$var$MongoQuery(this, query4, project2);
    }
    /**
   * Finds one document.
   *
   * @method
   * @param {Object} query The query used to match documents.
   * @param {Object} [project] The query document projection.
   * @return {Promise<Object, Error>} Returns a Promise for the operation
   */ findOne(query5, project1) {
        return $2c7a0368812d9d18$var$buildResponse('findOne', this, $2c7a0368812d9d18$var$buildArgs(this, {
            query: query5,
            project: project1
        }));
    }
    /**
   * Executes an aggregation pipeline.
   *
   * @param {Array} pipeline The aggregation pipeline.
   * @returns {Array} The results of the aggregation.
   */ aggregate(pipeline1) {
        return $2c7a0368812d9d18$var$aggregateOp(this, pipeline1);
    }
    /**
   * Gets the number of documents matching the filter.
   *
   * @param {Object} query The query used to match documents.
   * @param {Object} options Additional count options.
   * @param {Number} [options.limit=null] The maximum number of documents to return.
   * @return {Number} The results of the count operation.
   */ count(query6, options1 = {
    }) {
        let outgoingOptions;
        if (options1.limit) outgoingOptions = {
            limit: options1.limit
        };
        return $2c7a0368812d9d18$var$buildResponse('count', this, $2c7a0368812d9d18$var$buildArgs(this, {
            count: true,
            query: query6
        }, outgoingOptions));
    }
}
// private
function $2c7a0368812d9d18$var$updateOp(service, isMulti, query, update, options = {
}) {
    const action = isMulti ? 'updateMany' : 'updateOne';
    let outgoingOptions;
    if (!isMulti && options.upsert) outgoingOptions = {
        upsert: true
    };
    return $2c7a0368812d9d18$var$buildResponse(action, service, $2c7a0368812d9d18$var$buildArgs(service, {
        query: query,
        update: update
    }, outgoingOptions));
}
function $2c7a0368812d9d18$var$findOp({ service: service , query: query , project: project , limit: limit , sort: sort  }) {
    return $2c7a0368812d9d18$var$buildResponse('find', service, $2c7a0368812d9d18$var$buildArgs(service, {
        query: query,
        project: project,
        limit: limit,
        sort: sort
    }));
}
function $2c7a0368812d9d18$var$aggregateOp(service, pipeline) {
    return $2c7a0368812d9d18$var$buildResponse('aggregate', service, $2c7a0368812d9d18$var$buildArgs(service, {
        pipeline: pipeline
    }));
}
function $2c7a0368812d9d18$var$buildArgs({ db: { name: database  } , name: collection  }, args, options = {
}) {
    return Object.assign({
        database: database,
        collection: collection
    }, args, options);
}
function $2c7a0368812d9d18$var$buildResponse(action, service, args) {
    return $0def88d1384b5b9e$export$f0b7529ba755d680(service.db, {
        serviceName: service.db.service,
        action: action,
        args: args
    });
}
// mongo query (find) support
function $2c7a0368812d9d18$var$MongoQuery(service, query, project) {
    if (this instanceof $2c7a0368812d9d18$var$MongoQuery) {
        this.service = service;
        this.query = query;
        this.project = project;
        return this;
    }
    return new $2c7a0368812d9d18$var$MongoQuery(service, query, project);
}
$2c7a0368812d9d18$var$MongoQuery.prototype.limit = function(limit) {
    this.limit = limit;
    return this;
};
$2c7a0368812d9d18$var$MongoQuery.prototype.sort = function(sort) {
    this.sort = sort;
    return this;
};
$2c7a0368812d9d18$var$MongoQuery.prototype.execute = function(resolve) {
    return $2c7a0368812d9d18$var$findOp(this);
};
var $2c7a0368812d9d18$export$2e2bcd8739ae039 = $2c7a0368812d9d18$var$Collection;


/**
 * Creates a new DB instance (not meant to be instantiated directly, use `.db()` on
 * a {@link MongoDBService} instance).
 * @class
 * @return {DB} a DB instance.
 */ class $9435886974ca760d$var$DB {
    /**
   * @hideconstructor
   */ constructor(client, service, name){
        this.client = client;
        this.service = service;
        this.name = name;
    }
    /**
   * Returns a Collection instance representing a MongoDB Collection object.
   *
   * @method
   * @param {String} name The collection name.
   * @param {Object} [options] Additional options.
   * @return {Collection} returns a Collection instance representing a MongoDb collection.
   */ collection(name1, options = {
    }) {
        return new $2c7a0368812d9d18$export$2e2bcd8739ae039(this, name1, options);
    }
}
var $9435886974ca760d$export$2e2bcd8739ae039 = $9435886974ca760d$var$DB;


/**
 * Creates a new MongoDBService instance (not meant to be instantiated directly, use
 * `.service('mongodb', '<service-name>')` on a {@link StitchClient} instance.
 *
 * @class
 * @return {MongoDBService} a MongoDBService instance.
 */ class $f3d238c9fb10527f$var$MongoDBService {
    /**
   * @hideconstructor
   */ constructor(stitchClient, serviceName){
        this.stitchClient = stitchClient;
        this.serviceName = serviceName;
    }
    /**
   * Get a DB instance
   *
   * @method
   * @param {String} databaseName The MongoDB database name
   * @param {Object} [options] Additional options.
   * @return {DB} returns a DB instance representing a MongoDB database.
   */ db(databaseName, options = {
    }) {
        return new $9435886974ca760d$export$2e2bcd8739ae039(this.stitchClient, this.serviceName, databaseName);
    }
}
var $f3d238c9fb10527f$export$2e2bcd8739ae039 = $f3d238c9fb10527f$var$MongoDBService;



/**
 * Create a new TwilioService instance (not meant to be instantiated directly,
 * use `.service('twilio', '<service-name>')` on a {@link StitchClient} instance).
 *
 * @class
 * @return {TwilioService} a TwilioService instance.
 */ class $13e1dfc7fba53197$var$TwilioService {
    constructor(stitchClient, serviceName){
        this.client = stitchClient;
        this.serviceName = serviceName;
    }
    /**
   * Send a text message to a number
   *
   * @method
   * @param {String} from number to send from
   * @param {String} to number to send to
   * @param {String} body SMS body content
   * @return {Promise} which resolves to 'null' when message is sent successfully,
   *                   or is rejected when there is an error
   */ send(from, to, body) {
        return $0def88d1384b5b9e$export$f0b7529ba755d680(this, {
            action: 'send',
            args: {
                from: from,
                to: to,
                body: body
            }
        });
    }
}
var $13e1dfc7fba53197$export$2e2bcd8739ae039 = $13e1dfc7fba53197$var$TwilioService;


var $b74da312a367b811$export$2e2bcd8739ae039 = {
    'aws-s3': $7981134092bfd45b$export$2e2bcd8739ae039,
    'aws-ses': $f5ec7025a7ca60a9$export$2e2bcd8739ae039,
    'aws_s3': $7981134092bfd45b$export$2e2bcd8739ae039,
    'aws_ses': $f5ec7025a7ca60a9$export$2e2bcd8739ae039,
    'http': $06262552bb4e9767$export$2e2bcd8739ae039,
    'mongodb': $f3d238c9fb10527f$export$2e2bcd8739ae039,
    'twilio': $13e1dfc7fba53197$export$2e2bcd8739ae039
};






const $e992d7d7536bf526$export$11cb33cb3c138832 = 1;
const $e992d7d7536bf526$export$8815aa1d021a7d50 = 2;
const $e992d7d7536bf526$export$815b03eba529a08e = 3;
const $e992d7d7536bf526$export$b002d543d753c46c = 'public';
const $e992d7d7536bf526$export$c82af8024a84ed47 = 'private';
const $e992d7d7536bf526$export$78ef7a7f3635780c = 'client';
const $e992d7d7536bf526$export$6376c1682056142e = 'app';



const $d2cfa4d3af65293b$export$47fdd40111eda34c = ()=>typeof fetch === 'undefined' ? $9YOrT$nodefetch : fetch
;
class $d2cfa4d3af65293b$export$bcd553e5cdd70e04 {
    /**
   * @hideconstructor
   */ constructor(){
        throw new $6d165377d3770b7e$export$92aa0aa8f60e5a4f('StitchClient can only be made from the StitchClientFactory.create function');
    }
    /**
   * Creates a new {@link StitchClient}.
   *
   * @param {String} clientAppID the app ID of the Stitch application, which can be found in
   * the "Clients" page of the Stitch admin console.
   * @param {Object} [options = {}] additional options for creating the {@link StitchClient}.
   */ static create(clientAppID1, options1 = {
    }) {
        return $d2cfa4d3af65293b$export$dbabd6c62bf4518c($d2cfa4d3af65293b$export$47898e7fe20553f1.prototype, clientAppID1, options1);
    }
}
function $d2cfa4d3af65293b$export$dbabd6c62bf4518c(prototype, clientAppID, options = {
}) {
    let stitchClient = Object.create(prototype);
    let baseUrl = $da95daf8c95a7a82$export$15e777aff03fd23c;
    if (options.baseUrl) baseUrl = options.baseUrl;
    stitchClient.clientAppID = clientAppID;
    stitchClient.authUrl = clientAppID ? `${baseUrl}/api/client/v2.0/app/${clientAppID}/auth` : `${baseUrl}/api/admin/v3.0/auth`;
    stitchClient.rootURLsByAPIVersion = {
        [$e992d7d7536bf526$export$11cb33cb3c138832]: {
            [$e992d7d7536bf526$export$b002d543d753c46c]: `${baseUrl}/api/public/v1.0`,
            [$e992d7d7536bf526$export$78ef7a7f3635780c]: `${baseUrl}/api/client/v1.0`,
            [$e992d7d7536bf526$export$c82af8024a84ed47]: `${baseUrl}/api/private/v1.0`,
            [$e992d7d7536bf526$export$6376c1682056142e]: clientAppID ? `${baseUrl}/api/client/v1.0/app/${clientAppID}` : `${baseUrl}/api/public/v1.0`
        },
        [$e992d7d7536bf526$export$8815aa1d021a7d50]: {
            [$e992d7d7536bf526$export$b002d543d753c46c]: `${baseUrl}/api/public/v2.0`,
            [$e992d7d7536bf526$export$78ef7a7f3635780c]: `${baseUrl}/api/client/v2.0`,
            [$e992d7d7536bf526$export$c82af8024a84ed47]: `${baseUrl}/api/private/v2.0`,
            [$e992d7d7536bf526$export$6376c1682056142e]: clientAppID ? `${baseUrl}/api/client/v2.0/app/${clientAppID}` : `${baseUrl}/api/public/v2.0`
        },
        [$e992d7d7536bf526$export$815b03eba529a08e]: {
            [$e992d7d7536bf526$export$b002d543d753c46c]: `${baseUrl}/api/public/v3.0`,
            [$e992d7d7536bf526$export$78ef7a7f3635780c]: `${baseUrl}/api/client/v3.0`,
            [$e992d7d7536bf526$export$6376c1682056142e]: clientAppID ? `${baseUrl}/api/client/v3.0/app/${clientAppID}` : `${baseUrl}/api/admin/v3.0`
        }
    };
    const authOptions = {
        codec: $8eda865a3f59ae91$export$ef2912c5a4434709,
        storage: options.storage
    };
    if (options.storageType) authOptions.storageType = options.storageType;
    if (options.platform) authOptions.platform = options.platform;
    if (options.authCodec) authOptions.codec = options.authCodec;
    if (options.requestOrigin) authOptions.requestOrigin = options.requestOrigin;
    const authPromise = $9fd5db7e3909eb7f$export$a4b63a972049ab97.create(stitchClient, stitchClient.authUrl, authOptions);
    return authPromise.then((auth)=>{
        stitchClient.auth = auth;
        return Promise.all([
            stitchClient.auth.handleRedirect(),
            stitchClient.auth.handleCookie()
        ]);
    }).then(()=>stitchClient
    );
}
class $d2cfa4d3af65293b$export$47898e7fe20553f1 {
    /**
   * @hideconstructor
   */ constructor(){
        let classname = this.constructor.name;
        throw new $6d165377d3770b7e$export$92aa0aa8f60e5a4f(`${classname} can only be made from the ${classname}Factory.create function`);
    }
    get type() {
        return $da95daf8c95a7a82$export$347e6d9936c9829;
    }
    /**
   * Login to Stitch instance, optionally providing a username and password. In
   * the event that these are omitted, anonymous authentication is used.
   *
   * @param {String} [email] the email address used for login
   * @param {String} [password] the password for the provided email address
   * @param {Object} [options = {}] additional authentication options
   * @returns {Promise} which resolve to a String value: the authenticated user ID.
   */ login(email, password, options = {
    }) {
        if (email === undefined || password === undefined) return this.authenticate($7aeb857d9fc35f5f$export$a79c91b221bb4dea, options);
        return this.authenticate('userpass', Object.assign({
            username: email,
            password: password
        }, options));
    }
    /**
   * Send a request to the server indicating the provided email would like
   * to sign up for an account. This will trigger a confirmation email containing
   * a token which must be used with the `emailConfirm` method of the `userpass`
   * auth provider in order to complete registration. The user will not be able
   * to log in until that flow has been completed.
   *
   * @param {String} email the email used to sign up for the app
   * @param {String} password the password used to sign up for the app
   * @param {Object} [options = {}] additional authentication options
   * @returns {Promise}
   */ register(email1, password1, options2 = {
    }) {
        return this.auth.provider('userpass').register(email1, password1, options2);
    }
    /**
   * Links the currently logged in user with another identity.
   *
   * @param {String} providerType the provider of the other identity (e.g. 'userpass', 'facebook', 'google')
   * @param {Object} [options = {}] additional authentication options
   * @returns {Promise} which resolves to a String value: the original user ID
   */ linkWithProvider(providerType, options3 = {
    }) {
        if (!this.isAuthenticated()) throw new $6d165377d3770b7e$export$92aa0aa8f60e5a4f('Must be authenticated to link an account');
        return this.auth.provider(providerType).authenticate(options3, true).then(()=>this.authedId()
        );
    }
    /**
   * Submits an authentication request to the specified provider providing any
   * included options (read: user data).  If auth data already exists and the
   * existing auth data has an access token, then these credentials are returned.
   *
   * @param {String} providerType the provider used for authentication (The possible
   *                 options are 'anon', 'userpass', 'custom', 'facebook', 'google',
   *                 and 'apiKey')
   * @param {Object} [options = {}] additional authentication options
   * @returns {Promise} which resolves to a String value: the authenticated user ID
   */ authenticate(providerType1, options4 = {
    }) {
        // reuse existing auth if present
        const authenticateFn = ()=>this.auth.provider(providerType1).authenticate(options4).then(()=>this.authedId()
            )
        ;
        if (this.isAuthenticated()) {
            if (providerType1 === $7aeb857d9fc35f5f$export$a79c91b221bb4dea && this.auth.getLoggedInProviderType() === $7aeb857d9fc35f5f$export$a79c91b221bb4dea) return Promise.resolve(this.auth.authedId); // is authenticated, skip log in
            return this.logout().then(()=>authenticateFn()
            ); // will not be authenticated, continue log in
        }
        // is not authenticated, continue log in
        return authenticateFn();
    }
    /**
   * Ends the session for the current user, and clears auth information from storage.
   *
   * @returns {Promise}
   */ logout() {
        return this._do('/auth/session', 'DELETE', {
            refreshOnFailure: false,
            useRefreshToken: true,
            rootURL: this.rootURLsByAPIVersion[$e992d7d7536bf526$export$8815aa1d021a7d50][$e992d7d7536bf526$export$78ef7a7f3635780c]
        }).then(()=>this.auth.clear()
        , ()=>this.auth.clear()
        );
    }
    /**
   * @returns {*} Returns any error from the Stitch authentication system.
   */ authError() {
        return this.auth.error();
    }
    /**
   * Returns profile information for the currently logged in user.
   *
   * @returns {Promise} which resolves to a a JSON object containing user profile information.
   */ userProfile() {
        return this._do('/auth/profile', 'GET', {
            rootURL: this.rootURLsByAPIVersion[$e992d7d7536bf526$export$8815aa1d021a7d50][$e992d7d7536bf526$export$78ef7a7f3635780c]
        }).then((response)=>response.json()
        );
    }
    /**
   * @returns {Boolean} whether or not the current client is authenticated.
   */ isAuthenticated() {
        return !!this.authedId();
    }
    /**
   *  @returns {String} a string of the currently authenticated user's ID.
   */ authedId() {
        return this.auth.authedId;
    }
    /**
   * Factory method for accessing Stitch services.
   *
   * @method
   * @param {String} type the service type (e.g. "mongodb", "aws-s3", "aws-ses", "twilio", "http", etc.)
   * @param {String} name the service name specified in the Stitch admin console.
   * @returns {Object} returns an instance of the specified service type.
   */ service(type, name) {
        if (this.constructor !== $d2cfa4d3af65293b$export$47898e7fe20553f1) throw new $6d165377d3770b7e$export$92aa0aa8f60e5a4f('`service` is a factory method, do not use `new`');
        if (!$b74da312a367b811$export$2e2bcd8739ae039.hasOwnProperty(type)) throw new $6d165377d3770b7e$export$92aa0aa8f60e5a4f('Invalid service type specified: ' + type);
        const ServiceType = $b74da312a367b811$export$2e2bcd8739ae039[type];
        return new ServiceType(this, name);
    }
    /**
   * Executes a function.
   *
   * @param {String} name The name of the function.
   * @param {...*} args Arguments to pass to the function.
   */ executeFunction(name1, ...args) {
        return this._doFunctionCall({
            name: name1,
            arguments: args
        });
    }
    /**
   * Executes a service function.
   *
   * @param {String} service The name of the service.
   * @param {String} action The name of the service action.
   * @param {...*} args Arguments to pass to the service action.
   */ executeServiceFunction(service, action, ...args1) {
        return this._doFunctionCall({
            service: service,
            name: action,
            arguments: args1
        });
    }
    _doFunctionCall(request) {
        let responseDecoder = (d)=>$9YOrT$bson.EJSON.parse(d, {
                relaxed: true
            })
        ;
        let responseEncoder = (d)=>$9YOrT$bson.EJSON.stringify(d, {
                strict: true
            })
        ;
        return this._do('/functions/call', 'POST', {
            body: responseEncoder(request)
        }).then((response)=>response.text()
        ).then((body)=>responseDecoder(body)
        );
    }
    /**
   * Returns an access token for the user
   *
   * @private
   * @returns {Promise}
   */ doSessionPost() {
        return this._do('/auth/session', 'POST', {
            refreshOnFailure: false,
            useRefreshToken: true,
            rootURL: this.rootURLsByAPIVersion[$e992d7d7536bf526$export$8815aa1d021a7d50][$e992d7d7536bf526$export$78ef7a7f3635780c]
        }).then((response)=>response.json()
        );
    }
    /**
   * Returns the user API keys associated with the current user.
   *
   * @returns {Promise} which resolves to an array of API key objects
   */ getApiKeys() {
        return this._do('/auth/api_keys', 'GET', {
            rootURL: this.rootURLsByAPIVersion[$e992d7d7536bf526$export$8815aa1d021a7d50][$e992d7d7536bf526$export$78ef7a7f3635780c],
            useRefreshToken: true
        }).then((response)=>response.json()
        );
    }
    /**
   * Creates a user API key that can be used to authenticate as the current user.
   *
   * @param {String} userApiKeyName a unique name for the user API key
   * @returns {Promise} which resolves to an API key object containing the API key value
   */ createApiKey(userApiKeyName) {
        return this._do('/auth/api_keys', 'POST', {
            rootURL: this.rootURLsByAPIVersion[$e992d7d7536bf526$export$8815aa1d021a7d50][$e992d7d7536bf526$export$78ef7a7f3635780c],
            useRefreshToken: true,
            body: JSON.stringify({
                name: userApiKeyName
            })
        }).then((response)=>response.json()
        );
    }
    /**
   * Returns a user API key associated with the current user.
   *
   * @param {String} keyID the ID of the key to fetch
   * @returns {Promise} which resolves to an API key object, although the API key value will be omitted
   */ getApiKeyByID(keyID) {
        return this._do(`/auth/api_keys/${keyID}`, 'GET', {
            rootURL: this.rootURLsByAPIVersion[$e992d7d7536bf526$export$8815aa1d021a7d50][$e992d7d7536bf526$export$78ef7a7f3635780c],
            useRefreshToken: true
        }).then((response)=>response.json()
        );
    }
    /**
   * Deletes a user API key associated with the current user.
   *
   * @param {String} keyID the ID of the key to delete
   * @returns {Promise}
   */ deleteApiKeyByID(keyID1) {
        return this._do(`/auth/api_keys/${keyID1}`, 'DELETE', {
            rootURL: this.rootURLsByAPIVersion[$e992d7d7536bf526$export$8815aa1d021a7d50][$e992d7d7536bf526$export$78ef7a7f3635780c],
            useRefreshToken: true
        });
    }
    /**
   * Enables a user API key associated with the current user.
   *
   * @param {String} keyID the ID of the key to enable
   * @returns {Promise}
   */ enableApiKeyByID(keyID2) {
        return this._do(`/auth/api_keys/${keyID2}/enable`, 'PUT', {
            rootURL: this.rootURLsByAPIVersion[$e992d7d7536bf526$export$8815aa1d021a7d50][$e992d7d7536bf526$export$78ef7a7f3635780c],
            useRefreshToken: true
        });
    }
    /**
   * Disables a user API key associated with the current user.
   *
   * @param {String} keyID the ID of the key to disable
   * @returns {Promise}
   */ disableApiKeyByID(keyID3) {
        return this._do(`/auth/api_keys/${keyID3}/disable`, 'PUT', {
            rootURL: this.rootURLsByAPIVersion[$e992d7d7536bf526$export$8815aa1d021a7d50][$e992d7d7536bf526$export$78ef7a7f3635780c],
            useRefreshToken: true
        });
    }
    _fetch(url, fetchArgs, resource, method, options5) {
        const doFetch = $d2cfa4d3af65293b$export$47fdd40111eda34c();
        return doFetch(url, fetchArgs).then((response)=>{
            // Okay: passthrough
            if (response.status >= 200 && response.status < 300) return Promise.resolve(response);
            if (response.headers.get('Content-Type') === $da95daf8c95a7a82$export$ad106c78fd3b6e6) return response.json().then((json)=>{
                // Only want to try refreshing token when there's an invalid session
                if ('error_code' in json && json.error_code === $6d165377d3770b7e$export$604c120584438724) {
                    if (!options5.refreshOnFailure) return this.auth.clear().then(()=>{
                        const error = new $6d165377d3770b7e$export$92aa0aa8f60e5a4f(json.error, json.error_code);
                        error.response = response;
                        error.json = json;
                        throw error;
                    });
                    return this.auth.refreshToken().then(()=>{
                        options5.refreshOnFailure = false;
                        return this._do(resource, method, options5);
                    });
                }
                const error2 = new $6d165377d3770b7e$export$92aa0aa8f60e5a4f(json.error, json.error_code);
                error2.response = response;
                error2.json = json;
                return Promise.reject(error2);
            });
            const error1 = new Error(response.statusText);
            error1.response = response;
            return Promise.reject(error1);
        });
    }
    _fetchArgs(resource1, method1, options6) {
        const appURL = this.rootURLsByAPIVersion[options6.apiVersion][options6.apiType];
        let url = `${appURL}${resource1}`;
        if (options6.rootURL) url = `${options6.rootURL}${resource1}`;
        let fetchArgs = $da95daf8c95a7a82$export$f269dc256bdbf2f8(method1, options6.body, options6);
        if (!!options6.headers) Object.assign(fetchArgs.headers, options6.headers);
        if (options6.queryParams) url = `${url}?${($parcel$interopDefault($9YOrT$querystring)).stringify(options6.queryParams)}`;
        if (options6.multipart) // fall-back on browser to generate Content-Type for us based on request body (FormData)
        delete fetchArgs.headers['Content-Type'];
        return {
            url: url,
            fetchArgs: fetchArgs
        };
    }
    _do(resource2, method2, options7) {
        options7 = Object.assign({
        }, {
            refreshOnFailure: true,
            useRefreshToken: false,
            apiVersion: $e992d7d7536bf526$export$8815aa1d021a7d50,
            apiType: $e992d7d7536bf526$export$6376c1682056142e,
            rootURL: undefined
        }, options7);
        let { url: url , fetchArgs: fetchArgs  } = this._fetchArgs(resource2, method2, options7);
        if (options7.noAuth) return this._fetch(url, fetchArgs, resource2, method2, options7);
        if (!this.isAuthenticated()) return Promise.reject(new $6d165377d3770b7e$export$92aa0aa8f60e5a4f('Must auth first', $6d165377d3770b7e$export$14a25834bf5fa686));
        if (this.auth.requestOrigin) fetchArgs.headers['X-BAAS-Request-Origin'] = this.auth.requestOrigin;
        const token = options7.useRefreshToken ? this.auth.getRefreshToken() : this.auth.getAccessToken();
        fetchArgs.headers.Authorization = `Bearer ${token}`;
        return this._fetch(url, fetchArgs, resource2, method2, options7);
    }
}








class $6f16075a09f08c90$export$1cc308f04deaa7a1 {
    constructor(){
        throw new $6d165377d3770b7e$export$92aa0aa8f60e5a4f('StitchAdminClient can only be made from the StitchAdminClientFactory.create function');
    }
    static create(baseUrl, options1 = {
        requestOrigin: undefined
    }) {
        return $d2cfa4d3af65293b$export$dbabd6c62bf4518c($6f16075a09f08c90$export$e69c78fea39cbf6c.prototype, '', {
            requestOrigin: options1.requestOrigin,
            baseUrl: baseUrl,
            authCodec: $8eda865a3f59ae91$export$790cb3fe07c4778b
        });
    }
}
class $6f16075a09f08c90$export$e69c78fea39cbf6c extends $d2cfa4d3af65293b$export$47898e7fe20553f1 {
    constructor(){
        super();
    }
    get type() {
        return $da95daf8c95a7a82$export$7ca39f6d0f92b2ab;
    }
    get _v1() {
        const privateV1do = (url, method, options)=>super._do(url, method, Object.assign({
                apiVersion: $e992d7d7536bf526$export$11cb33cb3c138832,
                apiType: $e992d7d7536bf526$export$c82af8024a84ed47
            }, options)).then((response)=>{
                const contentHeader = response.headers.get('content-type') || '';
                if (contentHeader.split(',').indexOf('application/json') >= 0) return response.json();
                return response;
            })
        ;
        return {
            [$e992d7d7536bf526$export$c82af8024a84ed47]: {
                _get: (url, queryParams, headers, options)=>privateV1do(url, 'GET', Object.assign({
                        queryParams: queryParams,
                        headers: headers
                    }, options))
                ,
                _post: (url, body, options = {
                })=>privateV1do(url, 'POST', Object.assign({
                        body: body
                    }, options))
            }
        };
    }
    get _v3() {
        const v3do = (url, method, options)=>super._do(url, method, Object.assign({
            }, {
                apiVersion: $e992d7d7536bf526$export$815b03eba529a08e
            }, options)).then((response)=>{
                const contentHeader = response.headers.get('content-type') || '';
                if (contentHeader.split(',').indexOf('application/json') >= 0) return response.json();
                return response;
            })
        ;
        return {
            _get: (url, queryParams, headers, options)=>v3do(url, 'GET', Object.assign({
                }, {
                    queryParams: queryParams,
                    headers: headers
                }, options))
            ,
            _put: (url, options)=>options ? v3do(url, 'PUT', options) : v3do(url, 'PUT')
            ,
            _patch: (url, options)=>options ? v3do(url, 'PATCH', options) : v3do(url, 'PATCH')
            ,
            _delete: (url, queryParams)=>queryParams ? v3do(url, 'DELETE', {
                    queryParams: queryParams
                }) : v3do(url, 'DELETE')
            ,
            _post: (url, body, queryParams)=>queryParams ? v3do(url, 'POST', {
                    body: JSON.stringify(body),
                    queryParams: queryParams
                }) : v3do(url, 'POST', {
                    body: JSON.stringify(body)
                })
            ,
            _postRaw: (url, options)=>v3do(url, 'POST', options)
        };
    }
    /**
   * Verifies a recaptcha token.
   *
   * @returns {Promise}
   */ verifyRecaptcha(token) {
        return this._v1.private._post('/spa/recaptcha/verify', new URLSearchParams(`response=${token}`), {
            credentials: 'include',
            multipart: true,
            noAuth: true
        });
    }
    /**
   * Ends the session for the current user.
   *
   * @returns {Promise}
   */ logout() {
        return super._do('/auth/session', 'DELETE', {
            refreshOnFailure: false,
            useRefreshToken: true,
            apiVersion: $e992d7d7536bf526$export$815b03eba529a08e
        }).then(()=>this.auth.clear()
        );
    }
    /**
   * Returns profile information for the currently logged in user
   *
   * @returns {Promise}
   */ userProfile() {
        return this._v3._get('/auth/profile');
    }
    /**
   * Returns available providers for the currently logged in admin
   *
   * @returns {Promise}
   */ getAuthProviders() {
        return super._do('/auth/providers', 'GET', {
            noAuth: true,
            apiVersion: $e992d7d7536bf526$export$815b03eba529a08e
        }).then((response)=>response.json()
        );
    }
    /**
   * Returns an access token for the user
   *
   * @returns {Promise}
   */ doSessionPost() {
        return super._do('/auth/session', 'POST', {
            refreshOnFailure: false,
            useRefreshToken: true,
            apiVersion: $e992d7d7536bf526$export$815b03eba529a08e
        }).then((response)=>response.json()
        );
    }
    /* Examples of how to access admin API with this client:
   *
   * List all apps
   *    a.apps('580e6d055b199c221fcb821c').list()
   *
   * Fetch app under name 'planner'
   *    a.apps('580e6d055b199c221fcb821c').app('planner').get()
   *
   * List services under the app 'planner'
   *    a.apps('580e6d055b199c221fcb821c').app('planner').services().list()
   *
   * Delete a rule by ID
   *    a.apps('580e6d055b199c221fcb821c').app('planner').services().service('mdb1').rules().rule('580e6d055b199c221fcb821d').remove()
   *
   */ apps(groupId) {
        const api = this._v3;
        const groupUrl = `/groups/${groupId}/apps`;
        return {
            list: (filter)=>api._get(groupUrl, filter)
            ,
            create: (data, options)=>{
                let query = options && options.product ? `?product=${options.product}` : '';
                return api._post(groupUrl + query, data);
            },
            measurements: (filter)=>api._get(`/groups/${groupId}/measurements`, filter)
            ,
            app: (appId)=>{
                const appUrl = `${groupUrl}/${appId}`;
                return {
                    get: ()=>api._get(appUrl)
                    ,
                    remove: ()=>api._delete(appUrl)
                    ,
                    export: ()=>api._get(`${appUrl}/export`, {
                            version: '20200603'
                        }, {
                            Accept: 'application/zip'
                        })
                    ,
                    measurements: (filter)=>api._get(`${appUrl}/measurements`, filter)
                    ,
                    commands: ()=>({
                            run: (command, data)=>api._post(`${appUrl}/commands/${command}`, data)
                        })
                    ,
                    dependencies: ()=>({
                            list: ()=>api._get(`${appUrl}/dependencies`)
                            ,
                            upload: (filename, body)=>{
                                const form = new ($parcel$interopDefault($9YOrT$formdata))();
                                form.append('file', body, filename);
                                return api._postRaw(`${appUrl}/dependencies`, {
                                    body: form,
                                    multipart: true
                                });
                            }
                        })
                    ,
                    values: ()=>({
                            list: ()=>api._get(`${appUrl}/values`)
                            ,
                            create: (data)=>api._post(`${appUrl}/values`, data)
                            ,
                            value: (valueId)=>{
                                const valueUrl = `${appUrl}/values/${valueId}`;
                                return {
                                    get: ()=>api._get(valueUrl)
                                    ,
                                    remove: ()=>api._delete(valueUrl)
                                    ,
                                    update: (data)=>api._put(valueUrl, {
                                            body: JSON.stringify(data)
                                        })
                                };
                            }
                        })
                    ,
                    secrets: ()=>({
                            list: ()=>api._get(`${appUrl}/secrets`)
                            ,
                            create: (data)=>api._post(`${appUrl}/secrets`, data)
                            ,
                            secret: (secretId)=>{
                                const secretUrl = `${appUrl}/secrets/${secretId}`;
                                return {
                                    remove: ()=>api._delete(secretUrl)
                                    ,
                                    update: (data)=>api._put(secretUrl, {
                                            body: JSON.stringify(data)
                                        })
                                };
                            }
                        })
                    ,
                    hosting: ()=>({
                            config: ()=>({
                                    get: ()=>api._get(`${appUrl}/hosting/config`)
                                    ,
                                    patch: (config)=>api._patch(`${appUrl}/hosting/config`, {
                                            body: JSON.stringify(config)
                                        })
                                })
                            ,
                            cache: ()=>({
                                    invalidate: (path)=>api._put(`${appUrl}/hosting/cache`, {
                                            body: JSON.stringify({
                                                invalidate: true,
                                                path: path
                                            })
                                        })
                                })
                            ,
                            assets: ()=>({
                                    createDirectory: (folderName)=>api._put(`${appUrl}/hosting/assets/asset`, {
                                            body: JSON.stringify({
                                                path: `${folderName}/`
                                            })
                                        })
                                    ,
                                    list: (params)=>api._get(`${appUrl}/hosting/assets`, params)
                                    ,
                                    upload: (metadata, body)=>{
                                        const form = new ($parcel$interopDefault($9YOrT$formdata))();
                                        form.append('meta', metadata);
                                        form.append('file', body);
                                        return api._put(`${appUrl}/hosting/assets/asset`, {
                                            body: form,
                                            multipart: true
                                        });
                                    },
                                    post: (data)=>api._post(`${appUrl}/hosting/assets`, data)
                                    ,
                                    asset: ()=>({
                                            patch: (options)=>api._patch(`${appUrl}/hosting/assets/asset`, {
                                                    body: JSON.stringify({
                                                        attributes: options.attributes
                                                    }),
                                                    queryParams: {
                                                        path: options.path
                                                    }
                                                })
                                            ,
                                            get: (params)=>api._get(`${appUrl}/hosting/assets/asset`, params)
                                            ,
                                            delete: (params)=>api._delete(`${appUrl}/hosting/assets/asset`, params)
                                        })
                                })
                        })
                    ,
                    deploy: ()=>({
                            auth: ()=>({
                                    github: ()=>api._get(`${appUrl}/deploy/github/auth`, undefined, undefined, {
                                            credentials: 'include'
                                        })
                                })
                            ,
                            config: ()=>api._get(`${appUrl}/deploy/config`)
                            ,
                            deployments: ()=>({
                                    list: (filter)=>api._get(`${appUrl}/deployments`, filter)
                                    ,
                                    get: (commit)=>api._get(`${appUrl}/deployments/${commit}`)
                                })
                            ,
                            installation: ()=>api._get(`${appUrl}/deploy/installation`)
                            ,
                            repositories: ()=>({
                                    repository: (repoId)=>({
                                            github: ()=>({
                                                    branches: ()=>({
                                                            list: ()=>api._get(`${appUrl}/deploy/github/repositories/${repoId}/branches`)
                                                        })
                                                })
                                        })
                                })
                            ,
                            updateConfig: (config)=>api._patch(`${appUrl}/deploy/config`, {
                                    body: JSON.stringify(config)
                                })
                            ,
                            overwriteConfig: (config)=>api._put(`${appUrl}/deploy/config`, {
                                    body: JSON.stringify(config)
                                })
                        })
                    ,
                    drafts: ()=>({
                            get: (draftId)=>api._get(`${appUrl}/drafts/${draftId}`)
                            ,
                            list: ()=>api._get(`${appUrl}/drafts`)
                            ,
                            create: ()=>api._post(`${appUrl}/drafts`)
                            ,
                            delete: (draftId)=>api._delete(`${appUrl}/drafts/${draftId}`)
                            ,
                            deploy: (draftId, params)=>api._post(`${appUrl}/drafts/${draftId}/deployment`, null, params)
                            ,
                            diff: (draftId)=>api._get(`${appUrl}/drafts/${draftId}/diff`)
                        })
                    ,
                    services: ()=>({
                            list: ()=>api._get(`${appUrl}/services`)
                            ,
                            create: (data)=>api._post(`${appUrl}/services`, data)
                            ,
                            service: (serviceId)=>({
                                    get: ()=>api._get(`${appUrl}/services/${serviceId}`)
                                    ,
                                    remove: (params)=>api._delete(`${appUrl}/services/${serviceId}`, params)
                                    ,
                                    update: (data)=>api._patch(`${appUrl}/services/${serviceId}`, {
                                            body: JSON.stringify(data)
                                        })
                                    ,
                                    runCommand: (commandName, data)=>api._post(`${appUrl}/services/${serviceId}/commands/${commandName}`, data)
                                    ,
                                    config: ()=>({
                                            get: (params)=>api._get(`${appUrl}/services/${serviceId}/config`, params)
                                            ,
                                            update: (data)=>api._patch(`${appUrl}/services/${serviceId}/config`, {
                                                    body: JSON.stringify(data)
                                                })
                                        })
                                    ,
                                    rules: ()=>({
                                            list: ()=>api._get(`${appUrl}/services/${serviceId}/rules`)
                                            ,
                                            create: (data, params)=>api._post(`${appUrl}/services/${serviceId}/rules`, data, params)
                                            ,
                                            rule: (ruleId)=>{
                                                const ruleUrl = `${appUrl}/services/${serviceId}/rules/${ruleId}`;
                                                return {
                                                    get: ()=>api._get(ruleUrl)
                                                    ,
                                                    update: (data, params)=>api._put(ruleUrl, {
                                                            body: JSON.stringify(data),
                                                            queryParams: params
                                                        })
                                                    ,
                                                    remove: (params)=>api._delete(ruleUrl, params)
                                                };
                                            }
                                        })
                                    ,
                                    incomingWebhooks: ()=>({
                                            list: ()=>api._get(`${appUrl}/services/${serviceId}/incoming_webhooks`)
                                            ,
                                            create: (data)=>api._post(`${appUrl}/services/${serviceId}/incoming_webhooks`, data)
                                            ,
                                            incomingWebhook: (incomingWebhookId)=>{
                                                const webhookUrl = `${appUrl}/services/${serviceId}/incoming_webhooks/${incomingWebhookId}`;
                                                return {
                                                    get: ()=>api._get(webhookUrl)
                                                    ,
                                                    update: (data)=>api._put(webhookUrl, {
                                                            body: JSON.stringify(data)
                                                        })
                                                    ,
                                                    remove: ()=>api._delete(webhookUrl)
                                                };
                                            }
                                        })
                                })
                        })
                    ,
                    pushNotifications: ()=>({
                            list: (filter)=>api._get(`${appUrl}/push/notifications`, filter)
                            ,
                            create: (data)=>api._post(`${appUrl}/push/notifications`, data)
                            ,
                            pushNotification: (messageId)=>({
                                    get: ()=>api._get(`${appUrl}/push/notifications/${messageId}`)
                                    ,
                                    update: (data)=>api._put(`${appUrl}/push/notifications/${messageId}`, {
                                            body: JSON.stringify(data)
                                        })
                                    ,
                                    remove: ()=>api._delete(`${appUrl}/push/notifications/${messageId}`)
                                    ,
                                    send: ()=>api._post(`${appUrl}/push/notifications/${messageId}/send`)
                                })
                        })
                    ,
                    users: ()=>({
                            count: ()=>api._get(`${appUrl}/users_count`)
                            ,
                            list: (filter)=>api._get(`${appUrl}/users`, filter)
                            ,
                            create: (user)=>api._post(`${appUrl}/users`, user)
                            ,
                            user: (uid)=>({
                                    get: ()=>api._get(`${appUrl}/users/${uid}`)
                                    ,
                                    devices: ()=>({
                                            get: ()=>api._get(`${appUrl}/users/${uid}/devices`)
                                        })
                                    ,
                                    logout: ()=>api._put(`${appUrl}/users/${uid}/logout`)
                                    ,
                                    enable: ()=>api._put(`${appUrl}/users/${uid}/enable`)
                                    ,
                                    disable: ()=>api._put(`${appUrl}/users/${uid}/disable`)
                                    ,
                                    remove: ()=>api._delete(`${appUrl}/users/${uid}`)
                                })
                        })
                    ,
                    userRegistrations: ()=>({
                            sendConfirmationEmail: (email)=>api._post(`${appUrl}/user_registrations/by_email/${email}/send_confirm`)
                            ,
                            runUserConfirmation: (email)=>api._post(`${appUrl}/user_registrations/by_email/${email}/run_confirm`)
                            ,
                            confirmByEmail: (email)=>api._post(`${appUrl}/user_registrations/by_email/${email}/confirm`)
                            ,
                            listPending: (filter)=>api._get(`${appUrl}/user_registrations/pending_users`, filter)
                            ,
                            removePendingUserByEmail: (email)=>api._delete(`${appUrl}/user_registrations/by_email/${email}`)
                            ,
                            removePendingUserByID: (id)=>api._delete(`${appUrl}/user_registrations/by_id/${id}`)
                        })
                    ,
                    customUserData: ()=>({
                            get: ()=>api._get(`${appUrl}/custom_user_data`)
                            ,
                            update: (data)=>api._patch(`${appUrl}/custom_user_data`, {
                                    body: JSON.stringify(data)
                                })
                        })
                    ,
                    debug: ()=>({
                            executeFunction: (userId, name = '', ...args)=>{
                                return api._post(`${appUrl}/debug/execute_function`, {
                                    name: name,
                                    arguments: args
                                }, {
                                    user_id: userId
                                });
                            },
                            executeFunctionSource: ({ userId: userId , source: source = '' , evalSource: evalSource = '' , runAsSystem: runAsSystem  })=>{
                                return api._post(`${appUrl}/debug/execute_function_source`, {
                                    source: source,
                                    eval_source: evalSource
                                }, {
                                    user_id: userId,
                                    run_as_system: runAsSystem
                                });
                            }
                        })
                    ,
                    authProviders: ()=>({
                            list: ()=>api._get(`${appUrl}/auth_providers`)
                            ,
                            create: (data)=>api._post(`${appUrl}/auth_providers`, data)
                            ,
                            authProvider: (providerId)=>({
                                    get: ()=>api._get(`${appUrl}/auth_providers/${providerId}`)
                                    ,
                                    update: (data)=>api._patch(`${appUrl}/auth_providers/${providerId}`, {
                                            body: JSON.stringify(data)
                                        })
                                    ,
                                    enable: ()=>api._put(`${appUrl}/auth_providers/${providerId}/enable`)
                                    ,
                                    disable: ()=>api._put(`${appUrl}/auth_providers/${providerId}/disable`)
                                    ,
                                    remove: ()=>api._delete(`${appUrl}/auth_providers/${providerId}`)
                                })
                        })
                    ,
                    security: ()=>({
                            allowedRequestOrigins: ()=>({
                                    get: ()=>api._get(`${appUrl}/security/allowed_request_origins`)
                                    ,
                                    update: (data)=>api._post(`${appUrl}/security/allowed_request_origins`, data)
                                })
                        })
                    ,
                    logs: ()=>({
                            list: (filter)=>api._get(`${appUrl}/logs`, filter)
                        })
                    ,
                    apiKeys: ()=>({
                            list: ()=>api._get(`${appUrl}/api_keys`)
                            ,
                            create: (data)=>api._post(`${appUrl}/api_keys`, data)
                            ,
                            apiKey: (apiKeyId)=>({
                                    get: ()=>api._get(`${appUrl}/api_keys/${apiKeyId}`)
                                    ,
                                    remove: ()=>api._delete(`${appUrl}/api_keys/${apiKeyId}`)
                                    ,
                                    enable: ()=>api._put(`${appUrl}/api_keys/${apiKeyId}/enable`)
                                    ,
                                    disable: ()=>api._put(`${appUrl}/api_keys/${apiKeyId}/disable`)
                                })
                        })
                    ,
                    functions: ()=>({
                            list: ()=>api._get(`${appUrl}/functions`)
                            ,
                            create: (data)=>api._post(`${appUrl}/functions`, data)
                            ,
                            function: (functionId)=>({
                                    get: ()=>api._get(`${appUrl}/functions/${functionId}`)
                                    ,
                                    update: (data)=>api._put(`${appUrl}/functions/${functionId}`, {
                                            body: JSON.stringify(data)
                                        })
                                    ,
                                    remove: ()=>api._delete(`${appUrl}/functions/${functionId}`)
                                })
                        })
                    ,
                    eventSubscriptions: ()=>({
                            list: (filter)=>api._get(`${appUrl}/event_subscriptions`, filter)
                            ,
                            create: (data)=>api._post(`${appUrl}/event_subscriptions`, data)
                            ,
                            eventSubscription: (eventSubscriptionId)=>({
                                    get: ()=>api._get(`${appUrl}/event_subscriptions/${eventSubscriptionId}`)
                                    ,
                                    update: (data)=>api._put(`${appUrl}/event_subscriptions/${eventSubscriptionId}`, {
                                            body: JSON.stringify(data)
                                        })
                                    ,
                                    remove: ()=>api._delete(`${appUrl}/event_subscriptions/${eventSubscriptionId}`)
                                    ,
                                    resume: (data)=>api._put(`${appUrl}/event_subscriptions/${eventSubscriptionId}/resume`, {
                                            body: JSON.stringify(data)
                                        })
                                })
                        })
                    ,
                    validationSettings: ()=>{
                        const validationSettingsUrl = `${appUrl}/validation_settings`;
                        return {
                            graphql: ()=>{
                                const graphqlUrl = `${validationSettingsUrl}/graphql`;
                                return {
                                    get: ()=>api._get(graphqlUrl)
                                    ,
                                    update: (data)=>api._put(graphqlUrl, {
                                            body: JSON.stringify(data)
                                        })
                                };
                            }
                        };
                    },
                    graphql: ()=>{
                        const graphqlUrl = `${appUrl}/graphql`;
                        return {
                            config: ()=>({
                                    get: ()=>api._get(`${graphqlUrl}/config`)
                                    ,
                                    update: (data)=>api._put(`${graphqlUrl}/config`, {
                                            body: JSON.stringify(data)
                                        })
                                })
                            ,
                            post: (data)=>api._post(`${graphqlUrl}`, data)
                            ,
                            validate: ()=>api._get(`${graphqlUrl}/validate`)
                            ,
                            customResolvers: ()=>({
                                    list: ()=>api._get(`${graphqlUrl}/custom_resolvers`)
                                    ,
                                    create: (data)=>api._post(`${graphqlUrl}/custom_resolvers`, data)
                                    ,
                                    customResolver: (id)=>({
                                            get: ()=>api._get(`${graphqlUrl}/custom_resolvers/${id}`)
                                            ,
                                            update: (data)=>api._put(`${graphqlUrl}/custom_resolvers/${id}`, {
                                                    body: JSON.stringify(data)
                                                })
                                            ,
                                            remove: ()=>api._delete(`${graphqlUrl}/custom_resolvers/${id}`)
                                        })
                                })
                        };
                    },
                    sync: ()=>{
                        const syncUrl = `${appUrl}/sync`;
                        return {
                            config: ()=>{
                                const realmConfigUrl = `${syncUrl}/config`;
                                return {
                                    get: ()=>api._get(realmConfigUrl)
                                    ,
                                    update: (data)=>api._put(realmConfigUrl, {
                                            body: JSON.stringify(data)
                                        })
                                };
                            },
                            clientSchemas: ()=>{
                                const realmClientSchemasUrl = `${syncUrl}/client_schemas`;
                                return {
                                    get: (language, filter)=>api._get(`${realmClientSchemasUrl}/${language}`, filter)
                                };
                            },
                            data: (params = {
                            })=>api._get(`${syncUrl}/data`, params)
                            ,
                            patchSchemas: (data)=>api._patch(`${syncUrl}/schemas`, {
                                    body: JSON.stringify(data)
                                })
                            ,
                            progress: ()=>api._get(`${syncUrl}/progress`)
                        };
                    }
                };
            }
        };
    }
    /**
   * Manages an Atlas Cluster.
   *
   * @returns {Object}
   */ privateClusters(groupId1, appId) {
        const privateApi = this._v1[$e992d7d7536bf526$export$c82af8024a84ed47];
        const baseUrl = `/groups/${groupId1}/apps/${appId}/atlas_clusters`;
        return {
            create: (regionName)=>privateApi._post(baseUrl, JSON.stringify({
                    region_name: regionName
                }), {
                    credentials: 'include'
                })
        };
    }
    /**
   * Manages Atlas temporary API keys.
   *
   * @returns {Object}
   */ privateTempAPIKeys() {
        const privateApi = this._v1[$e992d7d7536bf526$export$c82af8024a84ed47];
        const baseUrl = '/auth/temp_api_keys';
        return {
            create: (desc)=>privateApi._post(baseUrl, JSON.stringify({
                    desc: desc
                }))
        };
    }
}





//# sourceMappingURL=index.js.map
