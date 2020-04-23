import { JsonObject, JsonProperty } from 'json2typescript';

@JsonObject('CreateTempAPIKeyRequest')
export class CreateTempAPIKeyRequest {
  @JsonProperty('desc')
  public readonly desc: string = '';

  constructor(partial?: Partial<CreateTempAPIKeyRequest>) {
    Object.assign(this, partial);
  }
}

@JsonObject('CreateTempAPIKeyResponse')
export class CreateTempAPIKeyResponse {
  @JsonProperty('desc')
  public readonly desc: string = '';

  @JsonProperty('key')
  public readonly key: string = '';

  constructor(partial?: Partial<CreateTempAPIKeyResponse>) {
    Object.assign(this, partial);
  }
}
