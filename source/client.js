import cookie from 'cookie_js'
import 'whatwg-fetch' // fetch polyfill

const USER_AUTH_KEY = "_baas_ua";

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    var error = new Error(response.statusText)
    error.response = response
    throw error
  }
}

export class BaasClient {
  constructor(appUrl) {
    this.appUrl = appUrl;
    this.authUrl = `${this.appUrl}/auth`
    this.checkRedirectResponse();
  }

  authWithOAuth(providerName){
    window.location.replace(`${this.authUrl}/oauth2/${providerName}?redirect=${encodeURI(this.baseUrl())}`);
  }

  linkWithOAuth(providerName){
    if (this.auth() === null) {
      throw "Must auth before execute"
    }
    window.location.replace(`${this.authUrl}/oauth2/${providerName}?redirect=${encodeURI(this.baseUrl())}&link=${this.auth()['token']}`);
  }

  logout() {
    let myHeaders = new Headers()
    myHeaders.append('Accept', 'application/json')
    myHeaders.append('Content-Type', 'application/json')

    fetch(this.authUrl + "/logout",
    {
      method: 'DELETE',
      headers: myHeaders,
    }).done((data) => {
      localStorage.removeItem(USER_AUTH_KEY);
      location.reload();
    }).fail((data) => {
      // This is probably the wrong thing to do since it could have
      // failed for other reasons.
      localStorage.removeItem(USER_AUTH_KEY);
      location.reload();
    });
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

  checkRedirectResponse(){
    if (typeof window === 'undefined') {
      return
    }

    var query = window.location.search.substring(1);
    var vars = query.split('&');
    var found = false;
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
          localStorage.setItem(USER_AUTH_KEY, decodeURIComponent(pair[1]));
          found = true;
          break;
        }
        if (decodeURIComponent(pair[0]) == "_baas_link") {
          found = true;
          break;
        }
    }
    if (found) {
      window.history.replaceState(null, "", this.baseUrl());
    }
  }

  executePipeline(stages){
    if (this.auth() === null) {
      throw "Must auth before execute"
    }

    var headers = new Headers();
    headers.append('Accept', 'application/json')
    headers.append('Content-Type', 'application/json')
    headers.append('Authorization', `Bearer ${this.auth()['accessToken']}`)
    return fetch(`${this.appUrl}/pipeline`,
      {
        method: 'POST',
        body: JSON.stringify(stages),
        headers: headers
      })
    .then(checkStatus)
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
  }

  localAuth(username, password){
    return this._post("/auth/local/userpass", {username, password})
  }

  logout(){
    return this._get("/logout")
  }

  _ajaxArgs(method, data){
    let myHeaders = new Headers();
    myHeaders.append('Accept', 'application/json')
    myHeaders.append('Content-Type', 'application/json')

    return {
      method: method,
      mode: 'cors',
      headers: myHeaders,
      credentials: 'include',
      body: JSON.stringify(data),
    }
  }

  _do(method, url, data){
    return fetch(`${this._baseUrl}${url}`, this._ajaxArgs(method, data))
      .then(checkStatus)
      .then((response)=>{
        return response.json()
      })
  }

  _get(url){
    return this._do("GET", url)
  }

  _delete(url){
    return this._do("DELETE", url)
  }

  _post(url, data){
    return this._do("POST", url, data)
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
