const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');

import { getAuthenticatedClient } from '../testutil';

describe('Push Notifications V2', () => {
  let test = new StitchMongoFixture();
  let pushNotifications;
  let app;
  let apps;
  beforeAll(() => test.setup({ createApp: false }));
  afterAll(() => test.teardown());
  beforeEach(async () => {
    let adminClient = await getAuthenticatedClient(test.userData.apiKey.key);
    test.groupId = test.userData.group.groupId;
    apps = await adminClient.v2().apps(test.groupId);
    app = await apps.create({ name: 'testname' });
    pushNotifications = adminClient
      .v2()
      .apps(test.groupId)
      .app(app._id)
      .pushNotifications();
  });
  afterEach(async () => {
    await apps.app(app._id).remove();
  });

  const DRAFT_TYPE = 'draft';
  const SENT_TYPE = 'sent';
  const testNotification = {
    type: DRAFT_TYPE,
    message: 'this is a test notification.',
    label: 'test',
    topic: 'v2'
  };

  it('listing draft push notifications should return empty list', async () => {
    let notifications = await pushNotifications.list(DRAFT_TYPE);
    expect(notifications).toHaveLength(0);
  });

  it('listing sent push notifications should return empty list', async () => {
    let notifications = await pushNotifications.list(SENT_TYPE);
    expect(notifications).toHaveLength(0);
  });

  it('listing invalid push notifications should fail', async () => {
    await expect(pushNotifications.list('invalid')).rejects.toBeDefined();
  });

  it('creating push notifications should work', async () => {
    let newNotification = await pushNotifications.create(testNotification);
    expect(newNotification.type).toEqual(DRAFT_TYPE);

    let notifications = await pushNotifications.list(DRAFT_TYPE);
    expect(notifications).toHaveLength(1);
    expect(notifications[0].type).toEqual(DRAFT_TYPE);
  });

  it('invalid create requests should fail', async () => {
    await expect(pushNotifications.create({ type: '' })).rejects.toBeDefined();
  });

  it('fetching push notification should work', async () => {
    let newNotification = await pushNotifications.create(testNotification);
    expect(newNotification.type).toEqual(DRAFT_TYPE);
    let notification = await pushNotifications.pushNotification(newNotification._id).get();
    expect(notification.type).toEqual(newNotification.type);
  });

  it('updating push notification should work', async () => {
    let newNotification = await pushNotifications.create(testNotification);
    expect(newNotification.message).toEqual(testNotification.message);
    newNotification.message = 'updated';
    await pushNotifications.pushNotification(newNotification._id).update(newNotification);
    let updatedNotification = await pushNotifications.pushNotification(newNotification._id).get();
    expect(updatedNotification.message).toEqual('updated');
  });

  it('updating push notification type should work', async () => {
    let newNotification = await pushNotifications.create(testNotification);
    expect(newNotification.type).toEqual(DRAFT_TYPE);
    await pushNotifications.pushNotification(newNotification._id).setType(SENT_TYPE);
    let updatedNotification = await pushNotifications.pushNotification(newNotification._id).get();
    expect(updatedNotification.type).toEqual(SENT_TYPE);
  });

  it('deleting push notification should work', async () => {
    let newNotification = await pushNotifications.create(testNotification);
    let notifications = await pushNotifications.list(DRAFT_TYPE);
    expect(notifications).toHaveLength(1);
    await pushNotifications.pushNotification(newNotification._id).remove();
    notifications = await pushNotifications.list(DRAFT_TYPE);
    expect(notifications).toHaveLength(0);
  });
});
