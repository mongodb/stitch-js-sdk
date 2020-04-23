import { Any, JsonObject, JsonProperty } from 'json2typescript';

@JsonObject('AppFunction')
export class AppFunction {
  @JsonProperty('_id', String, true)
  public readonly id?: string = undefined;

  @JsonProperty('name')
  public readonly name: string = '';

  @JsonProperty('source')
  public readonly source: string = '';

  @JsonProperty('transpiled_source', String, true)
  public readonly transpiledSource?: string = undefined;

  @JsonProperty('source_map', Buffer, true)
  public readonly sourceMap?: Buffer = undefined;

  @JsonProperty('can_evaluate', Any, true)
  public readonly canEvaluate?: Record<string, any> = undefined;

  @JsonProperty('private')
  public readonly private: boolean = false;

  @JsonProperty('last_modified', Number, true)
  public readonly lastModified?: number = undefined;

  @JsonProperty('run_as_system', Boolean, true)
  public readonly runAsSystem?: boolean = undefined;

  @JsonProperty('run_as_user_id', String, true)
  public readonly runAsUserId?: string = undefined;

  @JsonProperty('run_as_user_id_script_source', String, true)
  public readonly runAsUserIdScriptSource?: string = undefined;

  @JsonProperty('run_as_user_id_script_transpiled_source', String, true)
  public readonly runAsUserIdScriptTranspiledSource?: string = undefined;

  @JsonProperty('run_as_user_id_script_source_map', Buffer, true)
  public readonly runAsUserIdScripSourceMap?: Buffer = undefined;

  @JsonProperty('disable_arg_logs', Boolean, true)
  public readonly disableArgLogs?: boolean = undefined;

  constructor(partial?: Partial<AppFunction>) {
    Object.assign(this, partial);
  }
}

@JsonObject('PartialAppFunction')
export class PartialAppFunction {
  @JsonProperty('_id')
  public readonly id: string = '';

  @JsonProperty('name')
  public readonly name: string = '';

  @JsonProperty('last_modified', Number, true)
  public readonly lastModified?: number = undefined;
}
