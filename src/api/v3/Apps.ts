import { JsonObject, JsonProperty } from 'json2typescript';

export enum Location {
  Virginia = 'US-VA',
  Ireland = 'IE',
  Sydney = 'AU',
  Oregon = 'US-OR',
}

export enum DeploymentModel {
  Global = 'GLOBAL',
  Local = 'LOCAL',
}

@JsonObject('PartialApp')
export class PartialApp {
  @JsonProperty('_id')
  public readonly id: string = '';

  @JsonProperty('client_app_id')
  public readonly clientAppId: string = '';

  @JsonProperty('name')
  public readonly name: string = '';

  @JsonProperty('location')
  public readonly location: Location = Location.Virginia;

  @JsonProperty('deployment_model')
  public readonly deploymentModel: DeploymentModel = DeploymentModel.Global;

  @JsonProperty('domain_id')
  public readonly domainId: string = '';

  @JsonProperty('group_id')
  public readonly groupId: string = '';

  @JsonProperty('last_used')
  public readonly lastUsed: number = 0;

  @JsonProperty('last_modified')
  public readonly lastModified: number = 0;

  constructor(partial?: Partial<PartialApp>) {
    Object.assign(this, partial);
  }
}

@JsonObject('CreateAppRequest')
export class CreateAppRequest {
  @JsonProperty('name')
  public readonly name: string = '';

  @JsonProperty('location', String, true)
  public readonly location?: string = undefined;

  @JsonProperty('deployment_model', String, true)
  public readonly deploymentModel?: string = undefined;

  public readonly product?: string;

  constructor(partial?: Partial<CreateAppRequest>) {
    Object.assign(this, partial);
  }
}
