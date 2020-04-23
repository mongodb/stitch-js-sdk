import { IncomingWebhook } from './IncomingWebhooks';
import { Rule, RulesConverter } from './Rules';

import { Any, JsonObject, JsonProperty } from 'json2typescript';

@JsonObject('ServiceDesc')
export class ServiceDesc {
  @JsonProperty('_id', String, true)
  public readonly id?: string = undefined;

  @JsonProperty('name')
  public readonly name: string = '';

  @JsonProperty('type')
  public readonly type: string = '';

  @JsonProperty('config', Any, true)
  public readonly config?: Record<string, any> = undefined;

  @JsonProperty('secret_config', Any, true)
  public readonly secretConfig?: Record<string, any> = undefined;

  @JsonProperty('rules', RulesConverter, true)
  public readonly rules?: Rule[] = undefined;

  @JsonProperty('incoming_webhooks', [IncomingWebhook], true)
  public readonly incomingWebhooks?: IncomingWebhook[] = undefined;

  @JsonProperty('version', Number, true)
  public readonly version?: number = undefined;

  @JsonProperty('last_modified', Number, true)
  public readonly lastModified?: number = undefined;

  constructor(partial?: Partial<ServiceDesc>) {
    Object.assign(this, partial);
  }
}

@JsonObject('PartialServiceDesc')
export class PartialServiceDesc {
  @JsonProperty('_id')
  public readonly id: string = '';

  @JsonProperty('name')
  public readonly name: string = '';

  @JsonProperty('type')
  public readonly type: string = '';

  @JsonProperty('version', Number, true)
  public readonly version?: number = undefined;

  @JsonProperty('last_modified', Number, true)
  public readonly lastModified?: number = undefined;

  constructor(partial?: Partial<PartialServiceDesc>) {
    Object.assign(this, partial);
  }
}

@JsonObject('ServiceDescConfig')
export class ServiceDescConfig {
  @JsonProperty('config', Any, true)
  public readonly config?: Record<string, any> = undefined;

  @JsonProperty('secret_config', Any, true)
  public readonly secretConfig?: Record<string, any> = undefined;

  constructor(partial?: Partial<ServiceDescConfig>) {
    Object.assign(this, partial);
  }
}
