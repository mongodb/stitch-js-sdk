import { DateConverter, dateToISO8601 } from '../../Converters';

import { JsonObject, JsonProperty } from 'json2typescript';

export enum MeasurementGroupGranularity {
  Monthly = 'P31D',
  Hourly = 'PT1H',
}

@JsonObject('DataPoint')
export class DataPoint {
  @JsonProperty('timestamp')
  public readonly timestamp: Date = new Date();

  @JsonProperty('value')
  public readonly value: number = 0;

  constructor(partial?: Partial<DataPoint>) {
    Object.assign(this, partial);
  }
}

export enum MeasurementName {
  ComputeTime = 'compute_time',
  DataOut = 'data_out',
  RequestCount = 'request_count',
  SyncTime = 'sync_time',
}

@JsonObject('Measurement')
export class Measurement {
  @JsonProperty('name')
  public readonly name: MeasurementName = MeasurementName.DataOut;

  @JsonProperty('units')
  public readonly units: string = '';

  @JsonProperty('data_points', [DataPoint])
  public readonly dataPoints: DataPoint[] = [];

  constructor(partial?: Partial<Measurement>) {
    Object.assign(this, partial);
  }
}

interface MeasurementGroup {
  readonly start: Date;

  readonly end: Date;

  readonly granularity: MeasurementGroupGranularity;

  readonly measurements: Measurement[];
}

@JsonObject('AppMeasurementGroup')
export class AppMeasurementGroup implements MeasurementGroup {
  @JsonProperty('app_name')
  public readonly appName: string = '';

  @JsonProperty('group_id')
  public readonly groupId: string = '';

  @JsonProperty('app_id')
  public readonly appId: string = '';

  @JsonProperty('start', DateConverter)
  public readonly start: Date = new Date();

  @JsonProperty('end', DateConverter)
  public readonly end: Date = new Date();

  @JsonProperty('granularity')
  public readonly granularity: MeasurementGroupGranularity = MeasurementGroupGranularity.Monthly;

  @JsonProperty('measurements', [Measurement])
  public readonly measurements: Measurement[] = [];

  constructor(partial?: Partial<AppMeasurementGroup>) {
    Object.assign(this, partial);
  }
}

@JsonObject('GroupMeasurementGroup')
export class GroupMeasurementGroup implements MeasurementGroup {
  @JsonProperty('group_id')
  public readonly groupId: string = '';

  @JsonProperty('start', DateConverter)
  public readonly start: Date = new Date();

  @JsonProperty('end', DateConverter)
  public readonly end: Date = new Date();

  @JsonProperty('granularity')
  public readonly granularity: MeasurementGroupGranularity = MeasurementGroupGranularity.Monthly;

  @JsonProperty('measurements', [Measurement])
  public readonly measurements: Measurement[] = [];

  constructor(partial?: Partial<AppMeasurementGroup>) {
    Object.assign(this, partial);
  }
}

export interface MeasurementRequest {
  readonly start?: Date;
  readonly end?: Date;
  readonly granularity?: MeasurementGroupGranularity;
}

export function getMeasurementFilter(request?: MeasurementRequest) {
  if (!request) {
    return undefined;
  }
  const filter: Record<string, any> = {};
  if (request.start) {
    filter.start = dateToISO8601(request.start);
  }
  if (request.end) {
    filter.end = dateToISO8601(request.end);
  }
  if (request.granularity) {
    filter.granularity = request.granularity;
  }
  return filter;
}
