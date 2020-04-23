import { Value } from '../src/api/v3/Values';

import RealmMongoFixture from './fixtures/realm_mongo_fixture';
import { buildAdminTestHarness, extractTestFixtureDataPoints } from './testutil';

const compareValue = (valueA, valueB) => {
  expect(valueA.id).toEqual(valueB.id);
  expect(valueA.name).toEqual(valueB.name);
  expect(valueA.fromSecret).toEqual(valueB.fromSecret);
};

describe('Values', () => {
  const test = new RealmMongoFixture();
  let th;
  let appValues;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async () => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
    appValues = th.app().values();
  });

  afterEach(async () => th.cleanup());

  const testValueName = 'testvaluename';
  it('listing values should return empty list', async () => {
    const values = await appValues.list();
    expect(values).toEqual([]);
  });
  it('creating value should make it appear in list', async () => {
    const value = await appValues.create(new Value({ name: testValueName }));
    expect(value.name).toEqual(testValueName);
    const values = await appValues.list();
    expect(values).toHaveLength(1);
    const [firstValue] = values;
    compareValue(firstValue, value);
  });
  it('fetching a value returns deep value data', async () => {
    const val = new Value({ name: testValueName, value: 'foo' });
    const value = await appValues.create(val);
    const deepValue = await appValues.value(value.id).get();
    expect(deepValue.value).toEqual('foo');
    delete deepValue.value;
    compareValue(deepValue, value);
  });
  it('can update a value', async () => {
    const value = await appValues.create(new Value({ name: testValueName, value: 'foo' }));
    await appValues.value(value.id).update(new Value({ ...value, value: '"abcdefgh"' }));
    const deepValue = await appValues.value(value.id).get();
    expect(deepValue.value).toEqual('"abcdefgh"');
  });
  it('can delete a value', async () => {
    const value = await appValues.create(new Value({ name: testValueName }));
    expect(value.name).toEqual(testValueName);
    let values = await appValues.list();
    expect(values).toHaveLength(1);
    await appValues.value(value.id).remove();

    values = await appValues.list();
    expect(values).toHaveLength(0);
  });
});
