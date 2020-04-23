import { SendNotificationRequest } from '../src/api/v3/Push';
import { MessageState } from '../src/api/v3/Push';

import RealmMongoFixture from './fixtures/realm_mongo_fixture';
import { buildAdminTestHarness, extractTestFixtureDataPoints } from './testutil';

describe('Push Notifications', () => {
  const test = new RealmMongoFixture();
  let th;
  let pushNotifications;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async () => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
    pushNotifications = th.app().pushNotifications();
  });

  afterEach(async () => th.cleanup());

  const testNotification = new SendNotificationRequest({
    state: MessageState.Draft,
    message: 'this is a test notification.',
    label: 'test',
    topic: 'notifications',
  });

  it('listing draft push notifications should return empty list', async () => {
    const notifications = await pushNotifications.list(MessageState.Draft);
    expect(notifications).toHaveLength(0);
  });

  it('listing sent push notifications should return empty list', async () => {
    const notifications = await pushNotifications.list(MessageState.Sent);
    expect(notifications).toHaveLength(0);
  });

  it('creating push notifications should work', async () => {
    const newNotification = await pushNotifications.create(testNotification);
    expect(newNotification.state).toEqual(MessageState.Draft);

    const notifications = await pushNotifications.list(MessageState.Draft);
    expect(notifications).toHaveLength(1);
    expect(notifications[0].state).toEqual(MessageState.Draft);
  });

  it('invalid create requests should fail', async () => {
    await expect(pushNotifications.create({ state: '' })).rejects.toBeDefined();
  });

  it('fetching push notification should work', async () => {
    const newNotification = await pushNotifications.create(testNotification);
    expect(newNotification.state).toEqual(MessageState.Draft);
    const notification = await pushNotifications.pushNotification(newNotification.id).get();
    expect(notification.state).toEqual(newNotification.state);
  });

  it('updating push notification should work', async () => {
    const newNotification = await pushNotifications.create(testNotification);
    expect(newNotification.message).toEqual(testNotification.message);
    newNotification.message = 'updated';
    await pushNotifications.pushNotification(newNotification.id).update(newNotification);
    const updatedNotification = await pushNotifications.pushNotification(newNotification.id).get();
    expect(updatedNotification.message).toEqual('updated');
  });

  it('deleting push notification should work', async () => {
    const newNotification = await pushNotifications.create(testNotification);
    let notifications = await pushNotifications.list(MessageState.Draft);
    expect(notifications).toHaveLength(1);
    await pushNotifications.pushNotification(newNotification.id).remove();
    notifications = await pushNotifications.list(MessageState.Draft);
    expect(notifications).toHaveLength(0);
  });
});
