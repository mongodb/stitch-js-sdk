const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');

import { buildAdminTestHarness, extractTestFixtureDataPoints } from '../testutil';

const testEventSubscriptionName = 'eventSubscriptionA';

function createSampleFunction(functions) {
  return functions.create({
    name: 'myFunction',
    source: 'exports = () => {}'
  });
}

function buildEventSubscriptionData(functionId) {
  return {
    name: testEventSubscriptionName,
    type: 'AUTHENTICATION',
    disabled: true,
    function_id: functionId,
    config: {
      action_type: 'LOGIN',
      provider: 'api-key'
    }
  };
}

describe('Event Subscriptions', ()=>{
  let test = new StitchMongoFixture();
  let th;
  let eventSubscriptions;
  let functions;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async() => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
    eventSubscriptions = th.app().eventSubscriptions();
    functions = th.app().functions();
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
    expect(subscriptions[0]).toEqual(eventSubscription);
  });

  it('fetching an event subscription returns the full model', async() => {
    const fn = await createSampleFunction(functions);
    const eventSubscriptionData = buildEventSubscriptionData(fn._id);
    const eventSubscription = await eventSubscriptions.create(eventSubscriptionData);
    const subscription = await eventSubscriptions.eventSubscription(eventSubscription._id).get();
    expect(subscription).toEqual(
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
          action_type: 'CREATE'
        }
      }
    );

    await eventSubscriptions.eventSubscription(eventSubscription._id).update(updatedEventSubscriptionData);
    const eventSubscriptionUpdated = await eventSubscriptions.eventSubscription(eventSubscription._id).get();
    expect(eventSubscriptionUpdated).toEqual(
      Object.assign(
        { _id: eventSubscription._id },
        eventSubscriptionData,
        {
          disabled: false,
          config: {
            action_type: 'CREATE',
            provider: ''
          }
        }
      )
    );
  });

  it('can delete an event subscription', async() => {
    const fn = await createSampleFunction(functions);
    const eventSubscription = await eventSubscriptions.create(buildEventSubscriptionData(fn._id));
    await eventSubscriptions.eventSubscription(eventSubscription._id).remove();
    const subscriptions = await eventSubscriptions.list();
    expect(subscriptions).toEqual([]);
  });
});
