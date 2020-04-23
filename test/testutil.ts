import { CreateAppRequest } from '../src/api/v3/Apps';
import { AuthProviderConfig, AuthProviderType } from '../src/api/v3/AuthProviders';
import { MongoDBRule } from '../src/api/v3/Rules';
import { ServiceDesc } from '../src/api/v3/Services';
import { EmailPasswordRegistrationRequest } from '../src/api/v3/Users';
import RealmAdminClient from '../src/Client';

import * as constants from './constants';

import FormData from 'form-data';
import { StitchClientFactory } from 'mongodb-stitch';
import fetch from 'node-fetch';

import Global = NodeJS.Global;
export interface MockGlobal extends Global {
  document: Document;
  window: Window;
  navigator: Navigator;
  fetch: any;
  FormData: any;
}
declare const global: MockGlobal;
global.fetch = fetch;
global.FormData = FormData;

export const extractTestFixtureDataPoints = (test) => {
  const {
    userData: {
      apiKey: { key: apiKey },
      group: { groupId },
    },
    options: { baseUrl: serverUrl },
  } = test;
  return { apiKey, groupId, serverUrl };
};

class TestHarness {
  private readonly adminClient;

  private testApp;

  private user;

  private realmClient;

  private userCredentials;

  constructor(
    private readonly apiKey,
    private readonly groupId,
    private readonly serverUrl = constants.DEFAULT_SERVER_URL
  ) {
    this.apiKey = apiKey;
    this.groupId = groupId;
    this.serverUrl = serverUrl;
    this.adminClient = new RealmAdminClient(this.serverUrl);
  }

  public async authenticate() {
    await this.adminClient.authenticate(AuthProviderType.APIKey, this.apiKey);
  }

  public async configureUserpass(
    userpassConfig = {
      emailConfirmationUrl: 'http://emailConfirmURL.com',
      resetPasswordUrl: 'http://resetPasswordURL.com',
      confirmEmailSubject: 'email subject',
      resetPasswordSubject: 'password subject',
    }
  ) {
    return this.app()
      .authProviders()
      .create(
        new AuthProviderConfig({
          type: AuthProviderType.Userpass,
          name: AuthProviderType.Userpass,
          config: userpassConfig,
        })
      );
  }

  public configureAnon() {
    return this.app()
      .authProviders()
      .create(
        new AuthProviderConfig({
          type: AuthProviderType.Anonymous,
          name: AuthProviderType.Anonymous,
        })
      );
  }

  public async createApp(testAppName?, product?) {
    if (!testAppName) {
      testAppName = `test-${Math.random().toString(16).substring(2)}`;
    }
    this.testApp = await this.apps().create(Object.assign(new CreateAppRequest(), { name: testAppName, product }));
    return this.testApp;
  }

  public async createUser(email = 'test_user@domain.com', password = 'password123') {
    this.userCredentials = { username: email, password };
    this.user = await this.app().users().create(new EmailPasswordRegistrationRequest({ email, password }));
    return this.user;
  }

  public async setupRealmClient(shouldConfigureUserAuth = true) {
    if (shouldConfigureUserAuth) {
      await this.configureUserpass();
    }
    await this.createUser();

    this.realmClient = await StitchClientFactory.create(this.testApp.clientAppId, { baseUrl: this.serverUrl });
    await this.realmClient.authenticate('userpass', this.userCredentials);
  }

  public async cleanup() {
    if (this.testApp) {
      await this.appRemove();
    }
  }

  public apps() {
    return this.adminClient.apps(this.groupId);
  }

  public app() {
    return this.apps().app(this.testApp.id);
  }

  public privateAdminTriggers() {
    return this.adminClient.private().admin().group(this.groupId).app(this.testApp.id).triggers();
  }

  public async appRemove() {
    await this.app().remove();
    this.testApp = undefined;
  }
}

export const buildAdminTestHarness = async (seedTestApp, apiKey, groupId, serverUrl) => {
  const harness = new TestHarness(apiKey, groupId, serverUrl);
  await harness.authenticate();
  if (seedTestApp) {
    await harness.createApp();
  }
  return harness;
};

export const buildClientTestHarness = async (apiKey, groupId, serverUrl) => {
  const harness = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
  await harness.setupRealmClient();
  return harness;
};

export const randomString = (length = 5) => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = length; i > 0; i -= 1) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

export const createSampleMongodbService = async (services) => {
  const mongodbService = await services.create(
    new ServiceDesc({
      type: 'mongodb',
      name: 'mdb',
      config: {
        uri: 'mongodb://localhost:26000',
      },
    })
  );
  return mongodbService;
};

export const createSampleMongodbSyncService = async (services, partitionKey = 'key') => {
  const syncService = await services.create(
    new ServiceDesc({
      type: 'mongodb',
      name: 'mdb',
      config: {
        uri: 'mongodb://localhost:26000',
        sync: {
          state: 'enabled',
          database_name: 'db',
          partition: {
            key: partitionKey,
            permissions: { read: true, write: true },
          },
        },
      },
    })
  );
  return syncService;
};

export const addRuleToMongodbService = (
  services,
  mongodbService,
  { database, collection, config }: { database; collection; config? },
  allowDestructiveChanges?: boolean
) => {
  const mongoSvcObj = services.service(mongodbService.id);
  return mongoSvcObj.rules().create(new MongoDBRule({ ...config, database, collection }), allowDestructiveChanges);
};
