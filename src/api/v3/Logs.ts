import { Any, JsonObject, JsonProperty } from 'json2typescript';

@JsonObject('FunctionCallLogItem')
export class FunctionCallLogItem {
  @JsonProperty('name')
  public readonly name: string = '';

  @JsonProperty('arguments', Any, true)
  public readonly arguments?: any = undefined;

  @JsonProperty('service', String, true)
  public readonly service?: string = undefined;

  constructor(partial?: Partial<FunctionCallLogItem>) {
    Object.assign(this, partial);
  }
}

export enum AuthEventType {
  Login = 'login',
  Logout = 'logout',
  Other = 'other',
}

@JsonObject('AuthEvent')
export class AuthEvent {
  @JsonProperty('failed', Boolean, true)
  public readonly failed?: boolean = undefined;

  @JsonProperty('type', Any, true)
  public readonly type?: AuthEventType = AuthEventType.Other;

  @JsonProperty('provider')
  public readonly provider: string = '';

  constructor(partial?: Partial<AuthEvent>) {
    Object.assign(this, partial);
  }
}

@JsonObject('RuleMetrics')
export class RuleMetrics {
  @JsonProperty('namespaces_metrics')
  public readonly namespaceMetrics: Record<string, NamespaceMetrics> = {};

  constructor(partial?: Partial<RuleMetrics>) {
    Object.assign(this, partial);
  }
}

@JsonObject('NamespaceMetrics')
export class NamespaceMetrics {
  @JsonProperty('roles', Any, true)
  public readonly roles: Record<string, RoleMetrics> = {};

  @JsonProperty('no_matching_role')
  public readonly noMatchingRole: number = 0;

  constructor(partial?: Partial<NamespaceMetrics>) {
    Object.assign(this, partial);
  }
}

@JsonObject('RoleMetrics')
export class RoleMetrics {
  @JsonProperty('matching_documents')
  public readonly matchingDocuments: number = 0;

  @JsonProperty('evaluated_fields')
  public readonly evaluatedFields: number = 0;

  @JsonProperty('discarded_fields')
  public readonly discardedFields: number = 0;

  constructor(partial?: Partial<RoleMetrics>) {
    Object.assign(this, partial);
  }
}

@JsonObject('SyncSessionMetrics')
export class SyncSessionMetrics {
  @JsonProperty('uploads', Number, true)
  public readonly uploads?: number = undefined;

  @JsonProperty('downloads', Number, true)
  public readonly downloads?: number = undefined;

  @JsonProperty('errors', Number, true)
  public readonly errors?: number = undefined;

  @JsonProperty('changesets', Number, true)
  public readonly changesets?: number = undefined;

  @JsonProperty('dirty_changesets', Number, true)
  public readonly dirtyChangesets?: number = undefined;

  constructor(partial?: Partial<SyncSessionMetrics>) {
    Object.assign(this, partial);
  }
}

@JsonObject('ModifiedDocIDsByOpType')
export class ModifiedDocIDsByOpType {
  @JsonProperty('inserted', Any, true)
  public readonly inserted?: string[] = undefined;

  @JsonProperty('updated', Any, true)
  public readonly updated?: string[] = undefined;

  @JsonProperty('deleted', Any, true)
  public readonly deleted?: string[] = undefined;

  @JsonProperty('replaced', Any, true)
  public readonly replaced?: string[] = undefined;

  constructor(partial?: Partial<ModifiedDocIDsByOpType>) {
    Object.assign(this, partial);
  }
}

@JsonObject('RequestLogItem')
export class RequestLogItem {
  @JsonProperty('_id')
  public readonly id: string = '';

  @JsonProperty('co_id')
  public readonly coId: string = '';

  @JsonProperty('type')
  public readonly type: string = '';

  @JsonProperty('request_url')
  public readonly requestUrl: string = '';

  @JsonProperty('request_method')
  public readonly requestMethod: string = '';

  @JsonProperty('user_id', String, true)
  public readonly userId?: string = undefined;

  @JsonProperty('domain_id', String, true)
  public readonly domainId?: string = undefined;

  @JsonProperty('app_id', String, true)
  public readonly appId?: string = undefined;

  @JsonProperty('group_id', String, true)
  public readonly groupId?: string = undefined;

  @JsonProperty('service_id', String, true)
  public readonly serviceId?: string = undefined;

  @JsonProperty('remote_ip_address', String, true)
  public readonly remoteIpAddress?: string = undefined;

  @JsonProperty('started', Date, true)
  public readonly started?: Date = undefined;

  @JsonProperty('completed', Date, true)
  public readonly completed?: Date = undefined;

  @JsonProperty('function_call_location', String, true)
  public readonly functionCallLocation?: string = undefined;

  @JsonProperty('function_call', FunctionCallLogItem, true)
  public readonly functionCall?: FunctionCallLogItem = undefined;

  @JsonProperty('function_id', String, true)
  public readonly functionId?: string = undefined;

  @JsonProperty('function_name', String, true)
  public readonly functionName?: string = undefined;

  @JsonProperty('incoming_webhook_args', Any, true)
  public readonly incomingWebhookArgs?: Record<string, Any> = undefined;

  @JsonProperty('incoming_webhook_id', String, true)
  public readonly incomingWebhookId?: string = undefined;

  @JsonProperty('incoming_webhook_name', String, true)
  public readonly incomingWebhookName?: string = undefined;

  @JsonProperty('error', String, true)
  public readonly error?: string = undefined;

  @JsonProperty('error_code', String, true)
  public readonly errorCode?: string = undefined;

  @JsonProperty('error_details', Any, true)
  public readonly errorDetails?: Record<string, any> = undefined;

  @JsonProperty('event_subscription_id', String, true)
  public readonly eventSubscriptionId?: string = undefined;

  @JsonProperty('event_subscription_name', String, true)
  public readonly eventSubscriptionName?: string = undefined;

  @JsonProperty('status', Number, true)
  public readonly status?: number = undefined;

  @JsonProperty('messages', Any, true)
  public readonly messages?: any[] = undefined;

  @JsonProperty('auth_event', AuthEvent, true)
  public readonly authEvent?: AuthEvent = undefined;

  @JsonProperty('mem_time_usage', Number, true)
  public readonly memTimeUsage?: number = undefined;

  @JsonProperty('rule_metrics', RuleMetrics, true)
  public readonly ruleMetrics?: RuleMetrics = undefined;

  @JsonProperty('platform', String, true)
  public readonly platform?: string = undefined;

  @JsonProperty('platform_version', String, true)
  public readonly platformVersion?: string = undefined;

  @JsonProperty('sdk_name', String, true)
  public readonly sdkName?: string = undefined;

  @JsonProperty('sdk_version', String, true)
  public readonly sdkVersion?: string = undefined;

  @JsonProperty('graphql_query', String, true)
  public readonly graphqlQuery?: string = undefined;

  @JsonProperty('sync_partition', String, true)
  public readonly syncPartition?: string = undefined;

  @JsonProperty('sync_session_metrics', SyncSessionMetrics, true)
  public readonly syncSessionMetrics?: SyncSessionMetrics = undefined;

  @JsonProperty('sync_write_summary', Any, true)
  public readonly syncWriteSummary?: Record<string, ModifiedDocIDsByOpType> = undefined;

  @JsonProperty('sync_is_from_mdb', Boolean, true)
  public readonly syncIsFromMdb?: boolean = undefined;

  constructor(partial?: Partial<RequestLogItem>) {
    Object.assign(this, partial);
  }
}

@JsonObject('AppLogResponse')
export class AppLogResponse {
  @JsonProperty('logs', [RequestLogItem])
  public readonly logs: RequestLogItem[] = [];

  @JsonProperty('nextEndDate', Date, true)
  public readonly nextEndDate?: Date = undefined;

  @JsonProperty('nextSkip', Number, true)
  public readonly nextSkip?: number = undefined;

  constructor(partial?: Partial<AppLogResponse>) {
    Object.assign(this, partial);
  }
}

export interface AppLogRequest {
  readonly endDate?: Date;
  readonly startDate?: Date;
  readonly type?: string;
  readonly userId?: string;
  readonly errorsOnly?: boolean;
  readonly coId?: string;
  readonly skip?: number;
}
