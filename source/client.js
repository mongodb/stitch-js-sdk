import cookie from 'cookie_js'
import 'whatwg-fetch' // fetch polyfill

const USER_AUTH_KEY = "_baas_ua";
const REFRESH_TOKEN_KEY = "_baas_rt";
const STATE_KEY = "_baas_state";

export const ErrAuthProviderNotFound = "AuthProviderNotFound"
export const ErrInvalidSession = 'InvalidSession'
const stateLength = 64

function toQueryString(obj) {
    var parts = [];
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
            parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
        }
    }
    return parts.join("&");
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    var error = new Error(response.statusText)
    error.response = response
    throw error
  }
}

export class BaasError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'BaasError'
    this.message = message; 
    if(code !== undefined){
      this.code = code;
    }
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else { 
      this.stack = (new Error(message)).stack; 
    }
  }
}

export class BaasClient {
  constructor(baseUrl, app) {
    this.appUrl = baseUrl;
    if (app) {
      this.appUrl = `${this.appUrl}/v1/app/${app}`
    }
    this.authUrl = `${this.appUrl}/auth`
    this.checkRedirectResponse();
  }

  authWithLocal(username, password, cors){
    let headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');

    let init = {
      method: "POST",
      body: JSON.stringify({"username": username, "password": password}),
      headers: headers
    };

    if (cors) {
      init['cors'] = cors;
    }

    return fetch(`${this.authUrl}/local/userpass`, init)
      .then(checkStatus)
      .then((response)=>{
        return response.json().then((json) => {
          this._setAuth(json);
          Promise.resolve();
        })
      })
  }

  // The state we generate is to be used for any kind of request where we will
  // complete an authentication flow via a redirect. We store the generate in 
  // a local storage bound to the app's origin. This ensures that any time we
  // receive a redirect, there must be a state parameter and it must match
  // what we ourselves have generated. This state MUST only be sent to
  // a trusted BaaS endpoint in order to preserve its integrity. BaaS will
  // store it in some way on its origin (currently a cookie stored on this client)
  // and use that state at the end of an auth flow as a parameter in the redirect URI.
  generateState() {
    let alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let state = '';
    for (var i = 0; i < stateLength; i++) {
      let pos = Math.floor(Math.random() * alpha.length);
      state += alpha.substring(pos, pos+1);
    }
    return state;
  }

  prepareRedirect() {
    let state = this.generateState();
    localStorage.setItem(STATE_KEY, state);
    return `redirect=${encodeURI(this.baseUrl())}&state=${state}`
  }

  authWithOAuth(providerName){
    window.location.replace(`${this.authUrl}/oauth2/${providerName}?${this.prepareRedirect()}`);
  }

  linkWithOAuth(providerName){
    if (this.auth() === null) {
      throw "Must auth before execute"
    }
    window.location.replace(`${this.authUrl}/oauth2/${providerName}?${this.prepareRedirect()}&link=${this.auth()['token']}`);
  }

  logout() {
    return this._doAuthed("/auth", "DELETE", {refreshOnFailure:false, useRefreshToken:true})
      .then((data) => {
        this._clearAuth();
      });
  }

  _clearAuth() {
    localStorage.removeItem(USER_AUTH_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  auth(){
    if (localStorage.getItem(USER_AUTH_KEY) === null) {
      return null;
    }
    return JSON.parse(atob(localStorage.getItem(USER_AUTH_KEY)));
  }

  authedId(){
    var a = this.auth();
    if (a == null) {
      return null;
    }
    return a['user']['_id'];
  }
  
  baseUrl(){
    return [location.protocol, '//', location.host, location.pathname].join('');
  }

  _setAuth(json) {
    let rt = json['refreshToken'];
    delete json['refreshToken'];

    localStorage.setItem(USER_AUTH_KEY, btoa(JSON.stringify(json)));
    localStorage.setItem(REFRESH_TOKEN_KEY, rt);
  }

  checkRedirectResponse(){
    if (typeof window === 'undefined') {
      return
    }

    var fragment = window.location.hash.substring(1);
    var vars = fragment.split('&');
    var found = false;
    var ua = null;
    var stateValidated = false;
    var stateFound = false;
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == "_baas_error") {
          this.lastError = decodeURIComponent(pair[1])
          window.history.replaceState(null, "", this.baseUrl());
          console.log(`BaasClient: error from '${this.appUrl}': ${this.lastError}`);
          found = true;
          break;
        }
        if (decodeURIComponent(pair[0]) == "_baas_ua") {
          ua = JSON.parse(atob(decodeURIComponent(pair[1])));
          found = true;
        }
        if (decodeURIComponent(pair[0]) == "_baas_link") {
          found = true;
        }
        if (decodeURIComponent(pair[0]) == "_baas_state") {
          stateFound = true;
          let ourState = localStorage.getItem(STATE_KEY);
          let theirState = decodeURIComponent(pair[1]);
          if (ourState && ourState === theirState) {
            stateValidated = true;
          } else {
            console.log(`BaasClient: our auth request state does not match what was provided!`);
            window.history.replaceState(null, "", this.baseUrl());   
          }     
        }
    }
    if (found) {
      if (ua !== null) {
        if (stateValidated) {
          this._setAuth(ua);
        } else if (!stateFound) {
          console.log(`BaasClient: our auth request state was never returned!`);
        }
      }

      window.history.replaceState(null, "", this.baseUrl());
    }
    localStorage.removeItem(STATE_KEY);
  }

  _doAuthed(resource, method, options) {
    if(options === undefined) {
      options = {refreshOnFailure:true, useRefreshToken:false}
    }else{
      if(options.refreshOnFailure === undefined){
        options.refreshOnFailure = true
      }
      if(options.useRefreshToken === undefined){
        options.useRefreshToken = false
      }
    }

    if (this.auth() === null) {
      return Promise.reject(new BaasError("Must auth first"))
    }

    let url = `${this.appUrl}${resource}`

    let headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');
    let init = {
      method: method,
      headers: headers
    };

    if (options.body) {
      init['body'] = options.body;
    }

    if (options.queryParams){
      url = url + "?" + toQueryString(options.queryParams)
    }

    let token = options.useRefreshToken ? localStorage.getItem(REFRESH_TOKEN_KEY) : this.auth()['accessToken'];
    headers.append('Authorization', `Bearer ${token}`)

    return fetch(url, init)
      .then((response) => {
        // Okay: passthrough
        if (response.status >= 200 && response.status < 300) {
          return Promise.resolve(response)
        } else if (response.headers.get('Content-Type') === 'application/json') {
          return response.json().then((json) => {
            // Only want to try refreshing token when there's an invalid session
            if ('errorCode' in json && json['errorCode'] == ErrInvalidSession) {
              if (!options.refreshOnFailure) {
                this._clearAuth();
                let error = new BaasError(json['error'], json['errorCode']);
                error.response = response;
                throw error;
              }

              return this._refreshToken().then(() => {
                options.refreshOnFailure = false
                return this._doAuthed(resource, method, options);
              });
            }

            let error = new BaasError(json['error'], json['errorCode']);
            error.response = response;
            throw error;
          });
        }

        let error = new Error(response.statusText);
        error.response = response;
        throw error;
      });
  }

  _refreshToken() {
    return this._doAuthed("/auth/newAccessToken", "POST", {refreshOnFailure:false, useRefreshToken:true}).then((response) => {
      return response.json().then((json) => {
        this._setAccessToken(json['accessToken']);
        return Promise.resolve();
      }) 
    });
  }

  _setAccessToken(token) {
    let currAuth = JSON.parse(atob(localStorage.getItem(USER_AUTH_KEY)));
    currAuth['accessToken'] = token;
    localStorage.setItem(USER_AUTH_KEY, btoa(JSON.stringify(currAuth)));
  }

  executePipeline(stages){
    return this._doAuthed('/pipeline', 'POST', {body:JSON.stringify(stages)})
      .then((response)=>{
          return response.json();
        }
      )
  }

}

class DB {
  constructor(client, service, name){
    this.client = client;
    this.service = service;
    this.name = name;
  }

  getCollection(name){
    return new Collection(this, name)
  }
}

class Collection {
  constructor(db, name){
    this.db = db;
    this.name = name;
  }

  getBaseArgs() {
    return {
      "database": this.db.name,
      "collection": this.name,
    }
  }

  deleteOne(query){
    let args = this.getBaseArgs()
    args.query = query;
    args.singleDoc = true
    return this.db.client.executePipeline([
      {
        "service":this.db.service,
        "action":"delete", 
        "args":args
      }
    ])
  }

  deleteMany(query){
    let args = this.getBaseArgs()
    args.query = query;
    args.singleDoc = false
    return this.db.client.executePipeline([
      {
        "service":this.db.service,
        "action":"delete", 
        "args":args
      }
    ])
  }


  find(query, project){
    let args = this.getBaseArgs()
    args.query = query;
    args.project = project;
    return this.db.client.executePipeline([
      {
        "service":this.db.service,
        "action":"find", 
        "args":args
      }
    ])
  }

  insert(documents){
    return this.db.client.executePipeline([
      {"action":"literal",
       "args":{
          "items":documents,
       }
      },
      {
        "service":this.db.service,
        "action":"insert", 
        "args": this.getBaseArgs(),
      }
    ])
  }

  makeUpdateStage(query, update, upsert, multi){
    let args = this.getBaseArgs()
    args.query = query;
    args.update = update;
    if(upsert){
      args.upsert = true;
    }
    if(multi){
      args.multi = true;
    }

    return {
      "service":this.db.service,
      "action":"update", 
      "args":args
    }
  }

  updateOne(query, update){
    return this.db.client.executePipeline([this.makeUpdateStage(query, update, false, false)])
  }

  updateMany(query, update, upsert, multi){
    return this.db.client.executePipeline([this.makeUpdateStage(query, update, false, true)])
  }

  upsert(query, update){
    return this.db.client.executePipeline([this.makeUpdateStage(query, update, true, false)])
  }

}

export class MongoClient {

  constructor(baasClient, serviceName) {
    this.baasClient = baasClient;
    this.service = serviceName;
  }

  getDb(name){
    return new DB(this.baasClient, this.service, name)
  }

}

export class Admin {

  constructor(baseUrl){
    this._baseUrl = baseUrl
    this._client = new BaasClient(this._baseUrl + "/admin/v1");
  }

  localAuth(username, password){
    return this._client.authWithLocal(username, password, true);
  }

  logout(){
    return this._client.logout();
  }

  // Authed methods
  _doAuthed(url, method, options) {
    return this._client._doAuthed(url, method, options)
      .then((response)=>{
        return response.json()
      })
  }

  _get(url, queryParams){
    return this._doAuthed(url, "GET", {queryParams})
  }

  _put(url, queryParams){
    return this._doAuthed(url, "PUT", {queryParams})
  }

  _delete(url){
    return this._doAuthed(url, "DELETE")
  }

  _post(url, body){
    return this._doAuthed(url, "POST", {body:JSON.stringify(body)})
  }

  profile () {
    let root = this;
    return {
      keys: () => ({
        list: () => root._get("/profile/keys"),
        create: (key) => root._post("/profile/keys"), 
        key: (keyId) => ({
          get: ()=> root._get(`/profile/keys/${keyId}`),
          enable: ()=> root._put(`/profile/keys/${keyId}/enable`),
          disable: ()=> root._put(`/profile/keys/${keyId}/disable`),
        })
      })
    }
  }

  /* Examples of how to access admin API with this client:
   *
   * List all apps
   *    a.apps().list()   
   *
   * Fetch app under name "planner"
   *    a.apps().app("planner").get()   
   *
   * List services under the app "planner"
   *    a.apps().app("planner").services().list()
   *
   * Delete a rule by ID
   *    a.apps().app("planner").services().service("mdb1").rules().rule("580e6d055b199c221fcb821d").remove()
   *
   */
  apps() {
    let root = this;
    return {
      list: ()=> root._get(`/apps`),
      create: (data) => root._post(`/apps`, data),
      app: (app) => ({
        get: ()=> root._get(`/apps/${app}`),
        remove: () => root._delete(`/apps/${app}`),

        authProviders: () => ({
          create: (data) => this._post(`/apps/${app}/authProviders`, data),
          list: () => this._get(`/apps/${app}/authProviders`), 
          provider: (authType, authName) =>({
            get: () => this._get(`/apps/${app}/authProviders/${authType}/${authName}`),
            remove: () => this._delete(`/apps/${app}/authProviders/${authType}/${authName}`),
            update: (data) => this._post(`/apps/${app}/authProviders/${authType}/${authName}`, data),
          })
        }),
        variables: () => ({
          list: ()=> this._get(`/apps/${app}/vars`),
          create: (data) => this._post(`/apps/${app}/vars`, data),
          variable: (varName)=>({
            get: () => this._get(`/apps/${app}/vars/${varName}`),
            remove: () => this._delete(`/apps/${app}/vars/${varName}`),
            update: (data) => this._post(`/apps/${app}/vars/${varName}`, data)
          })
        }),
        logs: () => ({
          get: (filter)=> this._get(`/apps/${app}/logs`, filter),
        }),

        services: () => ({
          list: ()=> this._get(`/apps/${app}/services`),
          create: (data) => this._post(`/apps/${app}/services`, data),
          service: (svc) => ({
            get: () => this._get(`/apps/${app}/services/${svc}`),
            update: (data) => this._post(`/apps/${app}/services/${svc}`, data),
            remove: () => this._delete(`/apps/${app}/services/${svc}`),
            setConfig: (data)=> this._post(`/apps/${app}/services/${svc}/config`, data),

            rules: () => ({
              list: ()=> this._get(`/apps/${app}/services/${svc}/rules`),   
              create: (data)=> this._post(`/apps/${app}/services/${svc}/rules`),   
              rule: (ruleId) => ({
                get: ()=> this._get(`/apps/${app}/services/${svc}/rules/${ruleId}`),    
                update: (data)=> this._post(`/apps/${app}/services/${svc}/rules/${ruleId}`, data),    
                remove: ()=> this._delete(`/apps/${app}/services/${svc}/rules/${ruleId}`),
              })
            }), 

            triggers: () => ({
              list: ()=> this._get(`/apps/${app}/services/${svc}/triggers`),   
              create: (data)=> this._post(`/apps/${app}/services/${svc}/triggers`),   
              trigger: (triggerId) => ({
                get: ()=> this._get(`/apps/${app}/services/${svc}/triggers/${triggerId}`),    
                update: (data)=> this._post(`/apps/${app}/services/${svc}/triggers/${triggerId}`, data),    
                remove: ()=> this._delete(`/apps/${app}/services/${svc}/triggers/${triggerId}`),    
              })
            })
          }),
        }),
      }),
    }
  }

}
