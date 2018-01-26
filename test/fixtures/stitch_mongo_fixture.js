import { StitchAdminClientFactory } from '../../src/admin';
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const { DEFAULT_URI, DEFAULT_SERVER_URL } = require('../constants');
const crypto = require('crypto');

const randomString = (length) => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

const testSalt = process.env.STITCH_TEST_SALT || 'DQOWene1723baqD!_@#';
const hashValue = (key, salt) => {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(key, salt, 4096, 32, 'sha256', (err, _key) => {
      if (err) return reject(err);
      resolve(_key.toString('hex'));
    });
  });
};

export default class StitchFixture {
  constructor(options) {
    options = options || {};
    options.mongoUri = options.mongoUri || DEFAULT_URI;
    options.baseUrl = options.baseUrl || DEFAULT_SERVER_URL;
    this.options = options;
    this.testNamespaces = [];
  }

  async setup() {
    this.mongo = await MongoClient.connect(this.options.mongoUri);

    // bootstrap auth database with a root user
    let userData = await this._generateTestRootUser();
    await this.mongo.db('auth').collection('users').insert(userData.user);
    await this.mongo.db('auth').collection('apiKeys').insert(userData.apiKey);
    await this.mongo.db('auth').collection('groups').insert(userData.group);
    this.userData = userData;

    this.admin = await StitchAdminClientFactory.create(this.options.baseUrl);
    await this.admin.authenticate('apiKey', userData.apiKey.key);
  }

  async teardown() {
    await this.mongo.close();
  }

  registerTestNamespace(db, collection) {
    this.testNamespaces.push({db, collection});
  }

  async cleanTestNamespaces() {
    this.testNamespaces.forEach(async(ns) => {
      await this.mongo.db(ns.db).collection(ns.collection).remove();
    });
    this.testNamespaces = [];
  }

  async _generateTestRootUser() {
    const rootId = new mongodb.ObjectId('000000000000000000000000');
    const rootProviderId = new mongodb.ObjectId('000000000000000000000001');
    const apiKeyId = new mongodb.ObjectId();
    const userId = new mongodb.ObjectId().toHexString();
    const groupId = new mongodb.ObjectId().toHexString();
    let testUser = {
      userId: new mongodb.ObjectId().toHexString(),
      domainId: rootId,
      identities: [ { id: apiKeyId.toHexString(), providerType: 'api-key', providerId: rootProviderId } ],
      roles: [{roleName: 'groupOwner', groupId: groupId}]
    };

    const key = randomString(64);
    const hashedKey = await hashValue(key, testSalt);

    let testAPIKey = {
      _id: apiKeyId,
      domainId: rootId,
      userId,
      appId: rootId,
      key,
      hashedKey,
      name: apiKeyId.toString(),
      disabled: false,
      visible: true
    };

    const testGroup = {
      domainId: rootId,
      groupId
    };

    return { user: testUser, apiKey: testAPIKey, group: testGroup };
  }
}
