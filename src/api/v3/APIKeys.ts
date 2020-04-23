import { JsonObject, JsonProperty } from 'json2typescript';

@JsonObject('APIKey')
export class APIKey {
  @JsonProperty('_id', String, true)
  public readonly id?: string = undefined;

  @JsonProperty('key')
  public readonly key: string = '';

  @JsonProperty('name')
  public readonly name: string = '';

  @JsonProperty('disabled')
  public readonly disabled: boolean = false;

  constructor(partial?: Partial<APIKey>) {
    Object.assign(this, partial);
  }
}

@JsonObject('PartialAPIKey')
export class PartialAPIKey {
  @JsonProperty('_id')
  public readonly id: string = '';

  @JsonProperty('name')
  public readonly name: string = '';

  @JsonProperty('disabled')
  public readonly disabled: boolean = false;

  constructor(partial?: Partial<PartialAPIKey>) {
    Object.assign(this, partial);
  }
}
