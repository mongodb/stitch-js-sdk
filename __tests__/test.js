/* global expect, it, describe, global, beforeEach, afterEach, afterAll, beforeAll, require, Buffer, Promise */
const fetchMock = require('fetch-mock')
import {BaasClient, BaasError, toQueryString} from '../source/client'
import {parseRedirectFragment, JSONTYPE} from '../source/common'
import Auth from '../source/auth'
import {mocks} from 'mock-browser'
import {Base64} from 'js-base64'
const EJSON = require('mongodb-extjson')

const MockBrowser = mocks.MockBrowser
global.Buffer = global.Buffer || require('buffer').Buffer

const hexStr = '5899445b275d3ebe8f2ab8c0'

describe('query string', () => {
  it('should encode an object to a query string', () => {
    expect(toQueryString({
      'x': 'Hello Günter',
      'y': 'foo'
    })).toEqual('x=Hello%20G%C3%BCnter&y=foo')
  })
})

describe('Redirect fragment parsing', () => {
  const makeFragment = (parts) => (
    Object.keys(parts).map(
      (key) => (encodeURIComponent(key) + '=' + parts[key])
    ).join('&')
  )

  it('should detect valid states', () => {
    let result = parseRedirectFragment(makeFragment({'_baas_state': Base64.encode('state_XYZ')}), Base64.encode('state_XYZ'))
    expect(result.stateValid).toBe(true)
    expect(result.found).toBe(true)
    expect(result.lastError).toBe(null)
  })

  it('should detect invalid states', () => {
    let result = parseRedirectFragment(makeFragment({'_baas_state': Base64.encode('state_XYZ')}), Base64.encode('state_ABC'))
    expect(result.stateValid).toBe(false)
    expect(result.lastError).toBe(null)
  })

  it('should detect errors', () => {
    let result = parseRedirectFragment(makeFragment({'_baas_error': 'hello world'}), Base64.encode('state_ABC'))
    expect(result.lastError).toEqual('hello world')
    expect(result.stateValid).toBe(false)
  })

  it('should detect if no items found', () => {
    let result = parseRedirectFragment(makeFragment({'foo': 'bar'}), Base64.encode('state_ABC'))
    expect(result.found).toBe(false)
  })
})

describe('Auth', () => {
  beforeAll(() => {
    const mb = new MockBrowser()
    global.window = mb.getWindow()
    fetchMock.post('/auth/local/userpass', {user: {'_id': hexStr}})
    fetchMock.post('https://baas-dev.10gen.cc/v1/app/testapp/auth/local/userpass', {user: {'_id': hexStr}})
    fetchMock.delete('https://baas-dev.10gen.cc/v1/app/testapp/auth', {})
  })

  afterAll(() => {
    delete global.window
    fetchMock.restore()
  })

  it('get() set() clear() authedId() should work', () => {
    const a = new Auth('/auth')
    expect(a.get()).toBeNull()

    const testUser = {'foo': 'bar', 'biz': 'baz', 'user': {'_id': hexStr}}
    a.set(testUser)
    expect(a.get()).toEqual(testUser)
    expect(a.authedId()).toEqual({'$oid': hexStr})

    a.clear()
    expect(a.get()).toBeNull()
  })

  it('should local auth successfully', () => {
    const a = new Auth('/auth')
    a.localAuth('user', 'password', true).then(() => {
      expect(a.authedId()).toEqual({'$oid': hexStr})
    })
  })

  it('should allow setting access tokens', () => {
    const a = new Auth('/auth')
    a.localAuth('user', 'password', true).then(() => {
      expect(a.authedId()).toEqual('billybob')
      expect(a.get()['sessionToken']).toBeUndefined()
      a.setSessionToken('foo')
      expect(a.get()['sessionToken']).toEqual('foo')
    })
  })

  it('should be able to access auth methods from client', () => {
    var testClient = new BaasClient('testapp')
    return testClient.authManager.localAuth('user', 'password', true)
    .then(() => {
      expect(testClient.authedId()).toEqual({'$oid': hexStr})
      expect(testClient.authError()).toBeFalsy()
      expect(testClient.auth()).toEqual({user: {_id: hexStr}})
    })
    .then(() => testClient.logout())
    .then(() => {
      expect(testClient.authedId()).toBeFalsy()
      expect(testClient.authError()).toBeFalsy()
      expect(testClient.auth()).toBeNull()
    })
  })
})

describe('http error responses', () => {
  const testErrMsg = 'test: bad request'
  const testErrCode = 'TestBadRequest'
  beforeEach(() => {
    fetchMock.restore()
    fetchMock.post('https://baas-dev2.10gen.cc/v1/app/testapp/pipeline', () =>
      ({
        body: {error: testErrMsg, errorCode: testErrCode},
        headers: { 'Content-Type': JSONTYPE },
        status: 400
      })

    )
    fetchMock.post('https://baas-dev2.10gen.cc/v1/app/testapp/auth/local/userpass', {user: {'_id': hexStr}})
  })
  it('should return a BaasError instance with the error and errorCode extracted', (done) => {
    expect.assertions(2)
    const testClient = new BaasClient('testapp', {baseUrl: 'https://baas-dev2.10gen.cc'})
    testClient.authManager.localAuth('user', 'passwordsdkgjbskdgjb')
    .then(() => testClient.executePipeline([{action: 'literal', args: {items: [{x: 5}]}}]))
    .then(() => console.log(testClient.auth()))
    .catch(e => {
      expect(e.code).toEqual(testErrCode)
      expect(e.message).toEqual(testErrMsg)
      done()
    })
    .catch(done)
  })
})

describe('client options', () => {
  beforeEach(() => {
    fetchMock.restore()
    fetchMock.post('https://baas-dev2.10gen.cc/v1/app/testapp/auth/local/userpass', {user: {'_id': hexStr}})
    fetchMock.post('https://baas-dev2.10gen.cc/v1/app/testapp/pipeline', (url, opts) => {
      return {result: [{x: {'$oid': hexStr}}]}
    })
    fetchMock.delete('https://baas-dev.10gen.cc/v1/app/testapp/auth', {})
    fetchMock.post('https://baas-dev.10gen.cc/v1/app/testapp/pipeline', (url, opts) => {
      return {result: [{x: {'$oid': hexStr}}]}
    })
  })

  it('allows overriding the base url', (done) => {
    var testClient = new BaasClient('testapp', {baseUrl: 'https://baas-dev2.10gen.cc'})
    testClient.authManager.localAuth('user', 'password', true)
    .then(() => {
      return testClient.executePipeline([{action: 'literal', args: {items: [{x: {'$oid': hexStr}}]}}])
    })
    .then((response) => {
      const ejson = new EJSON()
      expect(response.result[0].x).toEqual(ejson.bson.ObjectID(hexStr))
    })
    .then(() => done())
    .catch((e) => done(e))
  })

  it('returns a rejected promise if trying to execute a pipeline without auth', (done) => {
    var testClient = new BaasClient('testapp')
    testClient.logout()
    .then(() => {
      return testClient.executePipeline([{action: 'literal', args: {items: [{x: {'$oid': hexStr}}]}}])
    })
    .then(() => {
      done(new Error('Error should have been triggered, but was not'))
    })
    .catch((e) => {
      done()
    })
  })
})

describe('pipeline execution', () => {
  const hexStr = '5899445b275d3ebe8f2ab8c0'

  beforeAll(() => {
    const mb = new MockBrowser()
    global.window = mb.getWindow()
  })
  afterAll(() => {
    delete global.window
  })

  describe('extended json decode (incoming)', () => {
    beforeAll(() => {
      fetchMock.restore()
      fetchMock.post('https://baas-dev.10gen.cc/v1/app/testapp/auth/local/userpass', {user: {'_id': '5899445b275d3ebe8f2ab8a6'}})
      fetchMock.post('https://baas-dev.10gen.cc/v1/app/testapp/pipeline', (url, opts) => {
        let out = JSON.stringify({result: [{x: {'$oid': hexStr}}]})
        return out
      })
    })

    it('should decode extended json from pipeline responses', () => {
      var testClient = new BaasClient('testapp')
      return testClient.authManager.localAuth('user', 'password', true)
      .then(() => {
        return testClient.executePipeline([{action: 'literal', args: {items: [{x: {'$oid': hexStr}}]}}])
      })
      .then((response) => {
        const ejson = new EJSON()
        return expect(response.result[0].x).toEqual(ejson.bson.ObjectID(hexStr))
      })
    })

    it('should allow overriding the decoder implementation', () => {
      var testClient = new BaasClient('testapp')
      return testClient.authManager.localAuth('user', 'password', true)
      .then(() => {
        return testClient.executePipeline([{action: 'literal', args: {items: [{x: {'$oid': hexStr}}]}}], {decoder: JSON.parse})
      })
      .then((response) => {
        return expect(response.result[0].x).toEqual({'$oid': hexStr})
      })
    })
  })

  describe('extended json encode (outgoing)', () => {
    let requestOpts
    beforeAll(() => {
      fetchMock.restore()
      fetchMock.post('https://baas-dev.10gen.cc/v1/app/testapp/auth/local/userpass', {user: {'_id': hexStr}})
      fetchMock.post('https://baas-dev.10gen.cc/v1/app/testapp/pipeline', (url, opts) => {
        // TODO there should be a better way to capture request payload for
        // using in an assertion without doing this.
        requestOpts = opts
        return {result: [{x: {'$oid': hexStr}}]}
      })
    })

    it('should encode objects to extended json for outgoing pipeline request body', () => {
      const ejson = new EJSON()
      var requestBodyObj = {action: 'literal', args: {items: [{x: ejson.bson.ObjectID(hexStr)}]}}
      var requestBodyExtJSON = {action: 'literal', args: {items: [{x: {'$oid': hexStr}}]}}
      var testClient = new BaasClient('testapp', {baseUrl: ''})
      return testClient.authManager.localAuth('user', 'password', true).then((a) => {
        return testClient.executePipeline([requestBodyObj])
      })
      .then((response) => {
        return Promise.all([
          expect(JSON.parse(requestOpts.body)).toEqual([requestBodyExtJSON])
        ])
      })
    })
  })
})
