import { JsonObject, JsonProperty } from 'json2typescript';

@JsonObject('Repository')
export class Repository {
  @JsonProperty('id')
  public readonly id: string = '';

  @JsonProperty('full_name')
  public readonly fullName: string = '';

  @JsonProperty('url')
  public readonly url: string = '';

  constructor(partial?: Partial<Repository>) {
    Object.assign(this, partial);
  }
}

@JsonObject('AutomaticDeploymentConfig')
export class AutomaticDeploymentConfig {
  @JsonProperty('enabled')
  public readonly enabled: boolean = false;

  @JsonProperty('provider', String, true)
  public readonly providerType?: string = undefined;

  @JsonProperty('installation_ids')
  public readonly installationIds: string[] = [];

  @JsonProperty('repository', Repository, true)
  public readonly repository?: Repository = undefined;

  @JsonProperty('branch', String, true)
  public readonly branch?: string = undefined;

  @JsonProperty('directory', String, true)
  public readonly directory?: string = undefined;

  @JsonProperty('last_modified')
  public readonly lastModified: number = 0;

  constructor(partial?: Partial<AutomaticDeploymentConfig>) {
    Object.assign(this, partial);
  }
}

@JsonObject('PartialCodeDeploy')
export class PartialCodeDeploy {
  @JsonProperty('ui_drafts_disabled')
  public readonly uiDraftsDisabled: boolean = false;

  @JsonProperty('automatic_deployment')
  public readonly automaticDeploymentConfig: AutomaticDeploymentConfig = new AutomaticDeploymentConfig();

  constructor(partial?: Partial<PartialCodeDeploy>) {
    Object.assign(this, partial);
  }
}

@JsonObject('Installation')
export class Installation {
  @JsonProperty('_id')
  public readonly id: string = '';

  @JsonProperty('provider')
  public readonly providerType: string = '';

  @JsonProperty('installation_id')
  public readonly installationId: string = '';

  @JsonProperty('owner_id')
  public readonly ownerId: string = '';

  @JsonProperty('authenticated_repositories', [Repository])
  public readonly authenticatedRepositories: Repository[] = [];

  constructor(partial?: Partial<Installation>) {
    Object.assign(this, partial);
  }
}

@JsonObject('AutomaticDeploymentConfigUpdateRequest')
export class AutomaticDeploymentConfigUpdateRequest {
  @JsonProperty('enabled', Boolean, true)
  public readonly enabled?: boolean = undefined;

  constructor(partial?: Partial<AutomaticDeploymentConfigUpdateRequest>) {
    Object.assign(this, partial);
  }
}

@JsonObject('CodeDeployUpdateRequest')
export class CodeDeployUpdateRequest {
  @JsonProperty('ui_drafts_disabled', Boolean, true)
  public readonly uiDraftsDisabled?: boolean = undefined;

  @JsonProperty('automatic_deployment', AutomaticDeploymentConfigUpdateRequest, true)
  public readonly automaticDeploymentConfig?: AutomaticDeploymentConfigUpdateRequest = undefined;

  constructor(partial?: Partial<CodeDeployUpdateRequest>) {
    Object.assign(this, partial);
  }
}

@JsonObject('GitHubBranch')
export class GitHubBranch {
  @JsonProperty('name')
  public readonly name: string = '';

  constructor(partial?: Partial<GitHubBranch>) {
    Object.assign(this, partial);
  }
}
