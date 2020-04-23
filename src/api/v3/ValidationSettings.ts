import { JsonObject, JsonProperty } from 'json2typescript';

export enum ValidationAction {
  Error = 'ERROR',
  Warn = 'WARN',
}

export enum ValidationLevel {
  Off = 'OFF',
  Moderate = 'MODERATE',
  Strict = 'STRICT',
}

@JsonObject('ValidationOptions')
export class ValidationOptions {
  @JsonProperty('read_validation_action')
  public readonly readValidationAction: ValidationAction = ValidationAction.Error;

  @JsonProperty('read_validation_level')
  public readonly readValidationLevel: ValidationLevel = ValidationLevel.Off;

  @JsonProperty('write_validation_action')
  public readonly writeValidationAction: ValidationAction = ValidationAction.Error;

  @JsonProperty('write_validation_level')
  public readonly writeValidationLevel: ValidationLevel = ValidationLevel.Off;

  constructor(partial?: Partial<ValidationOptions>) {
    Object.assign(this, partial);
  }
}
