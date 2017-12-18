// @flow
import StitchClient from '../src/client';
import Admin from '../src/admin';
import { DEFAULT_SERVER_URL } from './constants';

export const extractTestFixtureDataPoints = (test: any) => {
  const {
    userData: {
      apiKey: { key: apiKey },
      group: { groupId }
    },
    options: { baseUrl: serverUrl }
  } = test;
  return { apiKey, groupId, serverUrl };
};

export async function wrap(promise: Promise<any>): Promise<[?Error, ?any]> {
  return promise.then(data => {
      return [null, data];
   }).catch(err => [err, null]);
}

export async function buildAdminTestHarness(seedTestApp: boolean, 
                                            apiKey: string, 
                                            groupId: string, 
                                            serverUrl: string): Promise<TestHarness> {
  const harness = new TestHarness(apiKey, groupId, serverUrl);
  await harness.authenticate();
  if (seedTestApp) {
    await harness.createApp();
  }
  return harness;
};

export async function buildClientTestHarness(apiKey: string, 
                                             groupId: string, 
                                             serverUrl: string): Promise<TestHarness> {
  const harness = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
  await harness.setupStitchClient();
  return harness;
};

class TestHarness {
  apiKey: string;
  groupId: string;
  serverUrl: string;
  adminClient: Admin;
  testApp: ?Object;
  userCredentials: { username: string, password: string };
  user: Object;
  stitchClient: ?StitchClient;

  constructor(apiKey: string, groupId: string, serverUrl: string = DEFAULT_SERVER_URL) {
    this.apiKey = apiKey;
    this.groupId = groupId;
    this.serverUrl = serverUrl;
    this.adminClient = new Admin(this.serverUrl);
  }

  async authenticate() {
    await this.adminClient.authenticate('apiKey', this.apiKey);
  }

  async configureUserpass(userpassConfig = {
    emailConfirmationUrl: 'http://emailConfirmURL.com',
    resetPasswordUrl: 'http://resetPasswordURL.com',
    confirmEmailSubject: 'email subject',
    resetPasswordSubject: 'password subject'
  }) {
    return await this.app().authProviders().create({
      type: 'local-userpass',
      config: userpassConfig
    });
  }

  async createApp(testAppName = 'test-app') {
    this.testApp = await this.apps().create({ name: testAppName });
    return this.testApp;
  }

  async createUser(email = 'test_user@domain.com', password = 'password') {
    this.userCredentials = { username: email, password };
    this.user = await this.app().users().create({ email, password });
    return this.user;
  }

  async setupStitchClient() {
    await this.configureUserpass();
    await this.createUser();

    this.stitchClient = new StitchClient(this.testApp.client_app_id, { baseUrl: this.serverUrl });
    await this.stitchClient.authenticate('userpass', this.userCredentials);
  }

  async cleanup() {
    if (this.testApp) {
      await this.appRemove();
    }
  }

  apps() {
    return this.adminClient.apps(this.groupId);
  }

  app() {
    return this.apps().app(this.testApp._id);
  }

  async appRemove() {
    await this.app().remove();
    this.testApp = undefined;
    this.stitchClient = undefined;
  }

  appsV2() {
    return this.adminClient.v2().apps(this.groupId);
  }

  appV2() {
    return this.appsV2().app(this.testApp._id);
  }
}
