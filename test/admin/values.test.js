const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');

import { buildAdminTestHarness, extractTestFixtureDataPoints } from '../testutil';

const compareValue = (valueA, valueB) => {
  expect(valueA._id).toEqual(valueB._id);
  expect(valueA.name).toEqual(valueB.name);
  expect(valueA.last_modified).toBeDefined();
  expect(valueA.from_secret).toEqual(valueB.from_secret);
};

describe('Values', ()=>{
  let test = new StitchMongoFixture();
  let th;
  let appValues;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async() => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
    appValues = th.app().values();
  });

  afterEach(async() => th.cleanup());

  const testValueName = 'testvaluename';
  it('listing values should return empty list', async() => {
    let values = await appValues.list();
    expect(values).toEqual([]);
  });
  it('creating value should make it appear in list', async() => {
    let value = await appValues.create({name: testValueName});
    expect(value.name).toEqual(testValueName);
    let values = await appValues.list();
    expect(values).toHaveLength(1);
    const [firstValue] = values;
    compareValue(firstValue, value);
  });
  it('fetching a value returns deep value data', async() => {
    let value = await appValues.create({name: testValueName, value: 'foo'});
    const deepValue = await appValues.value(value._id).get();
    expect(deepValue.value).toEqual('foo');
    delete deepValue.value;
    compareValue(deepValue, value);
  });
  it('can update a value', async() => {
    let value = await appValues.create({name: testValueName, value: 'foo'});
    value.value = '"abcdefgh"';
    await appValues.value(value._id).update(value);
    const deepValue = await appValues.value(value._id).get();
    expect(deepValue.value).toEqual('"abcdefgh"');
  });
  it('can delete a value', async() => {
    let value = await appValues.create({name: testValueName});
    expect(value.name).toEqual(testValueName);
    let values = await appValues.list();
    expect(values).toHaveLength(1);
    await appValues.value(value._id).remove();

    values = await appValues.list();
    expect(values).toHaveLength(0);
  });
});
