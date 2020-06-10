import { AuthProviderType } from '../../src/api/v3/AuthProviders';
import RealmAdminClient from '../../src/Client';
import { DEFAULT_SERVER_URL, DEFAULT_URI, DEFAULT_USER_ROLES } from '../constants';

import BSON from 'bson';
import crypto from 'crypto';
import mongodb from 'mongodb';
const MongoClient = mongodb.MongoClient;

const randomString = (length) => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = length; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

const testSalt = process.env.BAAS_TEST_SALT || 'DQOWene1723baqD!_@#';
const hashValue = (key, salt) =>
  new Promise((resolve, reject) =>
    crypto.pbkdf2(key, salt, 4096, 32, 'sha256', (err, _key) => {
      if (err) {
        reject(err);
      }
      resolve(_key.toString('hex'));
    })
  );

export default class RealmMongoFixture {
  public testNamespaces;

  public mongo;

  public admin;

  public userData;

  constructor(public readonly options?) {
    options = options || {};
    options.mongoUri = options.mongoUri || DEFAULT_URI;
    options.baseUrl = options.baseUrl || DEFAULT_SERVER_URL;
    const userRoles = options.userRoles || [];
    options.userRoles = [...userRoles, ...DEFAULT_USER_ROLES];

    this.options = options;
    this.testNamespaces = [];
  }

  public async setup() {
    this.mongo = await MongoClient.connect(this.options.mongoUri, {
      useUnifiedTopology: true,
    });

    // bootstrap auth database with a root user
    const userData = await this._generateTestRootUser();
    await this.mongo.db('auth').collection('users').insertOne(userData.user);
    await this.mongo.db('auth').collection('apiKeys').insertOne(userData.apiKey);
    await this.mongo.db('auth').collection('groups').insertOne(userData.group);
    this.userData = userData;

    this.admin = new RealmAdminClient(this.options.baseUrl);
    await this.admin.authenticate(AuthProviderType.APIKey, userData.apiKey.key);
  }

  public async teardown() {
    await this.mongo.close();
  }

  public registerTestNamespace(db, collection) {
    this.testNamespaces.push({ db, collection });
  }

  public async cleanTestNamespaces() {
    this.testNamespaces.forEach(async (ns) => {
      await this.mongo.db(ns.db).collection(ns.collection).remove();
    });
    this.testNamespaces = [];
  }

  public async _generateTestRootUser() {
    const rootId = new BSON.ObjectId('000000000000000000000000');
    const rootProviderId = new BSON.ObjectId('000000000000000000000001');
    const apiKeyId = new BSON.ObjectId();
    const userId = new BSON.ObjectId().toHexString();
    const groupId = new BSON.ObjectId().toHexString();
    const testUser = {
      userId: new BSON.ObjectId().toHexString(),
      domainId: rootId,
      identities: [
        {
          id: apiKeyId.toHexString(),
          providerType: 'api-key',
          providerId: rootProviderId,
        },
      ],
      roles: this.options.userRoles.map((roleName) => ({ roleName, groupId })),
      domain_id_hash: 3795608245,
      location: 'US-VA',
    };

    const key = randomString(64);
    const hashedKey = await hashValue(key, testSalt);

    const testAPIKey = {
      _id: apiKeyId,
      domainId: rootId,
      userId,
      appId: rootId,
      key,
      hashedKey,
      name: apiKeyId.toString(),
      disabled: false,
      visible: true,
      domain_id_hash: 3795608245,
      location: 'US-VA',
      type: 'app',
    };

    const testGroup = {
      domainId: rootId,
      groupId,
    };

    return { user: testUser, apiKey: testAPIKey, group: testGroup };
  }

  public async _generateTestMetrics(
    reportDate: Date,
    groupId: string,
    appId: string,
    { totalRequests = 0, bytesWritten = 0, computeTimeMillis = 0, syncTimeMillis = 0 }: Partial<TestMetrics> = {}
  ) {
    if (!this.mongo) {
      throw new Error('must call setup() on test fixture before attempting to generate test metrics');
    }

    await this.mongo
      .db('metrics')
      .collection(`apps_${reportDate.getFullYear()}${`${reportDate.getMonth() + 1}`.padStart(2, '0')}_3600s`)
      .insertOne({
        groupId,
        appId: new BSON.ObjectId(appId),
        reportTime: reportDate.getTime() / 1000,
        product: 'standard',
        total_requests: totalRequests,
        functionExecMetrics: { billable_total_time_millis: computeTimeMillis },
        incomingWebhookMetrics: { written: bytesWritten },
        sync_metrics: { sync_time_millis: syncTimeMillis },
      });
  }
}

interface TestMetrics {
  bytesWritten: number;
  computeTimeMillis: number;
  totalRequests: number;
  syncTimeMillis: number;
}
