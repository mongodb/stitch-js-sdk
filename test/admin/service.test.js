const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');

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
