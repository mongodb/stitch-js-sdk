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
  DataOut = 'data_out',
  MemUsage = 'mem_usage',
  RequestCount = 'request_count',
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

@JsonObject('AppMeasurementGroup')
export class AppMeasurementGroup {
  @JsonProperty('app_name')
  public readonly appName: string = '';

  @JsonProperty('group_id')
  public readonly groupId: string = '';

  @JsonProperty('app_id')
  public readonly appId: string = '';

  @JsonProperty('start')
  public readonly start: Date = new Date();

  @JsonProperty('end')
  public readonly end: Date = new Date();

  @JsonProperty('granularity')
  public readonly granularity: MeasurementGroupGranularity = MeasurementGroupGranularity.Monthly;

  @JsonProperty('measurements', [Measurement])
  public readonly measurements: Measurement[] = [];

  constructor(partial?: Partial<AppMeasurementGroup>) {
    Object.assign(this, partial);
  }
}

export interface AppMeasurementsRequest {
  readonly start?: Date;
  readonly end?: Date;
  readonly granularity?: MeasurementGroupGranularity;
}
