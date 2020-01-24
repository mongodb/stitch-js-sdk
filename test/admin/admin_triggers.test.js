const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');
import { buildAdminTestHarness, extractTestFixtureDataPoints } from '../testutil';
import { StitchError, ErrUnauthorized } from '../../src/errors';

function createSampleFunction(functions) {
  return functions.create({
    name: 'myFunction',
    source: 'exports = () => {}'
  });
}

function createSampleMongodbService(services) {
  return services.create({
    type: 'mongodb',
    name: 'mdb',
    config: {
      uri: 'mongodb://localhost:26000'
    }
  });
}

function buildEventSubscriptionData(name, disabled, functionId, mongodbServiceId) {
  return {
    name,
    type: 'DATABASE',
    disabled,
    function_id: functionId,
    config: {
      database: 'db',
      collection: 'col',
      operation_types: ['INSERT'],
      service_id: mongodbServiceId
    }
  };
}

function comparePrivateAdminTriggersList(actualAdminTriggers, expectedAdminTriggers) {
  expect(actualAdminTriggers).toHaveLength(expectedAdminTriggers.length);

  actualAdminTriggers.forEach((actualAdminTrigger, index) => {
    const expectedAdminTrigger = expectedAdminTriggers[index];
    expect(actualAdminTrigger.name).toBe(expectedAdminTrigger.name);
    expect(actualAdminTrigger.type).toBe(expectedAdminTrigger.type);
    expect(actualAdminTrigger.status).toBe(expectedAdminTrigger.status);
  });
}

describe('privateAdminTriggers', () => {
  let test = new StitchMongoFixture({ userRoles: ['GLOBAL_OWNER'] });
  let th;
  let eventSubscriptions;
  let functions;
  let services;
  let privateAdminTriggers;

  beforeAll(() => test.setup(true));
  afterAll(() => test.teardown());

  beforeEach(async() => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
    eventSubscriptions = th.app().eventSubscriptions();
    functions = th.app().functions();
    services = th.app().services();
    privateAdminTriggers = th.privateAdminTriggers();
  });

  afterEach(async() => th.cleanup());

  it('should return all triggers belonging to the app when list is called', async() => {
    const fn = await createSampleFunction(functions);
    const mongodbService = await createSampleMongodbService(services);

    const eventSubscriptionName1 = 'testAdminTriggers1';
    const eventSubscriptionName2 = 'testAdminTriggers2';

    await eventSubscriptions.create(buildEventSubscriptionData(eventSubscriptionName1, false, fn._id, mongodbService._id));
    await eventSubscriptions.create(buildEventSubscriptionData(eventSubscriptionName2, true, fn._id, mongodbService._id));

    const expectedPrivateAdminTriggers = [{ name: eventSubscriptionName1, type: 'DATABASE', state: 'UNOWNED'}, { name: eventSubscriptionName2, type: 'DATABASE', state: 'DISABLED'}];
    const privateAdminTriggersList = await privateAdminTriggers.list();

    comparePrivateAdminTriggersList(privateAdminTriggersList, expectedPrivateAdminTriggers);
  });

  it('should return an empty list when list is called and no triggers belong to the app', async() => {
    const privateAdminTriggersList = await privateAdminTriggers.list();
    expect(privateAdminTriggersList).toEqual([]);
  });

  it('should return a specific trigger when get is called', async() => {
    const fn = await createSampleFunction(functions);
    const mongodbService = await createSampleMongodbService(services);

    const eventSubscriptionName = 'testAdminTriggers';
    const eventSubscription = await eventSubscriptions.create(buildEventSubscriptionData(eventSubscriptionName, false, fn._id, mongodbService._id));

    const privateAdminTriggersGet = await privateAdminTriggers.get(eventSubscription._id);
    expect(privateAdminTriggersGet.name).toBe(eventSubscriptionName);
    expect(privateAdminTriggersGet.type).toBe('DATABASE');
    expect(privateAdminTriggersGet.state).toBe('UNOWNED');
  });

  it('should throw an error when get is called and the trigger does not exist', async() => {
    await expect(privateAdminTriggers.get('1234')).rejects.toEqual(new StitchError('must provide valid trigger id (1234): invalid ObjectId', ErrUnauthorized));
  });
});
