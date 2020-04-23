import { JsonObject, JsonProperty } from 'json2typescript';

@JsonObject('CustomUserDataConfig')
export default class CustomUserDataConfig {
  @JsonProperty('mongo_service_id')
  public readonly mongoServiceId: string = '';

  @JsonProperty('database_name')
  public readonly databaseName: string = '';

  @JsonProperty('collection_name')
  public readonly collectionName: string = '';

  @JsonProperty('user_id_field')
  public readonly userIdField: string = '';

  @JsonProperty('enabled')
  public readonly enabled: boolean = false;

  constructor(partial?: Partial<CustomUserDataConfig>) {
    Object.assign(this, partial);
  }
}
