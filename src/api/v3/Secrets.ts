import { JsonObject, JsonProperty } from 'json2typescript';

@JsonObject('Secret')
export class Secret {
  @JsonProperty('_id', String, true)
  public readonly id?: string = undefined;

  @JsonProperty('name')
  public readonly name: string = '';

  @JsonProperty('value', String, true)
  public readonly value?: string = undefined;

  constructor(partial?: Partial<Secret>) {
    Object.assign(this, partial);
  }
}

@JsonObject('PartialSecret')
export class PartialSecret {
  @JsonProperty('_id')
  public readonly id: string = '';

  @JsonProperty('name')
  public readonly name: string = '';

  constructor(partial?: Partial<PartialSecret>) {
    Object.assign(this, partial);
  }
}
