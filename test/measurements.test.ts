import { Measurement, MeasurementGroupGranularity, MeasurementName } from '../src/api/v3/Measurements';

import RealmMongoFixture from './fixtures/realm_mongo_fixture';
import { buildAdminTestHarness, extractTestFixtureDataPoints, TestHarness } from './testutil';

const REPORT_DATE = new Date('2020-06-04T12:00:00Z');

const START_OF_MONTH = new Date('2020-06-01T00:00:00+0000');
const END_OF_MONTH = new Date('2020-06-30T23:59:59+0000');

function getMeasurementsByName(measurements: Measurement[]) {
  return measurements.reduce(
    (acc, measurement) => ({
      ...acc,
      [measurement.name]: measurement,
    }),
    {} as { [key in MeasurementName]: Measurement }
  );
}

describe('Measurements', () => {
  const test = new RealmMongoFixture();
  let th: TestHarness;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async () => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);

    await test._generateTestMetrics(REPORT_DATE, groupId, th.testApp.id || '', {
      totalRequests: 10,
      bytesWritten: 1024 * 1024 * 1024,
      computeTimeMillis: 3600000,
      syncTimeMillis: 180000,
    });
  });

  afterEach(async () => th.cleanup());

  it('getting group measurements should return a group measurements group', async () => {
    const { groupId, start, end, granularity, measurements } = await th
      .apps()
      .measurements({ start: START_OF_MONTH, end: END_OF_MONTH });
    expect(groupId).toBe(th.testApp.groupId);
    expect(start).toEqual(new Date(START_OF_MONTH));
    expect(end).toEqual(new Date(END_OF_MONTH));
    expect(granularity).toEqual(MeasurementGroupGranularity.Monthly);
    expect(measurements).toHaveLength(4);

    const measurementsByName = getMeasurementsByName(measurements);

    const requestCount = measurementsByName[MeasurementName.RequestCount];
    expect(requestCount).not.toBeUndefined();
    expect(requestCount.dataPoints).toHaveLength(1);
    expect(requestCount.dataPoints[0].value).toBe(10);

    const dataOut = measurementsByName[MeasurementName.DataOut];
    expect(dataOut).not.toBeUndefined();
    expect(dataOut.dataPoints).toHaveLength(1);
    expect(dataOut.dataPoints[0].value).toBe(1);

    const computeTime = measurementsByName[MeasurementName.ComputeTime];
    expect(computeTime).not.toBeUndefined();
    expect(computeTime.dataPoints).toHaveLength(1);
    expect(computeTime.dataPoints[0].value).toBe(1);

    const syncTime = measurementsByName[MeasurementName.SyncTime];
    expect(syncTime).not.toBeUndefined();
    expect(syncTime.dataPoints).toHaveLength(1);
    expect(syncTime.dataPoints[0].value).toBe(0.05);
  });

  it('getting app measurements should return an app measurements group', async () => {
    const { groupId, appId, appName, start, end, granularity, measurements } = await th
      .app()
      .measurements({ start: START_OF_MONTH, end: END_OF_MONTH });
    expect(groupId).toBe(th.testApp.groupId);
    expect(appId).toBe(th.testApp.id);
    expect(appName).toBe(th.testApp.name);
    expect(start).toEqual(new Date(START_OF_MONTH));
    expect(end).toEqual(new Date(END_OF_MONTH));
    expect(granularity).toEqual(MeasurementGroupGranularity.Monthly);
    expect(measurements).toHaveLength(5);

    const measurementsByName = getMeasurementsByName(measurements);

    const requestCount = measurementsByName[MeasurementName.RequestCount];
    expect(requestCount).not.toBeUndefined();
    expect(requestCount.dataPoints).toHaveLength(1);
    expect(requestCount.dataPoints[0].value).toBe(10);

    const dataOut = measurementsByName[MeasurementName.DataOut];
    expect(dataOut).not.toBeUndefined();
    expect(dataOut.dataPoints).toHaveLength(1);
    expect(dataOut.dataPoints[0].value).toBe(1);

    const computeTime = measurementsByName[MeasurementName.ComputeTime];
    expect(computeTime).not.toBeUndefined();
    expect(computeTime.dataPoints).toHaveLength(1);
    expect(computeTime.dataPoints[0].value).toBe(1);

    const syncTime = measurementsByName[MeasurementName.SyncTime];
    expect(syncTime).not.toBeUndefined();
    expect(syncTime.dataPoints).toHaveLength(1);
    expect(syncTime.dataPoints[0].value).toBe(0.05);

    /* this metric is deprecated, but is present in app measurements for backwards compatibility */
    const memUsage = measurementsByName.mem_usage;
    expect(memUsage).not.toBeUndefined();
    expect(memUsage.dataPoints).toHaveLength(1);
    expect(memUsage.dataPoints[0].value).toBe(0);
  });
});
