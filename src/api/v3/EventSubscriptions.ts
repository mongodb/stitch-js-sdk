import { JsonObject, JsonProperty } from 'json2typescript';

export enum ResourceType {
  Database = 'DATABASE',
  AuthEvent = 'AUTHENTICATION',
  Scheduled = 'SCHEDULED',
  SyncTranslator = 'SYNCTRANSLATOR',
}

export enum EventProcessorType {
  AWSEventBridge = 'AWS_EVENTBRIDGE',
  Function = 'FUNCTION',
}

@JsonObject('EventProcessor')
export class EventProcessor {
  @JsonProperty('type')
  public readonly type: EventProcessorType = EventProcessorType.Function;

  @JsonProperty('config')
  public readonly config: Record<string, string> = {};

  constructor(partial?: Partial<EventProcessor>) {
    Object.assign(this, partial);
  }
}

@JsonObject('EventSubscriptionResumeOptions')
export class EventSubscriptionResumeOptions {
  @JsonProperty('disable_token')
  public readonly disableToken: boolean = false;

  constructor(partial?: Partial<EventSubscriptionResumeOptions>) {
    Object.assign(this, partial);
  }
}

@JsonObject('EventSubscription')
export class EventSubscription {
  @JsonProperty('_id', String, true)
  public readonly id?: string = undefined;

  @JsonProperty('name')
  public readonly name: string = '';

  @JsonProperty('type')
  public readonly type: ResourceType = ResourceType.Database;

  @JsonProperty('function_id', String, true)
  public readonly functionId?: string = undefined;

  @JsonProperty('function_name', String, true)
  public readonly functionName?: string = undefined;

  @JsonProperty('disabled')
  public readonly disabled: boolean = false;

  @JsonProperty('config')
  public readonly config: Record<string, any> = {};

  @JsonProperty('error', String, true)
  public readonly error?: string = undefined;

  @JsonProperty('last_modified', Number, true)
  public readonly lastModified?: number = undefined;

  @JsonProperty('event_processors', [EventProcessor], true)
  public readonly eventProcessors?: EventProcessor[] = undefined;

  constructor(partial?: Partial<EventSubscription>) {
    Object.assign(this, partial);
  }
}
