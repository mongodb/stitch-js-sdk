import { JsonObject, JsonProperty } from 'json2typescript';

export enum RequestOrigin {
  UI = 'UI',
  AdminAPI = 'Admin API',
  CLI = 'CLI',
  GitHubWebhook = 'GitHub Webhook',
}

export enum DeploymentStatus {
  Created = 'created',
  Successful = 'successful',
  Failed = 'failed',
  Pending = 'pending',
}

@JsonObject('Deployment')
export class Deployment {
  @JsonProperty('_id')
  public readonly id: string = '';

  @JsonProperty('app_id')
  public readonly appId: string = '';

  @JsonProperty('draft_id', String, true)
  public readonly draftId?: string = undefined;

  @JsonProperty('user_id', String, true)
  public readonly userId?: string = undefined;

  @JsonProperty('deployed_at')
  public readonly deployedAt: number = 0;

  @JsonProperty('origin')
  public readonly origin: RequestOrigin = RequestOrigin.UI;

  @JsonProperty('commit')
  public readonly commit: string = '';

  @JsonProperty('status')
  public readonly status: DeploymentStatus = DeploymentStatus.Pending;

  @JsonProperty('status_error_message')
  public readonly statusErrorMessage: string = '';

  @JsonProperty('diff_url')
  public readonly diffUrl: string = '';

  constructor(partial?: Partial<Deployment>) {
    Object.assign(this, partial);
  }
}

export interface DeploymentsFilter {
  readonly before?: number;
  readonly limit?: number;
  readonly draftId?: string;
  readonly userId?: string;
}
