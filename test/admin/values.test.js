const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');

import {getAuthenticatedClient} from '../testutil';

describe('Values V2', ()=>{
  let test = new StitchMongoFixture();
  let apps;
  let app;
  beforeAll(() => test.setup({createApp: false}));
  afterAll(() => test.teardown());
  beforeEach(async () =>{
    let adminClient = await getAuthenticatedClient(test.userData.apiKey.key);
    test.groupId = test.userData.group.groupId;
    apps = await adminClient.v2().apps(test.groupId);
    app = await apps.create({name: 'testname'});
    appValues = adminClient.v2().apps(test.groupId).app(app._id).values();
  });
  afterEach(async () => {
    await apps.app(app._id).remove();
  });

  let appValues;
  const testValueName = 'testvaluename';
  it('listing values should return empty list', async () => {
    let values = await appValues.list();
    expect(values).toEqual([]);
  });
  it('creating value should make it appear in list', async () => {
    let value = await appValues.create({name: testValueName});
    expect(value.name).toEqual(testValueName);
    let values = await appValues.list();
    expect(values).toHaveLength(1);
    expect(values[0]).toEqual(value);
  });
  it('fetching a value returns deep value data', async () => {
    let value = await appValues.create({name: testValueName, value: 'foo'});
    const deepValue = await appValues.value(value._id).get();
    expect(deepValue.value).toEqual('foo');
    delete deepValue.value;
    expect(value).toEqual(deepValue);
  });
  it('can update a value', async () => {
    let value = await appValues.create({name: testValueName, value: 'foo'});
    value.value = '"abcdefgh"';
    await appValues.value(value._id).update(value);
    const deepValue = await appValues.value(value._id).get();
    expect(deepValue.value).toEqual('"abcdefgh"');
  });
  it('can delete a value', async () => {
    let value = await appValues.create({name: testValueName});
    expect(value.name).toEqual(testValueName);
    let values = await appValues.list();
    expect(values).toHaveLength(1);
    await appValues.value(value._id).remove();

    values = await appValues.list();
    expect(values).toHaveLength(0);
  });
});
