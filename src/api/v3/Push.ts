import { JsonObject, JsonProperty } from 'json2typescript';

export enum MessageState {
  Draft = 'draft',
  Sent = 'sent',
}

@JsonObject('PushNotification')
export class PushNotification {
  @JsonProperty('_id')
  public readonly id: string = '';

  @JsonProperty('appID')
  public readonly appId: string = '';

  @JsonProperty('state')
  public readonly state: MessageState = MessageState.Draft;

  @JsonProperty('topic')
  public readonly topic: string = '';

  @JsonProperty('message')
  public readonly message: string = '';

  @JsonProperty('label')
  public readonly label: string = '';

  @JsonProperty('created')
  public readonly created: Date = new Date(0);

  @JsonProperty('sent')
  public readonly sent: Date = new Date(0);

  constructor(partial?: Partial<PushNotification>) {
    Object.assign(this, partial);
  }
}

@JsonObject('SendNotificationRequest')
export class SendNotificationRequest {
  @JsonProperty('topic')
  public readonly topic: string = '';

  @JsonProperty('message')
  public readonly message: string = '';

  @JsonProperty('label')
  public readonly label: string = '';

  @JsonProperty('state')
  public readonly state: string = '';

  constructor(partial?: Partial<SendNotificationRequest>) {
    Object.assign(this, partial);
  }
}
