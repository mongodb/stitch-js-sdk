/* global it, describe, global, after, before, atob, btoa, require, Buffer, Promise */
const fetchMock = require('fetch-mock')
import {BaasClient, Auth, parseRedirectFragment} from '../source/client'
import {mocks} from 'mock-browser'
import * as bson from 'bson'
import {expect} from 'chai'
const EJSON = require('mongodb-extended-json')

const MockBrowser = mocks.MockBrowser
global.Buffer = global.Buffer || require('buffer').Buffer

// Polyfill base64 encoding functions, since these aren't provided by nodejs.
if (typeof btoa === 'undefined') {
  global.btoa = function (str) {
    return new Buffer(str).toString('base64')
  }
}

if (typeof atob === 'undefined') {
  global.atob = function (b64Encoded) {
    return new Buffer(b64Encoded, 'base64').toString()
  }
}

describe('Redirect fragment parsing', () => {
  const makeFragment = (parts) => (
    Object.keys(parts).map(
      (key) => (encodeURIComponent(key) + '=' + parts[key])
    ).join('&')
  )

  it('should detect valid states', () => {
    let result = parseRedirectFragment(makeFragment({'_baas_state': atob('state_XYZ')}), atob('state_XYZ'))
    expect(result.stateValid).to.be.true
    expect(result.found).to.be.true
    expect(result.lastError).to.be.null
  })

  it('should detect invalid states', () => {
    let result = parseRedirectFragment(makeFragment({'_baas_state': atob('state_XYZ')}), atob('state_ABC'))
    expect(result.stateValid).to.be.false
    expect(result.lastError).to.be.null
  })

  it('should detect errors', () => {
    let result = parseRedirectFragment(makeFragment({'_baas_error': 'hello world'}), atob('state_ABC'))
    expect(result.lastError).to.equal('hello world')
    expect(result.stateValid).to.be.false
  })

  it('should detect if no items found', () => {
    let result = parseRedirectFragment(makeFragment({'foo': 'bar'}), atob('state_ABC'))
    expect(result.found).to.be.false
  })
})

describe('Auth', () => {
  before(() => {
    const mb = new MockBrowser()
    global.window = mb.getWindow()
    global.localStorage = mb.getLocalStorage()
    fetchMock.post('/auth/local/userpass', {user: {'_id': '5899445b275d3ebe8f2ab8a6'}})
  })

  after(() => {
    delete global.window
    delete global.localStorage
    fetchMock.restore()
  })

  it('get() set() clear() authedId() should work', () => {
    const a = new Auth('/auth')
    expect(a.get()).to.be.null

    const testUser = {'foo': 'bar', 'biz': 'baz', 'user': {'_id': '5899445b275d3ebe8f2ab8a5'}}
    a.set(testUser)
    expect(a.get()).to.eql(testUser)
    expect(a.authedId()).to.eql({'$oid': '5899445b275d3ebe8f2ab8a5'})

    a.clear()
    expect(a.get()).to.be.null
  })

  it('should local auth successfully', () => {
    const a = new Auth('/auth')
    a.localAuth('user', 'password', true).then(() => {
      expect(a.authedId()).to.eql({'$oid': '5899445b275d3ebe8f2ab8a6'})
    })
  })

  it('should allow setting access tokens', () => {
    const a = new Auth('/auth')
    a.localAuth('user', 'password', true).then(() => {
      expect(a.authedId()).to.eql('billybob')
      expect(a.get()['sessionToken']).to.be.undefined
      a.setSessionToken('foo')
      expect(a.get()['sessionToken']).to.equal('foo')
    })
  })
})

describe('pipeline execution', () => {
  const hexStr = '5899445b275d3ebe8f2ab8c0'

  before(() => {
    const mb = new MockBrowser()
    global.window = mb.getWindow()
    global.localStorage = mb.getLocalStorage()
  })
  after(() => {
    delete global.window
    delete global.localStorage
  })

  describe('extended json decode (incoming)', () => {
    before(() => {
      fetchMock.post('https://baas-dev.10gen.cc/v1/app/testapp/auth/local/userpass', {user: {'_id': '5899445b275d3ebe8f2ab8a6'}})
      fetchMock.post('https://baas-dev.10gen.cc/v1/app/testapp/pipeline', (url, opts) => {
        return {result: [{x: {'$oid': hexStr}}]}
      })
    })

    after(() => {
      fetchMock.restore()
    })

    it('should decode extended json from pipeline responses', () => {
      var testClient = new BaasClient('testapp', {baseUrl: ''})
      return testClient.authManager.localAuth('user', 'password', true)
      .then(() => {
        return testClient.executePipeline([{action: 'literal', args: {items: [{x: {'$oid': hexStr}}]}}], {decoder: EJSON.parse})
      })
      .then((response) => {
        return expect(response.result[0].x).to.eql(bson.ObjectId(hexStr))
      })
    })
  })

  describe('extended json encode (outgoing)', () => {
    let requestOpts
    before(() => {
      fetchMock.post('https://baas-dev.10gen.cc/v1/app/testapp/auth/local/userpass', {user: {'_id': '5899445b275d3ebe8f2ab8a6'}})
      fetchMock.post('https://baas-dev.10gen.cc/v1/app/testapp/pipeline', (url, opts) => {
        // TODO there should be a better way to capture request payload for
        // using in an assertion without doing this.
        requestOpts = opts
        return {result: [{x: {'$oid': hexStr}}]}
      })
    })

    after(() => {
      fetchMock.restore()
    })

    it('should encode objects to extended json for outgoing pipeline request body', () => {
      var requestBodyObj = {action: 'literal', args: {items: [{x: bson.ObjectId(hexStr)}]}}
      var requestBodyExtJSON = {action: 'literal', args: {items: [{x: {'$oid': hexStr}}]}}
      var testClient = new BaasClient('testapp', {baseUrl: ''})
      return testClient.authManager.localAuth('user', 'password', true).then((a) => {
        return testClient.executePipeline([requestBodyObj], {encoder: EJSON.stringify})
      })
      .then((response) => {
        return Promise.all([
          expect(JSON.parse(requestOpts.body)).to.eql([requestBodyExtJSON])
        ])
      })
    })
  })
})

