import { JsonObject, JsonProperty } from 'json2typescript';

@JsonObject('AtlasGroup')
export default class AtlasGroup {
  @JsonProperty('id')
  public readonly id: string = '';

  @JsonProperty('name')
  public readonly name: string = '';

  @JsonProperty('orgId')
  public readonly orgId: string = '';

  @JsonProperty('betaFeatures')
  public readonly betaFeatures: string[] = [];

  constructor(partial?: Partial<AtlasGroup>) {
    Object.assign(this, partial);
  }
}
