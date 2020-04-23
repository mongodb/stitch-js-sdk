import { Any, JsonObject, JsonProperty } from 'json2typescript';

@JsonObject('IncomingWebhook')
export class IncomingWebhook {
  @JsonProperty('_id', String, true)
  public readonly id?: string = undefined;

  @JsonProperty('name')
  public readonly name: string = '';

  @JsonProperty('function_source')
  public readonly functionSource: string = '';

  @JsonProperty('last_modified', Number, true)
  public readonly lastModified?: number = undefined;

  @JsonProperty('can_evaluate', Any, true)
  public readonly canEvaluate?: Record<string, any> = undefined;

  @JsonProperty('run_as_user_id')
  public readonly runAsUserId: string = '';

  @JsonProperty('run_as_user_id_script_source')
  public readonly runAsUserIdScriptSource: string = '';

  @JsonProperty('run_as_authed_user')
  public readonly runAsAuthedUser: boolean = false;

  @JsonProperty('options', Any, true)
  public readonly options?: Record<string, any> = undefined;

  @JsonProperty('respond_result')
  public readonly respondResult: boolean = false;

  @JsonProperty('disable_arg_logs', Boolean, true)
  public readonly disableArgLogs?: boolean = undefined;

  @JsonProperty('fetch_custom_user_data')
  public readonly fetchCustomUserData: boolean = false;

  @JsonProperty('create_user_on_auth')
  public readonly createUserOnAuth: boolean = false;

  constructor(partial?: Partial<IncomingWebhook>) {
    Object.assign(this, partial);
  }
}

@JsonObject('PartialIncomingWebhook')
export class PartialIncomingWebhook {
  @JsonProperty('_id', String, true)
  public readonly id: string = '';

  @JsonProperty('name')
  public readonly name: string = '';

  @JsonProperty('last_modified', Number, true)
  public readonly lastModified?: number = undefined;
}
