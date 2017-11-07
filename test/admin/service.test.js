const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');
const stitch = require('../../src');

const TEST_DB = 'mongosvccommandtest';
const TESTNS1 = 'documents';
const TESTNS2 = 'documents2';

import {getAuthenticatedClient} from '../testutil';

describe('Services V2', ()=>{
  let test = new StitchMongoFixture();
  let services;
  let app;
  let apps;
  beforeAll(() => test.setup());
  afterAll(() => test.teardown());
  beforeEach(async () =>{
    let adminClient = await getAuthenticatedClient(test.userData.apiKey.key);
    test.groupId = test.userData.group.groupId;
    apps = await adminClient.v2().apps(test.groupId);
    app = await apps.create({name: 'testname'});
    services = adminClient.v2().apps(test.groupId).app(app._id).services();
  });
  afterEach(async () => {
    await apps.app(app._id).remove();
  });

  it('listing services should return empty list', async () => {
    let svcs = await services.list();
    expect(svcs).toEqual([]);
  });
  it('creating service should work', async () => {
    let newSvc = await services.create({name: 'testsvc', type: 'http'});
    expect(newSvc.name).toEqual('testsvc');
    let svcs = await services.list();
    expect(svcs).toHaveLength(1);
    expect(svcs[0].name).toEqual(newSvc.name);
  });
  it('invalid create requests should fail', async () => {
    await expect(services.create({name: 'testsvc', type: 'invalid-svc'})).rejects.toBeDefined();
    await expect(services.create({name: 'bad#name', type: 'invalid-svc'})).rejects.toBeDefined();
  });
  it('fetching service should work', async () => {
    let newSvc = await services.create({name: 'testsvc', type: 'http'});
    expect(newSvc.name).toEqual('testsvc');
    let svc = await services.service(newSvc._id).get();
    expect(svc.name).toEqual(newSvc.name);
  });
  it('deleting service should work', async () => {
    let newSvc = await services.create({name: 'testsvc', type: 'http'});
    let svcs = await services.list();
    expect(svcs).toHaveLength(1);
    await services.service(newSvc._id).remove();
    svcs = await services.list();
    expect(svcs).toHaveLength(0);
  });
  it('fetching service config should work', async () => {
    let newSvc = await services.create({ name: 'testsvc', type: 'aws-ses', config: testConfig });
    let svcConfig = await services.service(newSvc._id).config().get();
    expect(svcConfig).toEqual({'accessKeyId': 'testAccessKeyId', 'region': 'us-east-1'});
  });
  it('running service commands should work', async () => {
    // Set up auth and a mongodb service so we can insert some test documents.
    let appObj = test.admin.v2().apps(test.userData.group.groupId).app(app._id);
    let providers = await appObj.authProviders().list();
    await appObj.authProviders().authProvider(providers[0]._id).enable();
    let newKey = await appObj.apiKeys().create({name: 'test'});
    let client = new stitch.StitchClient(app.client_app_id, {baseUrl: test.options.baseUrl});
    await client.authenticate('apiKey', newKey.key);  
    let newSvc = await services.create({ name: 'testsvc', type: 'mongodb', config: {uri: 'mongodb://localhost:26000'}})

    // Create rules so we can insert documents into two new collections.
    let mongoSvcObj = services.service(newSvc._id)
    let testRuleConfig = {
      read: {'%%true': true},
      write: {'%%true': true},
      valid: {'%%true': true},
      fields: {_id: {}, a: {}, b: {}, c: {} }
    };
    await mongoSvcObj.rules().create(
      Object.assign({}, testRuleConfig, {name: 'testRule', namespace: `${TEST_DB}.${TESTNS1}`})
    );
    await mongoSvcObj.rules().create(
      Object.assign({}, testRuleConfig, {name: 'testRule2', namespace: `${TEST_DB}.${TESTNS2}`})
    );
    test.registerTestNamespace(TEST_DB, TESTNS1);
    test.registerTestNamespace(TEST_DB, TESTNS2);

    let clientSvcObj = client.service('mongodb', 'testsvc');
    let db = clientSvcObj.db(TEST_DB);

    // Insert documents in these two test collections
    let response1 = await db.collection(TESTNS1).insertOne({ a: 1 });
    let response2 = await db.collection(TESTNS2).insertOne({ a: 1 });

    expect(response1.insertedIds).toHaveLength(1);
    expect(response2.insertedIds).toHaveLength(1);

    // Verify that these collections exist, and verify that the mongodb service commands work as expected
    let dbNames = await mongoSvcObj.runCommand("list_databases", {});
    expect(dbNames).toContain(TEST_DB);
    expect(dbNames).not.toContain("admin");
    expect(dbNames).not.toContain("local");

    let collNames = await mongoSvcObj.runCommand("list_collections", {database_name: TEST_DB});
    expect(collNames).toHaveLength(2)
    expect(collNames).toContain(TESTNS1)
    expect(collNames).toContain(TESTNS2)

    let collNamesEmpty = await mongoSvcObj.runCommand("list_collections", {database_name: "$this-db-doesnt-exist"})
    expect(collNamesEmpty).toHaveLength(0)
  })

  const testConfig = {
    'region': 'us-east-1',
    'accessKeyId': 'testAccessKeyId',
    'secretAccessKey': 'testSecretAccessKey'
  };

  it('fetching service config should work', async () => {
    let newSvc = await services.create({ name: 'testsvc', type: 'aws-ses', config: testConfig });
    let svcConfig = await services.service(newSvc._id).config().get();
    expect(svcConfig).toEqual({'accessKeyId': 'testAccessKeyId', 'region': 'us-east-1'});
  });
  it('updating service config should work', async () => {
    let newSvc = await services.create({ name: 'testsvc', type: 'aws-ses', config: testConfig });
    let svcConfig = await services.service(newSvc._id).config().update({
      region: 'us-west-1',
      secretAccessKey: 'testkeyupdated'
    });
    svcConfig = await services.service(newSvc._id).config().get();
    expect(svcConfig).toEqual({'accessKeyId': 'testAccessKeyId', 'region': 'us-west-1'});
  });
  it('updating with invalid config should fail', async () => {
    let newSvc = await services.create({ name: 'testsvc', type: 'aws-ses', config: testConfig });
    await expect(services.service(newSvc._id).config().update({
      region: '',
      secretAccessKey: ''
    })).rejects.toBeDefined();
  });

  it('listing rules for a service should work', async ()=> {
    let newSvc = await services.create({ name: 'testsvc', type: 'aws-ses', config: testConfig });
    let rules = await services.service(newSvc._id).rules().list();
    expect(rules).toEqual([]);
  });

  const testRule = { name: 'foo', actions: ['send'], when: {} };
  it('creating rule should work', async ()=> {
    let newSvc = await services.create({ name: 'testsvc', type: 'aws-ses', config: testConfig });
    let rules = await services.service(newSvc._id).rules().list();
    expect(rules).toEqual([]);
    let newRule = await services.service(newSvc._id).rules().create(testRule);
    rules = await services.service(newSvc._id).rules().list();
    expect(rules).toHaveLength(1);
    expect(rules[0]._id).toEqual(newRule._id);
    expect(rules[0].name).toEqual(newRule.name);
  });
  it('fetching rule should work', async ()=> {
    let newSvc = await services.create({ name: 'testsvc', type: 'aws-ses', config: testConfig });
    let newRule = await services.service(newSvc._id).rules().create(testRule);
    let fetchedRule = await services.service(newSvc._id).rules().rule(newRule._id).get();
    expect(fetchedRule._id).toEqual(newRule._id);
    expect(fetchedRule.name).toEqual(newRule.name);
  });
  it('updating rule should work', async ()=> {
    let newSvc = await services.create({ name: 'testsvc', type: 'aws-ses', config: testConfig });
    let newRule = await services.service(newSvc._id).rules().create(testRule);
    let updatedRule = Object.assign({}, testRule, {_id: newRule._id}, {when: {x: 'y'}});
    await services.service(newSvc._id).rules().rule(newRule._id).update(updatedRule);
    let fetchedRule = await services.service(newSvc._id).rules().rule(newRule._id).get();
    expect(fetchedRule).toEqual(Object.assign({}, newRule, updatedRule));
  });
});
