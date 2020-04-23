import { Any, JsonObject, JsonProperty } from 'json2typescript';

@JsonObject('Value')
export class Value {
  @JsonProperty('_id', String, true)
  public readonly id?: string = undefined;

  @JsonProperty('name')
  public readonly name: string = '';

  @JsonProperty('value', Any, true)
  public readonly value?: any = undefined;

  @JsonProperty('from_secret')
  public readonly fromSecret: boolean = false;

  @JsonProperty('last_modified', Number, true)
  public readonly lastModified?: number = undefined;

  constructor(partial?: Partial<Value>) {
    Object.assign(this, partial);
  }
}

@JsonObject('PartialValue')
export class PartialValue {
  @JsonProperty('_id')
  public readonly id: string = '';

  @JsonProperty('name')
  public readonly name: string = '';

  @JsonProperty('from_secret')
  public readonly fromSecret: boolean = false;

  @JsonProperty('last_modified', Number, true)
  public readonly lastModified?: number = undefined;

  constructor(partial?: Partial<PartialValue>) {
    Object.assign(this, partial);
  }
}
