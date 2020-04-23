import { Any, JsonObject, JsonProperty } from 'json2typescript';

export enum AuthProviderType {
  Userpass = 'local-userpass',
  Anonymous = 'anon-user',
  MongoDBCloud = 'mongodb-cloud',
  APIKey = 'api-key',
}

@JsonObject('MetadataField')
export class MetadataField {
  @JsonProperty('required')
  public readonly required: boolean = false;

  @JsonProperty('name')
  public readonly name: string = '';

  @JsonProperty('field_name', String, true)
  public readonly fieldName?: string = undefined;

  constructor(partial?: Partial<MetadataField>) {
    Object.assign(this, partial);
  }
}

@JsonObject('AuthProviderConfig')
export class AuthProviderConfig {
  @JsonProperty('_id', String, true)
  public readonly id?: string = undefined;

  @JsonProperty('name')
  public readonly name: string = AuthProviderType.Userpass as string;

  @JsonProperty('type')
  public readonly type: AuthProviderType = AuthProviderType.Userpass;

  @JsonProperty('metadata_fields', [MetadataField], true)
  public readonly metadataFields?: MetadataField[] = undefined;

  @JsonProperty('domain_restrictions', [String], true)
  public readonly domainRestrictions?: string[] = undefined;

  @JsonProperty('redirect_uris', [String], true)
  public readonly redirectUris?: string[] = undefined;

  @JsonProperty('config', Any, true)
  public readonly config?: Record<string, any> = undefined;

  @JsonProperty('secret_config', Any, true)
  public readonly secretConfig?: Record<string, any> = undefined;

  @JsonProperty('disabled')
  public readonly disabled: boolean = false;

  constructor(partial?: Partial<AuthProviderConfig>) {
    Object.assign(this, partial);
  }
}

@JsonObject('PartialAuthProviderConfig')
export class PartialAuthProviderConfig {
  @JsonProperty('_id')
  public readonly id: string = '';

  @JsonProperty('name')
  public readonly name: string = AuthProviderType.Userpass as string;

  @JsonProperty('type')
  public readonly type: AuthProviderType = AuthProviderType.Userpass;

  @JsonProperty('disabled')
  public readonly disabled: boolean = false;

  constructor(partial?: Partial<PartialAuthProviderConfig>) {
    Object.assign(this, partial);
  }
}
