const StitchService = require('./stitch_service');
const stitch = require('../../src/client');
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const ExtJSON = require('mongodb-extjson');
const fs = require('fs');
const { CONF_PATH, DEFAULT_URI } = require('./constants');
const EJSON = new ExtJSON(mongodb);
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

export default class StitchMongoFixture {
  constructor(options) {
    options = options || {};
    options.uri = options.uri || DEFAULT_URI;

    this.options = options;
    this.stitch = new StitchService;
  }

  async setup() {
    // setup mongo client and clear database
    this.mongo = await MongoClient.connect(this.options.uri);
    await this.clearDatabase();

    // populate the app databases with sample data
    let userData = await this._generateTestUser();
    await this.mongo.db('auth').collection('users').insert(userData.user);
    await this.mongo.db('auth').collection('apiKeys').insert(userData.apiKey);
    await this.mongo.db('auth').collection('groups').insert(userData.group);
    this.userData = userData;

    // start the local Stitch service
    await this.stitch.setup();

    // create an app `test_app`, and authorize a user
    this.admin = new stitch.Admin('http://localhost:7080');
    await this.admin.client.authenticate('apiKey', userData.apiKey.key);
    let result = await this.admin.apps(userData.group.groupId).create({ name: 'test_app' });
    this.clientAppId = result.clientAppId;
    const appConfig = EJSON.parse(fs.readFileSync(`${CONF_PATH}/test_app_config.json`, 'utf8'));
    await this.admin.apps(userData.group.groupId).app(result._id).replace(appConfig);
    this.appKey = await this.admin.apps(userData.group.groupId).app(result._id).apiKeys().create({ name: 'app-key' });
  }

  async teardown() {
    // await this.clearDatabase();
    await this.mongo.close();
    await this.stitch.teardown();
  }

  async clearDatabase() {
    // Drop the app databases
    await this.mongo.db('app').dropDatabase({ w: 1 });
    await this.mongo.db('test').dropDatabase({ w: 1 });
    await this.mongo.db('auth').dropDatabase({ w: 1 });
  }

  async cleanDatabase() {
    await this.mongo.db('test').collection('documents').remove();
  }

  async _generateTestUser() {
    const rootId = new mongodb.ObjectId('000000000000000000000000');
    const apiKeyId = new mongodb.ObjectId();
    const userId = new mongodb.ObjectId().toHexString();
    const groupId = new mongodb.ObjectId().toHexString();
    let testUser = {
      userId: new mongodb.ObjectId().toHexString(),
      domainId: rootId,
      identities: [ { id: apiKeyId.toHexString(), provider: 'api/key' } ],
      roles: [{roleName: "groupOwner", groupId: groupId}]
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
      groupId,
    };

    return { user: testUser, apiKey: testAPIKey, group: testGroup };
  }
}
