import { JsonObject, JsonProperty } from 'json2typescript';

@JsonObject('InstalledDependency')
export class InstalledDependency {
  @JsonProperty('name')
  public readonly name: string = '';

  @JsonProperty('version')
  public readonly version: string = '';

  constructor(partial?: Partial<InstalledDependency>) {
    Object.assign(this, partial);
  }
}

@JsonObject('AppDependencies')
export class AppDependencies {
  @JsonProperty('_id')
  public readonly id: string = '';

  @JsonProperty('location')
  public readonly location: string = '';

  @JsonProperty('domain_id_hash')
  public readonly domainIdHash: number = 0;

  @JsonProperty('user_id')
  public readonly userId: string = '';

  @JsonProperty('last_modified')
  public readonly lastModified: number = 0;

  @JsonProperty('dependencies_list', [InstalledDependency])
  public readonly dependenciesList: InstalledDependency[] = [];

  constructor(partial?: Partial<AppDependencies>) {
    Object.assign(this, partial);
  }
}
