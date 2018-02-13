const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');

import { buildClientTestHarness, extractTestFixtureDataPoints } from '../testutil';

// Returns true if twilio credentials are in env, false otehrwise.
function twilioCredsInEnv() {
  return !!(process.env.TWILIO_SID && process.env.TWILIO_AUTHTOKEN);
}

describe('Executing Twilio service functions', () => {
  const test = new StitchMongoFixture();

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  const SERVICE_TYPE = 'twilio';
  const SERVICE_NAME = 'tw1';

  let th;
  let service;
  let serviceId;

  beforeEach(async() => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildClientTestHarness(apiKey, groupId, serverUrl);

    if (twilioCredsInEnv()) {
      const twilioService = await th
        .app()
        .services()
        .create({
          type: SERVICE_TYPE,
          name: SERVICE_NAME,
          config: {
            sid: process.env.TWILIO_SID,
            auth_token: process.env.TWILIO_AUTHTOKEN
          }
        });

      service = th.stitchClient.service(SERVICE_TYPE, SERVICE_NAME);
      serviceId = twilioService._id;

      await th
        .app()
        .services()
        .service(serviceId)
        .rules()
        .create({
          name: 'twilioRule',
          actions: ['send'],
          when: {}
        });
    }
  });

  afterEach(async() => await th.cleanup());

  it('should successfully send a text message', async() => {
    if (!twilioCredsInEnv()) {
      console.warn('skipping test since there are no twilio credentials in environment');
      return;
    }

    expect(await service.send('+15005550006', '+12018675309', 'hello')).toBeNull();
  });
});
