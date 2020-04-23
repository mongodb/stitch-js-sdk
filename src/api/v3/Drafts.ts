import { PartialApp } from './Apps';

import { JsonObject, JsonProperty } from 'json2typescript';

@JsonObject('PartialDraft')
export class PartialDraft {
  @JsonProperty('_id')
  public readonly id: string = '';

  @JsonProperty('user_id')
  public readonly userId: string = '';

  @JsonProperty('app', PartialApp)
  public readonly app: PartialApp = new PartialApp();

  constructor(partial?: Partial<PartialDraft>) {
    Object.assign(this, partial);
  }
}

@JsonObject('AppAssetDiff')
export class AppAssetDiff {
  @JsonProperty('added')
  public readonly added: string[] = [];

  @JsonProperty('deleted')
  public readonly deleted: string[] = [];

  @JsonProperty('modified')
  public readonly modified: string[] = [];

  constructor(partial?: Partial<AppAssetDiff>) {
    Object.assign(this, partial);
  }
}

@JsonObject('DependencyData')
export class DependencyData {
  @JsonProperty('name')
  public readonly name: string = '';

  @JsonProperty('version')
  public readonly version: string = '';

  constructor(partial?: Partial<DependencyData>) {
    Object.assign(this, partial);
  }
}

@JsonObject('DependencyDiffData')
export class DependencyDiffData {
  @JsonProperty('name')
  public readonly name: string = '';

  @JsonProperty('version')
  public readonly version: string = '';

  @JsonProperty('previous_version')
  public readonly previousVersion: string = '';

  constructor(partial?: Partial<DependencyDiffData>) {
    Object.assign(this, partial);
  }
}

@JsonObject('AppDependenciesDiff')
export class AppDependenciesDiff {
  @JsonProperty('added', [DependencyData])
  public readonly added: DependencyData[] = [];

  @JsonProperty('deleted', [DependencyData])
  public readonly deleted: DependencyData[] = [];

  @JsonProperty('modified', [DependencyData])
  public readonly modified: DependencyDiffData[] = [];

  constructor(partial?: Partial<AppDependenciesDiff>) {
    Object.assign(this, partial);
  }
}

@JsonObject('FieldDiff')
export class FieldDiff {
  @JsonProperty('field')
  public readonly field: string = '';

  @JsonProperty('previous')
  public readonly previousValue: any = undefined;

  @JsonProperty('updated')
  public readonly updatedValue: any = undefined;

  constructor(partial?: Partial<FieldDiff>) {
    Object.assign(this, partial);
  }
}

@JsonObject('SchemaOptionsDiff')
export class SchemaOptionsDiff {
  @JsonProperty('graphql_validation_diff', [FieldDiff])
  public readonly graphQLValidationDiffs: FieldDiff[] = [];

  @JsonProperty('rest_validation_diff', [FieldDiff])
  public readonly restValidationDiffs: FieldDiff[] = [];

  constructor(partial?: Partial<SchemaOptionsDiff>) {
    Object.assign(this, partial);
  }
}

@JsonObject('GraphQLConfigDiff')
export class GraphQLConfigDiff {
  @JsonProperty('field_diffs', [FieldDiff])
  public readonly fieldDiffs: FieldDiff[] = [];

  constructor(partial?: Partial<GraphQLConfigDiff>) {
    Object.assign(this, partial);
  }
}

@JsonObject('DraftDiff')
export class DraftDiff {
  @JsonProperty('diffs')
  public readonly diffs: string[] = [];

  @JsonProperty('hosting_files_diff', AppAssetDiff)
  public readonly hostingFilesDiff: AppAssetDiff = new AppAssetDiff();

  @JsonProperty('dependencies_diff', AppDependenciesDiff)
  public readonly dependenciesDiff: AppDependenciesDiff = new AppDependenciesDiff();

  @JsonProperty('graphql_config_diff', GraphQLConfigDiff)
  public readonly graphQLConfigDiff: GraphQLConfigDiff = new GraphQLConfigDiff();

  @JsonProperty('schema_options_diff', SchemaOptionsDiff)
  public readonly schemaOptionsDiff: SchemaOptionsDiff = new SchemaOptionsDiff();

  constructor(partial?: Partial<DraftDiff>) {
    Object.assign(this, partial);
  }
}
