import cookie from 'cookie_js'

const USER_AUTH_KEY = "_baas_ua";

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
    $.ajax({
      type: 'DELETE',
      url: this.authUrl + "/logout",
      headers: {
        'Authorization': `Bearer ${this.auth()['token']}`
      }
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

    return $.ajax({
      type: 'POST',
      contentType: "application/json",
      url: `${this.appUrl}/pipeline`,
      data: JSON.stringify(stages),
      dataType: 'json',
      headers: {
        'Authorization': `Bearer ${this.auth()['token']}`
      }
    })
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

  _ajaxArgs(method, url, data){
    return {
      type: method,
      contentType: "application/json",
      dataType: "json",
      xhrFields: { withCredentials: true },
      url: `${this._baseUrl}${url}`,
      data: JSON.stringify(data),
      crossDomain: true,
    }
  }

  _do(method, url, data){
    return $.ajax(this._ajaxArgs(method, url, data))
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
