import { APIKey } from '../src/api/v3/APIKeys';
import { IncomingWebhook } from '../src/api/v3/IncomingWebhooks';
import { BuiltinRule, MongoDBRule } from '../src/api/v3/Rules';
import { ServiceDesc } from '../src/api/v3/Services';

import RealmMongoFixture from './fixtures/realm_mongo_fixture';
import { buildAdminTestHarness, extractTestFixtureDataPoints } from './testutil';

import { StitchClientFactory } from 'mongodb-stitch';

const TEST_DB = Math.random().toString(16).substring(2);
const TESTNS1 = Math.random().toString(16).substring(2);
const TESTNS2 = Math.random().toString(16).substring(2);

describe('Services', () => {
  const test = new RealmMongoFixture();
  let th;
  let services;

  const testConfig = {
    region: 'us-east-1',
    accessKeyId: 'testAccessKeyId',
    secretAccessKey: 'testSecretAccessKey',
  };

  beforeAll(async () => test.setup());
  afterAll(async () => test.teardown());

  beforeEach(async () => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
    services = th.app().services();
  });

  afterEach(async () => th.cleanup());

  it('listing services should return empty list', async () => {
    const svcs = await services.list();
    expect(svcs).toEqual([]);
  });
  it('creating service should work', async () => {
    const newSvc = await services.create(new ServiceDesc({ name: 'testsvc', type: 'http' }));
    expect(newSvc.name).toEqual('testsvc');
    const svcs = await services.list();
    expect(svcs).toHaveLength(1);
    expect(svcs[0].name).toEqual(newSvc.name);
  });
  it('invalid create requests should fail', async () => {
    await expect(services.create(new ServiceDesc({ name: 'testsvc', type: 'invalid-svc' }))).rejects.toBeDefined();
    await expect(services.create(new ServiceDesc({ name: 'bad#name', type: 'invalid-svc' }))).rejects.toBeDefined();
  });
  it('fetching service should work', async () => {
    const newSvc = await services.create(new ServiceDesc({ name: 'testsvc', type: 'http' }));
    expect(newSvc.name).toEqual('testsvc');
    const svc = await services.service(newSvc.id).get();
    expect(svc.name).toEqual(newSvc.name);
  });
  it('deleting service should work', async () => {
    const newSvc = await services.create(new ServiceDesc({ name: 'testsvc', type: 'http' }));
    let svcs = await services.list();
    expect(svcs).toHaveLength(1);
    await services.service(newSvc.id).remove();
    svcs = await services.list();
    expect(svcs).toHaveLength(0);
  });
  it('fetching service config should work', async () => {
    const newSvc = await services.create(
      new ServiceDesc({
        name: 'testsvc',
        type: 'aws-ses',
        config: testConfig,
      })
    );
    const svcConfig = await services.service(newSvc.id).config().get();
    expect(svcConfig).toEqual({
      accessKeyId: 'testAccessKeyId',
      region: 'us-east-1',
    });
  });
  it('running service commands should work', async () => {
    // Set up auth and a mongodb service so we can insert some test documents.
    const appObj = test.admin.apps(test.userData.group.groupId).app(th.testApp.id);
    const providers = await appObj.authProviders().list();
    await appObj.authProviders().authProvider(providers[0].id).enable();
    const newKey = await appObj.apiKeys().create(new APIKey({ name: 'test' }));
    const client = await StitchClientFactory.create(th.testApp.clientAppId, {
      baseUrl: test.options.baseUrl,
    });
    await client.authenticate('apiKey', newKey.key);
    const newSvc = await services.create(
      new ServiceDesc({
        name: 'testsvc',
        type: 'mongodb',
        config: { uri: 'mongodb://localhost:26000' },
      })
    );

    // Create rules so we can insert documents into two new collections.
    const mongoSvcObj = services.service(newSvc.id);
    await mongoSvcObj.rules().create(
      new MongoDBRule({
        database: TEST_DB,
        collection: TESTNS1,
      })
    );
    await mongoSvcObj.rules().create(
      new MongoDBRule({
        database: TEST_DB,
        collection: TESTNS2,
      })
    );
    test.registerTestNamespace(TEST_DB, TESTNS1);
    test.registerTestNamespace(TEST_DB, TESTNS2);

    const db = test.mongo.db(TEST_DB);

    // Insert documents in these two test collections
    const response1 = await db.collection(TESTNS1).insertOne({ a: 1 });
    const response2 = await db.collection(TESTNS2).insertOne({ a: 1 });

    expect(response1.insertedCount).toEqual(1);
    expect(response2.insertedCount).toEqual(1);

    // Verify that these collections exist, and verify that the mongodb service commands work as expected
    const dbNames = await mongoSvcObj.runCommand('list_databases', {});
    expect(dbNames).toContain(TEST_DB);
    expect(dbNames).not.toContain('admin');
    expect(dbNames).not.toContain('local');

    const collNames = await mongoSvcObj.runCommand('list_collections', {
      database_name: TEST_DB,
    });
    expect(collNames).toHaveLength(2);
    expect(collNames).toContain(TESTNS1);
    expect(collNames).toContain(TESTNS2);

    const collNamesEmpty = await mongoSvcObj.runCommand('list_collections', {
      database_name: '$this-db-doesnt-exist',
    });
    expect(collNamesEmpty).toHaveLength(0);
  });

  it('fetching service config should work', async () => {
    const newSvc = await services.create(
      new ServiceDesc({
        name: 'testsvc',
        type: 'aws-ses',
        config: testConfig,
      })
    );
    const svcConfig = await services.service(newSvc.id).config().get();
    expect(svcConfig).toEqual({
      accessKeyId: 'testAccessKeyId',
      region: 'us-east-1',
    });
  });
  it('updating service config should work', async () => {
    const newSvc = await services.create(
      new ServiceDesc({
        name: 'testsvc',
        type: 'aws-ses',
        config: testConfig,
      })
    );
    let svcConfig = await services.service(newSvc.id).config().update({
      region: 'us-west-1',
      secretAccessKey: 'testkeyupdated',
    });
    svcConfig = await services.service(newSvc.id).config().get();
    expect(svcConfig).toEqual({
      accessKeyId: 'testAccessKeyId',
      region: 'us-west-1',
    });
  });
  it('updating with invalid config should fail', async () => {
    const newSvc = await services.create(
      new ServiceDesc({
        name: 'testsvc',
        type: 'aws-ses',
        config: testConfig,
      })
    );
    await expect(
      services.service(newSvc.id).config().update({
        region: '',
        secretAccessKey: '',
      })
    ).rejects.toBeDefined();
  });

  it('listing rules for a service should work', async () => {
    const newSvc = await services.create(
      new ServiceDesc({
        name: 'testsvc',
        type: 'aws-ses',
        config: testConfig,
      })
    );
    const rules = await services.service(newSvc.id).rules().list();
    expect(rules).toEqual([]);
  });

  const testRule = new BuiltinRule({
    name: 'foo',
    actions: ['send'],
    when: {},
  });
  it('creating rule should work', async () => {
    const newSvc = await services.create(
      new ServiceDesc({
        name: 'testsvc',
        type: 'aws-ses',
        config: testConfig,
      })
    );
    let rules = await services.service(newSvc.id).rules().list();
    expect(rules).toEqual([]);
    const newRule = await services.service(newSvc.id).rules().create(testRule);
    rules = await services.service(newSvc.id).rules().list();
    expect(rules).toHaveLength(1);
    expect(rules[0].id).toEqual(newRule.id);
    expect(rules[0].name).toEqual(newRule.name);
  });
  it('fetching rule should work', async () => {
    const newSvc = await services.create(
      new ServiceDesc({
        name: 'testsvc',
        type: 'aws-ses',
        config: testConfig,
      })
    );
    const newRule = await services.service(newSvc.id).rules().create(testRule);
    const fetchedRule = await services.service(newSvc.id).rules().rule(newRule.id).get();
    expect(fetchedRule.id).toEqual(newRule.id);
    expect(fetchedRule.name).toEqual(newRule.name);
  });
  it('updating rule should work', async () => {
    const newSvc = await services.create(
      new ServiceDesc({
        name: 'testsvc',
        type: 'aws-ses',
        config: testConfig,
      })
    );
    const newRule = await services.service(newSvc.id).rules().create(testRule);
    const updatedRule = new BuiltinRule({
      ...testRule,
      id: newRule.id,
      when: { '%%true': true },
    });
    await services.service(newSvc.id).rules().rule(newRule.id).update(updatedRule);
    const fetchedRule = await services.service(newSvc.id).rules().rule(newRule.id).get();
    expect(fetchedRule).toEqual({ ...newRule, ...updatedRule });
  });
  it('removing rule should work', async () => {
    const newSvc = await services.create(
      new ServiceDesc({
        name: 'testsvc',
        type: 'aws-ses',
        config: testConfig,
      })
    );
    const newRule = await services.service(newSvc.id).rules().create(testRule);
    let rules = await services.service(newSvc.id).rules().list();
    expect(rules).toHaveLength(1);
    await services.service(newSvc.id).rules().rule(newRule.id).remove();
    rules = await services.service(newSvc.id).rules().list();
    expect(rules).toEqual([]);
  });

  it('listing incoming webhooks for a service should work', async () => {
    const newSvc = await services.create(new ServiceDesc({ name: 'testsvc', type: 'http' }));
    const webhooks = await services.service(newSvc.id).incomingWebhooks().list();
    expect(webhooks).toEqual([]);
  });

  const testWebhook = new IncomingWebhook({
    name: 'testhook',
    functionSource: 'exports = function() { return "hello world" }',
    respondResult: true,
    options: {
      secret: '12345',
      validationMethod: 'SECRET_AS_QUERY_PARAM',
    },
  });

  it('creating an incoming webhook should work', async () => {
    const newSvc = await services.create(new ServiceDesc({ name: 'testsvc', type: 'http' }));
    let webhooks = await services.service(newSvc.id).incomingWebhooks().list();
    expect(webhooks).toEqual([]);

    const newWebhook = await services.service(newSvc.id).incomingWebhooks().create(testWebhook);
    webhooks = await services.service(newSvc.id).incomingWebhooks().list();
    expect(webhooks).toHaveLength(1);
    expect(webhooks[0].id).toEqual(newWebhook.id);
    expect(webhooks[0].name).toEqual(newWebhook.name);
  });

  it('fetching an incoming webhook should work', async () => {
    const newSvc = await services.create(new ServiceDesc({ name: 'testsvc', type: 'http' }));
    const newWebhook = await services.service(newSvc.id).incomingWebhooks().create(testWebhook);
    const fetchedWebhook = await services.service(newSvc.id).incomingWebhooks().incomingWebhook(newWebhook.id).get();
    expect(fetchedWebhook.id).toEqual(newWebhook.id);
    expect(fetchedWebhook.name).toEqual(newWebhook.name);
  });

  it('updating an incoming webhook should work', async () => {
    const newSvc = await services.create(new ServiceDesc({ name: 'testsvc', type: 'http' }));
    const newWebhook = await services.service(newSvc.id).incomingWebhooks().create(testWebhook);

    const updatedWebhook = new IncomingWebhook({
      ...testWebhook,
      id: newWebhook.id,

      runAsUserId: '0',
      runAsUserIdScriptSource: '',
    });
    await services.service(newSvc.id).incomingWebhooks().incomingWebhook(newWebhook.id).update(updatedWebhook);

    const fetchedWebhook = await services.service(newSvc.id).incomingWebhooks().incomingWebhook(newWebhook.id).get();

    const expectedWebhookWithUpdates = { ...newWebhook, ...updatedWebhook };
    expect(fetchedWebhook.id).toEqual(expectedWebhookWithUpdates.id);
    expect(fetchedWebhook.name).toEqual(expectedWebhookWithUpdates.name);
    expect(fetchedWebhook.functionSource).toEqual(expectedWebhookWithUpdates.functionSource);
    expect(fetchedWebhook.options).toEqual(expectedWebhookWithUpdates.options);
    expect(fetchedWebhook.respondResult).toEqual(expectedWebhookWithUpdates.respondResult);
    expect(fetchedWebhook.runAsUserId).toEqual(expectedWebhookWithUpdates.runAsUserId);
    expect(fetchedWebhook.runAsUserIdScriptSource).toEqual(expectedWebhookWithUpdates.runAsUserIdScriptSource);
  });

  it('removing an incoming webhook should work', async () => {
    const newSvc = await services.create(new ServiceDesc({ name: 'testsvc', type: 'http' }));
    const newWebhook = await services.service(newSvc.id).incomingWebhooks().create(testWebhook);
    let webhooks = await services.service(newSvc.id).incomingWebhooks().list();
    expect(webhooks).toHaveLength(1);
    await services.service(newSvc.id).incomingWebhooks().incomingWebhook(newWebhook.id).remove();
    webhooks = await services.service(newSvc.id).incomingWebhooks().list();
    expect(webhooks).toEqual([]);
  });
});
