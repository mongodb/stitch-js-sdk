import { JsonObject, JsonProperty } from 'json2typescript';

export enum HostingStatus {
  Ok = 'setup_ok',
  ChangeInProgress = 'change_in_progress',
  ChangeFailed = 'change_failed',
  ChangeFailedFatal = 'change_failed_fatal',
}

@JsonObject('HostingConfig')
export class HostingConfig {
  @JsonProperty('enabled')
  public readonly enabled: boolean = false;

  @JsonProperty('status')
  public readonly status: HostingStatus = HostingStatus.Ok;

  @JsonProperty('status_error_message', String, true)
  public readonly statusErrorMessage?: string = undefined;

  @JsonProperty('default_domain', Number, true)
  public readonly defaultDomain?: number = undefined;

  constructor(partial?: Partial<HostingConfig>) {
    Object.assign(this, partial);
  }
}

@JsonObject('DefaultDomain')
export class DefaultDomain {
  @JsonProperty('provider_type')
  public readonly providerType: string = '';

  @JsonProperty('config')
  public readonly config: Record<string, any> = {};

  constructor(partial?: Partial<DefaultDomain>) {
    Object.assign(this, partial);
  }
}

@JsonObject('AssetMetadata')
export class AssetMetadata {
  @JsonProperty('appId')
  public readonly appId: string = '';

  @JsonProperty('path')
  public readonly path: string = '';

  @JsonProperty('hash')
  public readonly hash: string = '';

  @JsonProperty('size')
  public readonly size: number = 0;

  @JsonProperty('attrs')
  public readonly attributes: Array<{ name: string; value: string }> = [];

  @JsonProperty('last_modified', Number, true)
  public readonly lastModified?: number = undefined;

  @JsonProperty('url', String, true)
  public readonly url?: string = undefined;

  constructor(partial?: Partial<AssetMetadata>) {
    Object.assign(this, partial);
  }
}

@JsonObject('TransformAssetRequest')
export class TransformAssetRequest {
  @JsonProperty('move_from')
  public readonly moveFrom: string = '';

  @JsonProperty('move_to')
  public readonly moveTo: string = '';

  @JsonProperty('copy_from')
  public readonly copyFrom: string = '';

  @JsonProperty('copy_to')
  public readonly copyTo: string = '';

  constructor(partial?: Partial<TransformAssetRequest>) {
    Object.assign(this, partial);
  }
}
