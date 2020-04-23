import { EventSubscription, EventSubscriptionResumeOptions, ResourceType } from '../src/api/v3/EventSubscriptions';
import { AppFunction } from '../src/api/v3/Functions';
import { ServiceDesc } from '../src/api/v3/Services';

import RealmMongoFixture from './fixtures/realm_mongo_fixture';
import { buildAdminTestHarness, extractTestFixtureDataPoints } from './testutil';

const testEventSubscriptionName = 'eventSubscriptionA';

function createSampleFunction(functions) {
  return functions.create(
    new AppFunction({
      name: 'myFunction',
      source: 'exports = () => {}',
    })
  );
}

function createSampleMongodbService(services) {
  return services.create(
    new ServiceDesc({
      type: 'mongodb',
      name: 'mdb',
      config: {
        uri: 'mongodb://localhost:26000',
      },
    })
  );
}

function buildEventSubscriptionData(functionId) {
  return new EventSubscription({
    name: testEventSubscriptionName,
    type: ResourceType.AuthEvent,
    disabled: true,
    functionId,
    config: {
      operation_type: 'LOGIN',
      providers: ['api-key'],
    },
  });
}

function buildDBEventSubscriptionData(functionId, mongodbServiceId) {
  return new EventSubscription({
    name: testEventSubscriptionName,
    type: ResourceType.Database,
    disabled: true,
    functionId,
    config: {
      database: 'db',
      collection: 'col',
      operation_types: ['INSERT'],
      service_id: mongodbServiceId,
    },
  });
}

function comparePartialEventSubscription({ id, name, type, disabled, functionId }) {
  return { id, name, type, disabled, functionId };
}

function compareFullEventSubscription({ id, name, type, disabled, functionId, config }) {
  return { id, name, type, disabled, functionId, config };
}

describe('Event Subscriptions', () => {
  const test = new RealmMongoFixture();
  let th;
  let eventSubscriptions;
  let functions;
  let services;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async () => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
    eventSubscriptions = th.app().eventSubscriptions();
    functions = th.app().functions();
    services = th.app().services();
  });

  afterEach(async () => th.cleanup());

  it('listing event subscriptions should return an empty list', async () => {
    const subscriptions = await eventSubscriptions.list();
    expect(subscriptions).toEqual([]);
  });

  it('creating an event subscription should make it appear in list', async () => {
    const fn = await createSampleFunction(functions);
    const eventSubscription = await eventSubscriptions.create(buildEventSubscriptionData(fn.id));
    expect(eventSubscription.name).toEqual(testEventSubscriptionName);
    const subscriptions = await eventSubscriptions.list();
    expect(subscriptions).toHaveLength(1);
    expect(comparePartialEventSubscription(subscriptions[0])).toEqual(
      comparePartialEventSubscription(eventSubscription)
    );
  });

  it('fetching an event subscription returns the full model', async () => {
    const fn = await createSampleFunction(functions);
    const eventSubscriptionData = buildEventSubscriptionData(fn.id);
    const eventSubscription = await eventSubscriptions.create(eventSubscriptionData);
    const subscription = await eventSubscriptions.eventSubscription(eventSubscription.id).get();
    expect(compareFullEventSubscription(subscription)).toEqual(
      new EventSubscription({
        ...eventSubscriptionData,
        id: eventSubscription.id,
      })
    );
  });

  it('can update an event subscription', async () => {
    const fn = await createSampleFunction(functions);

    const eventSubscriptionData = buildEventSubscriptionData(fn.id);
    const eventSubscription = await eventSubscriptions.create(eventSubscriptionData);

    const updatedEventSubscriptionData = new EventSubscription({
      ...eventSubscriptionData,
      disabled: false,
      config: {
        operation_type: 'CREATE',
        providers: ['api-key'],
      },
    });

    await eventSubscriptions.eventSubscription(eventSubscription.id).update(updatedEventSubscriptionData);

    const eventSubscriptionUpdated = await eventSubscriptions.eventSubscription(eventSubscription.id).get();
    expect(compareFullEventSubscription(eventSubscriptionUpdated)).toEqual(
      new EventSubscription({
        ...eventSubscriptionData,
        id: eventSubscription.id,
        disabled: false,
        config: {
          operation_type: 'CREATE',
          providers: ['api-key'],
        },
      })
    );
  });

  it('can resume an event subscription', async () => {
    const fn = await createSampleFunction(functions);
    const mongodbService = await createSampleMongodbService(services);

    const eventSubscriptionData = buildDBEventSubscriptionData(fn.id, mongodbService.id);
    const eventSubscription = await eventSubscriptions.create(eventSubscriptionData);

    const resumedSubscription = await eventSubscriptions
      .eventSubscription(eventSubscription.id)
      .resume(new EventSubscriptionResumeOptions({ disableToken: false }));
    expect(resumedSubscription.status).toEqual(204);
  });

  it('can delete an event subscription', async () => {
    const fn = await createSampleFunction(functions);
    const eventSubscription = await eventSubscriptions.create(buildEventSubscriptionData(fn.id));
    await eventSubscriptions.eventSubscription(eventSubscription.id).remove();
    const subscriptions = await eventSubscriptions.list();
    expect(subscriptions).toEqual([]);
  });
});
