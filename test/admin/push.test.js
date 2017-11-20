const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');

import { buildAdminTestHarness, extractTestFixtureDataPoints } from '../testutil';

describe('Push Notifications', () => {
  let test = new StitchMongoFixture();
  let th;
  let pushNotifications;

  beforeAll(() => test.setup({ createApp: false }));
  afterAll(() => test.teardown());

  beforeEach(async() => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
    pushNotifications = th.app().pushNotifications();
  });

  afterEach(async() => th.cleanup());

  const MSG_STATE_DRAFT = 'draft';
  const MSG_STATE_SENT = 'sent';
  const testNotification = {
    state: MSG_STATE_DRAFT,
    message: 'this is a test notification.',
    label: 'test',
    topic: 'notifications'
  };

  it('listing draft push notifications should return empty list', async() => {
    let notifications = await pushNotifications.list({ state: MSG_STATE_DRAFT });
    expect(notifications).toHaveLength(0);
  });

  it('listing sent push notifications should return empty list', async() => {
    let notifications = await pushNotifications.list({ state: MSG_STATE_SENT });
    expect(notifications).toHaveLength(0);
  });

  it('listing invalid push notifications should fail', async() => {
    await expect(pushNotifications.list({ state: 'invalid' })).rejects.toBeDefined();
  });

  it('creating push notifications should work', async() => {
    let newNotification = await pushNotifications.create(testNotification);
    expect(newNotification.state).toEqual(MSG_STATE_DRAFT);

    let notifications = await pushNotifications.list({ state: MSG_STATE_DRAFT });
    expect(notifications).toHaveLength(1);
    expect(notifications[0].state).toEqual(MSG_STATE_DRAFT);
  });

  it('invalid create requests should fail', async() => {
    await expect(pushNotifications.create({ state: '' })).rejects.toBeDefined();
  });

  it('fetching push notification should work', async() => {
    let newNotification = await pushNotifications.create(testNotification);
    expect(newNotification.state).toEqual(MSG_STATE_DRAFT);
    let notification = await pushNotifications.pushNotification(newNotification._id).get();
    expect(notification.state).toEqual(newNotification.state);
  });

  it('updating push notification should work', async() => {
    let newNotification = await pushNotifications.create(testNotification);
    expect(newNotification.message).toEqual(testNotification.message);
    newNotification.message = 'updated';
    await pushNotifications.pushNotification(newNotification._id).update(newNotification);
    let updatedNotification = await pushNotifications.pushNotification(newNotification._id).get();
    expect(updatedNotification.message).toEqual('updated');
  });

  it('deleting push notification should work', async() => {
    let newNotification = await pushNotifications.create(testNotification);
    let notifications = await pushNotifications.list({ state: MSG_STATE_DRAFT });
    expect(notifications).toHaveLength(1);
    await pushNotifications.pushNotification(newNotification._id).remove();
    notifications = await pushNotifications.list({ state: MSG_STATE_DRAFT });
    expect(notifications).toHaveLength(0);
  });
});
