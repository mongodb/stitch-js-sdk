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

    const appConfig = EJSON.parse(fs.readFileSync(`${CONF_PATH}/test_app_config.json`, 'utf8'));
    const result = await this.admin.apps(userData.group.groupId).create(appConfig);
    const app = this.admin.apps(userData.group.groupId).app(result._id);
    this.clientAppId = result.clientAppId;
    await app.authProviders().provider('api', 'key').update({});
    this.appKey = await app.apiKeys().create({ name: 'app-key' });

    await app.services().create({name: 'mdb1', type: 'mongodb'});
    const mdb1Svc = app.services().service('mdb1');
    const mdb1 = appConfig.services.mdb1;
    await mdb1Svc.setConfig(mdb1.config);

    const rule1Key = '5873a33f772e2e08ce645b9a';
    const rule2Key = '5873a33f772e2e08ce645b9b';

    const rule1 = await mdb1Svc.rules().create(mdb1.rules[rule1Key]);
    mdb1.rules[rule1Key]._id = rule1._id;
    await mdb1Svc.rules().rule(rule1._id).update(mdb1.rules[rule1Key]);

    const rule2 = await mdb1Svc.rules().create(mdb1.rules[rule2Key]);
    mdb1.rules[rule2Key]._id = rule2._id;
    await mdb1Svc.rules().rule(rule2._id).update(mdb1.rules[rule2Key]);
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
