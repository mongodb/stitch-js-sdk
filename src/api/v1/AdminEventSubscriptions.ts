import { ResourceType } from '../v3/EventSubscriptions';

import { JsonObject, JsonProperty } from 'json2typescript';

export enum ProducerState {
  Unowned = 'UNOWNED',
  Owned = 'OWNED',
  Disabled = 'DISABLED',
  Failed = 'FAILED',
}

@JsonObject('AdminEventSubscription')
export class AdminEventSubscription {
  @JsonProperty('_id')
  public readonly id: string = '';

  @JsonProperty('name')
  public readonly name: string = '';

  @JsonProperty('type')
  public readonly type: ResourceType = ResourceType.Database;

  @JsonProperty('state')
  public readonly state: ProducerState = ProducerState.Unowned;

  @JsonProperty('updated_at', Number, true)
  public readonly updatedAt?: number = undefined;

  @JsonProperty('error', String, true)
  public readonly error?: string = undefined;

  constructor(partial?: Partial<AdminEventSubscription>) {
    Object.assign(this, partial);
  }
}
