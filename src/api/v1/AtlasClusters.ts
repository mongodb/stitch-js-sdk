import { JsonObject, JsonProperty } from 'json2typescript';

@JsonObject('AtlasProviderSettings')
export class AtlasProviderSettings {
  @JsonProperty('instanceSizeName', String, true)
  public readonly instanceSizeName?: string = undefined;

  @JsonProperty('regionName', String, true)
  public readonly regionName?: string = undefined;

  @JsonProperty('backingProviderName', String, true)
  public readonly backingProviderName?: string = undefined;

  constructor(partial?: Partial<AtlasProviderSettings>) {
    Object.assign(this, partial);
  }
}

@JsonObject('AtlasCluster')
export class AtlasCluster {
  @JsonProperty('id', String, true)
  public readonly id?: string = undefined;

  @JsonProperty('name', String, true)
  public readonly name?: string = undefined;

  @JsonProperty('mongoURI', String, true)
  public readonly mongoURI?: string = undefined;

  @JsonProperty('mongoURIWithOptions', String, true)
  public readonly mongoURIWithOptions?: string = undefined;

  @JsonProperty('srvAddress', String, true)
  public readonly srvAddress?: string = undefined;

  @JsonProperty('providerSettings', AtlasProviderSettings, true)
  public readonly providerSettings?: AtlasProviderSettings = undefined;

  @JsonProperty('stateName', String, true)
  public readonly state?: string = undefined;

  @JsonProperty('mongoDBVersion', String, true)
  public readonly mongoDBVersion?: string = undefined;

  constructor(partial?: Partial<AtlasCluster>) {
    Object.assign(this, partial);
  }
}

@JsonObject('CreateAtlasClusterRequest')
export class CreateAtlasClusterRequest {
  @JsonProperty('region_name')
  public readonly regionName: string = '';

  constructor(partial?: Partial<CreateAtlasClusterRequest>) {
    Object.assign(this, partial);
  }
}

@JsonObject('CreateAtlasClusterResponse')
export class CreateAtlasClusterResponse {
  @JsonProperty('cluster_name')
  public readonly clusterName: string = '';

  constructor(partial?: Partial<CreateAtlasClusterResponse>) {
    Object.assign(this, partial);
  }
}
