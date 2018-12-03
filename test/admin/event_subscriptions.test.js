const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');

import { buildAdminTestHarness, extractTestFixtureDataPoints } from '../testutil';

const testEventSubscriptionName = 'eventSubscriptionA';

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

function buildEventSubscriptionData(functionId) {
  return {
    name: testEventSubscriptionName,
    type: 'AUTHENTICATION',
    disabled: true,
    function_id: functionId,
    config: {
      operation_type: 'LOGIN',
      providers: ['api-key']
    }
  };
}

function buildDBEventSubscriptionData(functionId, mongodbServiceId) {
  return {
    name: testEventSubscriptionName,
    type: 'DATABASE',
    disabled: true,
    function_id: functionId,
    config: {
      database: 'db',
      collection: 'col',
      operation_types: ['INSERT'],
      service_id: mongodbServiceId
    }
  };
}

function comparePartialEventSubscription({ _id, name, type, disabled, function_id: functionId }) {
  return { _id, name, type, disabled, function_id: functionId };
}

function compareFullEventSubscription({ _id, name, type, disabled, function_id: functionId, config }) {
  return { _id, name, type, disabled, function_id: functionId, config };
}

describe('Event Subscriptions', () =>{
  let test = new StitchMongoFixture();
  let th;
  let eventSubscriptions;
  let functions;
  let services;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async() => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
    eventSubscriptions = th.app().eventSubscriptions();
    functions = th.app().functions();
    services = th.app().services();
  });

  afterEach(async() => th.cleanup());

  it('listing event subscriptions should return an empty list', async() => {
    const subscriptions = await eventSubscriptions.list();
    expect(subscriptions).toEqual([]);
  });

  it('creating an event subscription should make it appear in list', async() => {
    let fn = await createSampleFunction(functions);
    let eventSubscription = await eventSubscriptions.create(buildEventSubscriptionData(fn._id));
    expect(eventSubscription.name).toEqual(testEventSubscriptionName);
    let subscriptions = await eventSubscriptions.list();
    expect(subscriptions).toHaveLength(1);
    expect(comparePartialEventSubscription(subscriptions[0])).toEqual(comparePartialEventSubscription(eventSubscription));
  });

  it('fetching an event subscription returns the full model', async() => {
    const fn = await createSampleFunction(functions);
    const eventSubscriptionData = buildEventSubscriptionData(fn._id);
    const eventSubscription = await eventSubscriptions.create(eventSubscriptionData);
    const subscription = await eventSubscriptions.eventSubscription(eventSubscription._id).get();
    expect(compareFullEventSubscription(subscription)).toEqual(
      Object.assign(
        { _id: eventSubscription._id },
        eventSubscriptionData
      )
    );
  });

  it('can update an event subscription', async() => {
    const fn = await createSampleFunction(functions);

    const eventSubscriptionData = buildEventSubscriptionData(fn._id);
    const eventSubscription = await eventSubscriptions.create(eventSubscriptionData);

    const updatedEventSubscriptionData = Object.assign({},
      eventSubscriptionData,
      {
        disabled: false,
        config: {
          operation_type: 'CREATE',
          providers: ['api-key']
        }
      }
    );

    await eventSubscriptions.eventSubscription(eventSubscription._id).update(updatedEventSubscriptionData);
    const eventSubscriptionUpdated = await eventSubscriptions.eventSubscription(eventSubscription._id).get();
    expect(compareFullEventSubscription(eventSubscriptionUpdated)).toEqual(
      Object.assign(
        { _id: eventSubscription._id },
        eventSubscriptionData,
        {
          disabled: false,
          config: {
            operation_type: 'CREATE',
            providers: ['api-key']
          }
        }
      )
    );
  });

  it('can resume an event subscription', async() => {
    const fn = await createSampleFunction(functions);
    const mongodbService = await createSampleMongodbService(services);

    const eventSubscriptionData = buildDBEventSubscriptionData(fn._id, mongodbService._id);
    const eventSubscription = await eventSubscriptions.create(eventSubscriptionData);

    const resumedSubscription = await eventSubscriptions.eventSubscription(eventSubscription._id).resume({ disable_token: false });
    expect(resumedSubscription.status).toEqual(204);
  });

  it('can delete an event subscription', async() => {
    const fn = await createSampleFunction(functions);
    const eventSubscription = await eventSubscriptions.create(buildEventSubscriptionData(fn._id));
    await eventSubscriptions.eventSubscription(eventSubscription._id).remove();
    const subscriptions = await eventSubscriptions.list();
    expect(subscriptions).toEqual([]);
  });
});
