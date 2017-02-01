/* global window, localStorage, fetch */
/* eslint no-labels: ["error", { "allowLoop": true }] */
import 'whatwg-fetch' // fetch polyfill

const USER_AUTH_KEY = '_baas_ua'
const REFRESH_TOKEN_KEY = '_baas_rt'
const STATE_KEY = '_baas_state'
const BAAS_ERROR_KEY = '_baas_error'
const BAAS_LINK_KEY = '_baas_link'
const IMPERSONATION_ACTIVE_KEY = '_baas_impers_active'
const IMPERSONATION_USER_KEY = '_baas_impers_user'
const IMPERSONATION_REAL_USER_AUTH_KEY = '_baas_impers_real_ua'
const DEFAULT_BAAS_SERVER_URL = 'https://baas-dev.10gen.cc'
const JSONTYPE = 'application/json'

export const ErrAuthProviderNotFound = 'AuthProviderNotFound'
export const ErrInvalidSession = 'InvalidSession'
const stateLength = 64

const toQueryString = (obj) => {
  var parts = []
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      parts.push(encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]))
    }
  }
  return parts.join('&')
}

const checkStatus = (response) => {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    var error = new Error(response.statusText)
    error.response = response
    throw error
  }
}

export const parseRedirectFragment = (fragment, ourState) => {
  // After being redirected from oauth, the URL will look like:
  // https://todo.examples.baas-dev.10gen.cc/#_baas_state=...&_baas_ua=...
  // This function parses out baas-specific tokens from the fragment and
  // builds an object describing the result.
  const vars = fragment.split('&')
  const result = { ua: null, found: false, stateValid: false, lastError: null }
  outerloop:
  for (const pair of vars) {
    var pairParts = pair.split('=')
    const pairKey = decodeURIComponent(pairParts[0])
    switch (pairKey) {
      case BAAS_ERROR_KEY:
        result.lastError = decodeURIComponent(pairParts[1])
        result.found = true
        break outerloop
      case USER_AUTH_KEY:
        result.ua = JSON.parse(window.atob(decodeURIComponent(pairParts[1])))
        result.found = true
        continue
      case BAAS_LINK_KEY:
        result.found = true
        continue
      case STATE_KEY:
        result.found = true
        let theirState = decodeURIComponent(pairParts[1])
        if (ourState && ourState === theirState) {
          result.stateValid = true
        }
    }
  }
  return result
}

export class BaasError extends Error {
  constructor (message, code) {
    super(message)
    this.name = 'BaasError'
    this.message = message
    if (code !== undefined) {
      this.code = code
    }
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor)
    } else {
      this.stack = (new Error(message)).stack
    }
  }
}

export class Auth {
  constructor (rootUrl) {
    this.rootUrl = rootUrl
  }

  pageRootUrl () {
    return [window.location.protocol, '//', window.location.host, window.location.pathname].join('')
  }

  // The state we generate is to be used for any kind of request where we will
  // complete an authentication flow via a redirect. We store the generate in
  // a local storage bound to the app's origin. This ensures that any time we
  // receive a redirect, there must be a state parameter and it must match
  // what we ourselves have generated. This state MUST only be sent to
  // a trusted BaaS endpoint in order to preserve its integrity. BaaS will
  // store it in some way on its origin (currently a cookie stored on this client)
  // and use that state at the end of an auth flow as a parameter in the redirect URI.
  static generateState () {
    let alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let state = ''
    for (var i = 0; i < stateLength; i++) {
      let pos = Math.floor(Math.random() * alpha.length)
      state += alpha.substring(pos, pos + 1)
    }
    return state
  }

  setAccessToken (token) {
    let currAuth = this.get()
    currAuth['accessToken'] = token
    currAuth['refreshToken'] = localStorage.getItem(REFRESH_TOKEN_KEY)
    this.set(currAuth)
  }

  handleRedirect () {
    let ourState = localStorage.getItem(STATE_KEY)
    let redirectFragment = window.location.hash.substring(1)
    const redirectState = parseRedirectFragment(redirectFragment, ourState)
    if (redirectState.lastError) {
      console.error(`BaasClient: error from redirect: ${redirectState.lastError}`)
      window.history.replaceState(null, '', this.pageRootUrl())
      return
    }
    if (!redirectState.found) {
      return
    }
    localStorage.removeItem(STATE_KEY)
    if (!redirectState.stateValid) {
      console.error(`BaasClient: state values did not match!`)
      window.history.replaceState(null, '', this.pageRootUrl())
      return
    }
    if (!redirectState.ua) {
      console.error(`BaasClient: no UA value was returned from redirect!`)
      return
    }
    // If we get here, the state is valid - set auth appropriately.
    this.set(redirectState.ua)
    window.history.replaceState(null, '', this.pageRootUrl())
  }

  getOAuthLoginURL (providerName, redirectUrl) {
    if (redirectUrl === undefined) {
      redirectUrl = this.pageRootUrl()
    }
    let state = Auth.generateState()
    localStorage.setItem(STATE_KEY, state)
    let result = `${this.rootUrl}/oauth2/${providerName}?redirect=${encodeURI(redirectUrl)}&state=${state}`
    return result
  }

  localAuth (username, password, cors) {
    let init = {
      method: 'POST',
      headers: {
        'Accept': JSONTYPE,
        'Content-Type': JSONTYPE
      },
      body: JSON.stringify({'username': username, 'password': password})
    }

    if (cors) {
      init['cors'] = cors
    }

    return fetch(`${this.rootUrl}/local/userpass`, init)
      .then(checkStatus)
      .then((response) => {
        return response.json().then((json) => {
          this.set(json)
          Promise.resolve()
        })
      })
  }

  clear () {
    localStorage.removeItem(USER_AUTH_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }

  set (json) {
    let rt = json['refreshToken']
    delete json['refreshToken']

    localStorage.setItem(USER_AUTH_KEY, window.btoa(JSON.stringify(json)))
    localStorage.setItem(REFRESH_TOKEN_KEY, rt)
  }

  get () {
    if (localStorage.getItem(USER_AUTH_KEY) === null) {
      return null
    }
    return JSON.parse(window.atob(localStorage.getItem(USER_AUTH_KEY)))
  }

  authedId () {
    var a = this.get()
    return ((a || {}).user || {})._id
  }

  isImpersonatingUser () {
    return localStorage.getItem(IMPERSONATION_ACTIVE_KEY) === "true"
  }

  refreshImpersonation (client) {
    let userId = localStorage.getItem(IMPERSONATION_USER_KEY)
    return client._doAuthed(`/admin/impersonate/${userId}`, 'POST', {refreshOnFailure: false, useRefreshToken: true}).then((response) => {
      return response.json().then((json) => {
        json['refreshToken'] = localStorage.getItem(REFRESH_TOKEN_KEY)
        this.set(json)
        return Promise.resolve()
      })
    }).catch((e) => {
      this.stopImpersonation()
      throw e
    })
  }

  startImpersonation (client, userId) {
    if (this.isImpersonatingUser()) {
      throw new Error("Already impersonating a user")
    }
    localStorage.setItem(IMPERSONATION_ACTIVE_KEY, "true")
    localStorage.setItem(IMPERSONATION_USER_KEY, userId)

    let realUserAuth = JSON.parse(window.atob(localStorage.getItem(USER_AUTH_KEY)))
    realUserAuth['refreshToken'] = localStorage.getItem(REFRESH_TOKEN_KEY)
    localStorage.setItem(IMPERSONATION_REAL_USER_AUTH_KEY, window.btoa(JSON.stringify(realUserAuth)))
    return this.refreshImpersonation(client)
  }

  stopImpersonation () {
    let root = this
    return new Promise(function(resolve, reject) {
      if (!root.isImpersonatingUser()) {
        throw new Error("Not impersonating a user")
      }
      localStorage.removeItem(IMPERSONATION_ACTIVE_KEY)
      localStorage.removeItem(IMPERSONATION_USER_KEY)
      let realUserAuth = JSON.parse(window.atob(localStorage.getItem(IMPERSONATION_REAL_USER_AUTH_KEY)))
      localStorage.removeItem(IMPERSONATION_REAL_USER_AUTH_KEY)
      root.set(realUserAuth)
      resolve()
    })
  }
}

export class BaasClient {
  constructor (app, options) {
    let baseUrl = DEFAULT_BAAS_SERVER_URL
    if (options && options.baseUrl) {
      baseUrl = options.baseUrl
    }
    this.appUrl = `${baseUrl}/admin/v1`
    this.authUrl = `${baseUrl}/admin/v1/auth`
    if (app) {
      this.appUrl = `${baseUrl}/v1/app/${app}`
      this.authUrl = `${this.appUrl}/auth`
    }
    this.authManager = new Auth(this.authUrl)
    this.authManager.handleRedirect()
  }

  authWithOAuth (providerName, redirectUrl) {
    window.location.replace(this.authManager.getOAuthLoginURL(providerName, redirectUrl))
  }

  authedId () {
    return this.authManager.authedId()
  }

  auth () {
    return this.authManager.get()
  }

  logout () {
    return this._doAuthed('/auth', 'DELETE', {refreshOnFailure: false, useRefreshToken: true})
      .then((data) => {
        this.authManager.clear()
        if (this.authManager.isImpersonatingUser()) {
          return this.authManager.stopImpersonation()
        }
      })
  }

  // wrapper around fetch() that matches the signature of doAuthed but does not
  // actually use any auth. This is necessary for routes that must be
  // accessible without logging in, like listing available auth providers.
  _do (resource, method, options) {
    options = options || {}
    let url = `${this.appUrl}${resource}`
    let init = {
      method: method,
      headers: { 'Accept': JSONTYPE, 'Content-Type': JSONTYPE }
    }
    if (options.body) {
      init['body'] = options.body
    }
    if (options.queryParams) {
      url = url + '?' + toQueryString(options.queryParams)
    }

    return fetch(url, init)
      .then((response) => {
        // Okay: passthrough
        if (response.status >= 200 && response.status < 300) {
          return Promise.resolve(response)
        } else if (response.headers.get('Content-Type') === JSONTYPE) {
          return response.json().then((json) => {
            let error = new BaasError(json['error'], json['errorCode'])
            error.response = response
            throw error
          })
        }
        let error = new Error(response.statusText)
        error.response = response
        throw error
      }).then((response) => {
        return response.json()
      })
  }

  _doAuthed (resource, method, options) {
    if (options === undefined) {
      options = {refreshOnFailure: true, useRefreshToken: false}
    } else {
      if (options.refreshOnFailure === undefined) {
        options.refreshOnFailure = true
      }
      if (options.useRefreshToken === undefined) {
        options.useRefreshToken = false
      }
    }

    if (this.auth() === null) {
      return Promise.reject(new BaasError('Must auth first'))
    }

    let url = `${this.appUrl}${resource}`

    let headers = {
      'Accept': JSONTYPE,
      'Content-Type': JSONTYPE
    }
    let token = options.useRefreshToken ? localStorage.getItem(REFRESH_TOKEN_KEY) : this.auth()['accessToken']
    headers['Authorization'] = `Bearer ${token}`

    let init = {
      method: method,
      headers: headers
    }

    if (options.body) {
      init['body'] = options.body
    }

    if (options.queryParams) {
      url = url + '?' + toQueryString(options.queryParams)
    }

    return fetch(url, init)
      .then((response) => {
        // Okay: passthrough
        if (response.status >= 200 && response.status < 300) {
          return Promise.resolve(response)
        } else if (response.headers.get('Content-Type') === JSONTYPE) {
          return response.json().then((json) => {
            // Only want to try refreshing token when there's an invalid session
            if ('errorCode' in json && json['errorCode'] === ErrInvalidSession) {
              if (!options.refreshOnFailure) {
                this.authManager.clear()
                let error = new BaasError(json['error'], json['errorCode'])
                error.response = response
                throw error
              }

              return this._refreshToken().then(() => {
                options.refreshOnFailure = false
                return this._doAuthed(resource, method, options)
              })
            }

            let error = new BaasError(json['error'], json['errorCode'])
            error.response = response
            throw error
          })
        }

        let error = new Error(response.statusText)
        error.response = response
        throw error
      })
  }

  _refreshToken () {
    if (this.authManager.isImpersonatingUser()) {
      return this.authManager.refreshImpersonation(this)
    }
    return this._doAuthed('/auth/newAccessToken', 'POST', {refreshOnFailure: false, useRefreshToken: true}).then((response) => {
      return response.json().then((json) => {
        this.authManager.setAccessToken(json['accessToken'])
        return Promise.resolve()
      })
    })
  }

  executePipeline (stages) {
    return this._doAuthed('/pipeline', 'POST', {body: JSON.stringify(stages)})
      .then((response) => response.json())
  }
}

class DB {
  constructor (client, service, name) {
    this.client = client
    this.service = service
    this.name = name
  }

  getCollection (name) {
    return new Collection(this, name)
  }
}

class Collection {
  constructor (db, name) {
    this.db = db
    this.name = name
  }

  getBaseArgs () {
    return {
      'database': this.db.name,
      'collection': this.name
    }
  }

  deleteOne (query) {
    let args = this.getBaseArgs()
    args.query = query
    args.singleDoc = true
    return this.db.client.executePipeline([
      {
        'service': this.db.service,
        'action': 'delete',
        'args': args
      }
    ])
  }

  deleteMany (query) {
    let args = this.getBaseArgs()
    args.query = query
    args.singleDoc = false
    return this.db.client.executePipeline([
      {
        'service': this.db.service,
        'action': 'delete',
        'args': args
      }
    ])
  }

  find (query, project) {
    let args = this.getBaseArgs()
    args.query = query
    args.project = project
    return this.db.client.executePipeline([
      {
        'service': this.db.service,
        'action': 'find',
        'args': args
      }
    ])
  }

  insert (documents) {
    return this.db.client.executePipeline([
      {'action': 'literal',
        'args': {
          'items': documents
        }
      },
      {
        'service': this.db.service,
        'action': 'insert',
        'args': this.getBaseArgs()
      }
    ])
  }

  makeUpdateStage (query, update, upsert, multi) {
    let args = this.getBaseArgs()
    args.query = query
    args.update = update
    if (upsert) {
      args.upsert = true
    }
    if (multi) {
      args.multi = true
    }

    return {
      'service': this.db.service,
      'action': 'update',
      'args': args
    }
  }

  updateOne (query, update) {
    return this.db.client.executePipeline([this.makeUpdateStage(query, update, false, false)])
  }

  updateMany (query, update, upsert, multi) {
    return this.db.client.executePipeline([this.makeUpdateStage(query, update, false, true)])
  }

  upsert (query, update) {
    return this.db.client.executePipeline([this.makeUpdateStage(query, update, true, false)])
  }

}

export class MongoClient {

  constructor (baasClient, serviceName) {
    this.baasClient = baasClient
    this.service = serviceName
  }

  getDb (name) {
    return new DB(this.baasClient, this.service, name)
  }

}

export class Admin {

  constructor (baseUrl) {
    this.client = new BaasClient('', {baseUrl})
  }

  _doAuthed (url, method, options) {
    return this.client._doAuthed(url, method, options)
      .then((response) => {
        return response.json()
      })
  }

  isImpersonatingUser () {
    return this.client.authManager.isImpersonatingUser()
  }

  startImpersonation (userId) {
    return this.client.authManager.startImpersonation(this.client, userId)
  }

  stopImpersonation (userId) {
    return this.client.authManager.stopImpersonation()
  }

  _get (url, queryParams) {
    return this._doAuthed(url, 'GET', {queryParams})
  }

  _put (url, queryParams) {
    return this._doAuthed(url, 'PUT', {queryParams})
  }

  _delete (url) {
    return this._doAuthed(url, 'DELETE')
  }

  _post (url, body) {
    return this._doAuthed(url, 'POST', {body: JSON.stringify(body)})
  }

  profile () {
    let root = this
    return {
      keys: () => ({
        list: () => root._get('/profile/keys'),
        create: (key) => root._post('/profile/keys'),
        apiKey: (keyId) => ({
          get: () => root._get(`/profile/keys/${keyId}`),
          remove: () => this._delete(`/profile/keys/${keyId}`),
          enable: () => root._put(`/profile/keys/${keyId}/enable`),
          disable: () => root._put(`/profile/keys/${keyId}/disable`)
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
  apps () {
    let root = this
    return {
      list: () => root._get(`/apps`),
      create: (data) => root._post(`/apps`, data),
      app: (app) => ({
        get: () => root._get(`/apps/${app}`),
        remove: () => root._delete(`/apps/${app}`),

        users: () => ({
          list: (filter) => this._get(`/apps/${app}/users`, filter),
          user: (uid) => ({
            get: () => this._get(`/apps/${app}/users/${uid}`)
          })
        }),

        authProviders: () => ({
          create: (data) => this._post(`/apps/${app}/authProviders`, data),
          list: () => this._get(`/apps/${app}/authProviders`),
          provider: (authType, authName) => ({
            get: () => this._get(`/apps/${app}/authProviders/${authType}/${authName}`),
            remove: () => this._delete(`/apps/${app}/authProviders/${authType}/${authName}`),
            update: (data) => this._post(`/apps/${app}/authProviders/${authType}/${authName}`, data)
          })
        }),
        variables: () => ({
          list: () => this._get(`/apps/${app}/vars`),
          variable: (varName) => ({
            get: () => this._get(`/apps/${app}/vars/${varName}`),
            remove: () => this._delete(`/apps/${app}/vars/${varName}`),
            create: (data) => this._post(`/apps/${app}/vars/${varName}`, data),
            update: (data) => this._post(`/apps/${app}/vars/${varName}`, data)
          })
        }),
        logs: () => ({
          get: (filter) => this._get(`/apps/${app}/logs`, filter)
        }),
        apiKeys: () => ({
          list: () => this._get(`/apps/${app}/keys`),
          create: (data) => this._post(`/apps/${app}/keys`, data),
          apiKey: (key) => ({
            get: () => this._get(`/apps/${app}/keys/${key}`),
            remove: () => this._delete(`/apps/${app}/keys/${key}`),
            enable: () => this._put(`/apps/${app}/keys/${key}/enable`),
            disable: () => this._put(`/apps/${app}/keys/${key}/disable`)
          })
        }),
        services: () => ({
          list: () => this._get(`/apps/${app}/services`),
          create: (data) => this._post(`/apps/${app}/services`, data),
          service: (svc) => ({
            get: () => this._get(`/apps/${app}/services/${svc}`),
            update: (data) => this._post(`/apps/${app}/services/${svc}`, data),
            remove: () => this._delete(`/apps/${app}/services/${svc}`),
            setConfig: (data) => this._post(`/apps/${app}/services/${svc}/config`, data),

            rules: () => ({
              list: () => this._get(`/apps/${app}/services/${svc}/rules`),
              create: (data) => this._post(`/apps/${app}/services/${svc}/rules`),
              rule: (ruleId) => ({
                get: () => this._get(`/apps/${app}/services/${svc}/rules/${ruleId}`),
                update: (data) => this._post(`/apps/${app}/services/${svc}/rules/${ruleId}`, data),
                remove: () => this._delete(`/apps/${app}/services/${svc}/rules/${ruleId}`)
              })
            }),

            triggers: () => ({
              list: () => this._get(`/apps/${app}/services/${svc}/triggers`),
              create: (data) => this._post(`/apps/${app}/services/${svc}/triggers`),
              trigger: (triggerId) => ({
                get: () => this._get(`/apps/${app}/services/${svc}/triggers/${triggerId}`),
                update: (data) => this._post(`/apps/${app}/services/${svc}/triggers/${triggerId}`, data),
                remove: () => this._delete(`/apps/${app}/services/${svc}/triggers/${triggerId}`)
              })
            })
          })
        })
      })
    }
  }
}
