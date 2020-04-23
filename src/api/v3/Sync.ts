import { JsonObject, JsonProperty } from 'json2typescript';

@JsonObject('SyncClientSchemaAlert')
export class SyncClientSchemaAlert {
  @JsonProperty('error_code')
  public readonly errorCode: string = '';

  @JsonProperty('error')
  public readonly error: string = '';

  constructor(partial?: Partial<SyncClientSchemaAlert>) {
    Object.assign(this, partial);
  }
}

@JsonObject('SyncClientSchema')
export class SyncClientSchema {
  @JsonProperty('service_id')
  public readonly serviceId: string = '';

  @JsonProperty('rule_id')
  public readonly ruleId: string = '';

  @JsonProperty('collection_display_name')
  public readonly collectionDisplayName: string = '';

  @JsonProperty('model_name')
  public readonly modelName: string = '';

  @JsonProperty('schema')
  public readonly schema: string = '';

  @JsonProperty('warnings', [SyncClientSchemaAlert])
  public readonly warnings: SyncClientSchemaAlert[] = [];

  @JsonProperty('error', SyncClientSchemaAlert)
  public readonly error: SyncClientSchemaAlert = new SyncClientSchemaAlert();

  constructor(partial?: Partial<SyncClientSchema>) {
    Object.assign(this, partial);
  }
}

@JsonObject('SyncConfig')
export class SyncConfig {
  @JsonProperty('development_mode_enabled')
  public readonly developmentModeEnabled: boolean = false;

  @JsonProperty('service_id', String, true)
  public readonly serviceId?: string = undefined;

  constructor(partial?: Partial<SyncConfig>) {
    Object.assign(this, partial);
  }
}

@JsonObject('SyncData')
export class SyncData {
  @JsonProperty('service_id', String, true)
  public readonly serviceId?: string = undefined;

  @JsonProperty('partition_fields', [String], true)
  public readonly partitionFields?: string[] = undefined;

  constructor(partial?: Partial<SyncData>) {
    Object.assign(this, partial);
  }
}
@JsonObject('PatchSyncSchemasRequest')
export class PatchSyncSchemasRequest {
  @JsonProperty('service_id')
  public readonly serviceId: string = '';

  @JsonProperty('partition_key')
  public readonly partitionKey: string = '';

  @JsonProperty('partition_key_type')
  public readonly partitionKeyType: string = '';

  constructor(partial?: Partial<PatchSyncSchemasRequest>) {
    Object.assign(this, partial);
  }
}

@JsonObject('SyncProgress')
export class SyncProgress {
  @JsonProperty('progress')
  public readonly progress: Record<string, SyncProgressDetails> = {};

  constructor(partial?: Partial<SyncProgress>) {
    Object.assign(this, partial);
  }
}

@JsonObject('SyncProgressDetails')
export class SyncProgressDetails {
  @JsonProperty('started_at')
  public readonly startedAt: Date = new Date();

  @JsonProperty('updated_at')
  public readonly updatedAt: Date = new Date();

  @JsonProperty('error', String, true)
  public readonly error?: string = undefined;

  @JsonProperty('documents_completed', Number, true)
  public readonly documentsCompleted?: number = undefined;

  @JsonProperty('total_documents', Number, true)
  public readonly totalDocuments?: number = undefined;

  @JsonProperty('complete', Boolean, true)
  public readonly complete?: boolean = undefined;

  constructor(partial?: Partial<SyncProgressDetails>) {
    Object.assign(this, partial);
  }
}
