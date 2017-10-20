const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');

import { getAuthenticatedClient } from '../testutil';

async function createTestPipeline(appPipelines) {
  const pipelineName = 'testPipelineName';
  const testPipeline = {
    name: pipelineName,
    pipeline: [
      {
        service: '',
        action: 'literal',
        args: {
          items: '%%vars.data'
        },
        let: {
          data: '%%args.vals'
        }
      }
    ],
    parameters: [
      { name: 'vals', 'required': true }
    ],
    output: 'array'
  };

  const pipeline = await appPipelines.create(testPipeline);
  expect(pipeline.name).toEqual(pipelineName);
  const pipelines = await appPipelines.list();
  expect(pipelines).toHaveLength(1);
}

async function createAppUser(users, { email = 'dude.mcgee@doofus.net', password = 'doofus123' } = {}) {
  const user = await users.create({ email, password });
  expect(user.data.email).toEqual(email);
  return user;
}

async function createUserPassProvider(authProviders) {
  const provider = await authProviders.create({
    type: 'local-userpass',
    config: {
      emailConfirmationUrl: 'http://emailConfirmURL.com',
      resetPasswordUrl: 'http://resetPasswordURL.com',
      confirmEmailSubject: 'email subject',
      resetPasswordSubject: 'password subject'
    }
  });
  expect(provider.type).toEqual('local-userpass');
  return provider;
}

describe('Dev V2', () => {
  let test = new StitchMongoFixture();
  let apps;
  let app;
  let user;
  let dev;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async () => {
    let adminClient = await getAuthenticatedClient(test.userData.apiKey.key);
    test.groupId = test.userData.group.groupId;
    apps = await adminClient.v2().apps(test.groupId);
    app = await apps.create({ name: 'testname' });
    dev = adminClient.v2().apps(test.groupId).app(app._id).dev();

    await createTestPipeline(adminClient.v2().apps(test.groupId).app(app._id).pipelines());
    await createUserPassProvider(adminClient.v2().apps(test.groupId).app(app._id).authProviders());
    user = await createAppUser(adminClient.v2().apps(test.groupId).app(app._id).users());
  });

  afterEach(async () => {
    await apps.app(app._id).remove();
  });

  it('Supports executing the pipeline', async () => {
    const { result } = await dev.executePipeline([
      {
        service: '',
        action: 'namedPipeline',
        args: {
          name: 'testPipelineName',
          args: {
            vals: [1, 2, 3]
          }
        }
      }
    ], user._id);

    expect(result[0]).toEqual([
        { '$numberInt': '1' },
        { '$numberInt': '2' },
        { '$numberInt': '3' }
    ]);
  });
});
