import { Any, JsonConvert, JsonConverter, JsonCustomConvert, JsonObject, JsonProperty } from 'json2typescript';

export interface Rule {
  readonly id?: string;
}

export interface PartialRule {
  readonly id?: string;
}

@JsonObject('MongoDBRulePermissions')
export class MongoDBRulePermissions {
  @JsonProperty('write', Any, true)
  public readonly write?: any = undefined;

  @JsonProperty('read', Any, true)
  public readonly read?: any = undefined;

  constructor(partial?: Partial<MongoDBRulePermissions>) {
    Object.assign(this, partial);
  }
}

@JsonObject('MongoDBRuleField')
export class MongoDBRuleField {
  @JsonProperty('fields', Any, true)
  public readonly fields?: Record<string, MongoDBRuleField> = undefined;

  @JsonProperty('read', Any, true)
  public readonly read?: any = undefined;

  @JsonProperty('write', Any, true)
  public readonly write?: any = undefined;

  @JsonProperty('additional_fields', MongoDBRulePermissions, true)
  public readonly additionalFields?: MongoDBRulePermissions = undefined;

  constructor(partial?: Partial<MongoDBRuleField>) {
    Object.assign(this, partial);
  }
}

@JsonObject('MongoDBRuleRole')
export class MongoDBRuleRole {
  @JsonProperty('name')
  public readonly name: string = '';

  @JsonProperty('apply_when')
  public readonly applyWhen: Record<string, any> = {};

  @JsonProperty('fields', Any, true)
  public readonly fields?: Record<string, MongoDBRuleField> = undefined;

  @JsonProperty('read', Any, true)
  public readonly read?: any = undefined;

  @JsonProperty('write', Any, true)
  public readonly write?: any = undefined;

  @JsonProperty('insert', Any, true)
  public readonly insert?: any = undefined;

  @JsonProperty('delete', Any, true)
  public readonly delete?: any = undefined;

  @JsonProperty('additional_fields', MongoDBRulePermissions, true)
  public readonly additionalFields?: MongoDBRulePermissions = undefined;

  constructor(partial?: Partial<MongoDBRuleRole>) {
    Object.assign(this, partial);
  }
}

@JsonObject('MongoDBRuleFilter')
export class MongoDBRuleFilter {
  @JsonProperty('name')
  public readonly name: string = '';

  @JsonProperty('query')
  public readonly query: Record<string, any> = {};

  @JsonProperty('projection', Any, true)
  public readonly projection?: Record<string, any> = undefined;

  @JsonProperty('apply_when')
  public readonly applyWhen: Record<string, any> = {};

  constructor(partial?: Partial<MongoDBRuleFilter>) {
    Object.assign(this, partial);
  }
}

@JsonObject('MongoDBRuleRelationship')
export class MongoDBRuleRelationship {
  @JsonProperty('ref')
  public readonly ref: string = '';

  @JsonProperty('foreign_key')
  public readonly foreignKey: string = '';

  @JsonProperty('is_list')
  public readonly isList: boolean = false;

  constructor(partial?: Partial<MongoDBRuleRelationship>) {
    Object.assign(this, partial);
  }
}

@JsonObject('MongoDBRule')
export class MongoDBRule implements Rule {
  @JsonProperty('_id', String, true)
  public readonly id?: string = undefined;

  @JsonProperty('database')
  public readonly database: string = '';

  @JsonProperty('collection')
  public readonly collection: string = '';

  @JsonProperty('filter', MongoDBRuleFilter, true)
  public readonly filter?: MongoDBRuleFilter = undefined;

  @JsonProperty('roles', [MongoDBRuleRole], true)
  public readonly roles?: MongoDBRuleRole[] = undefined;

  @JsonProperty('schema', Any, true)
  public readonly schema?: any = undefined;

  @JsonProperty('relationships', Any, true)
  public readonly relationships?: Record<string, MongoDBRuleRelationship> = undefined;

  constructor(partial?: Partial<MongoDBRule>) {
    Object.assign(this, partial);
  }
}

@JsonObject('PartialMongoDBRule')
export class PartialMongoDBRule implements Rule {
  @JsonProperty('_id')
  public readonly id: string = '';

  @JsonProperty('database')
  public readonly database: string = '';

  @JsonProperty('collection')
  public readonly collection: string = '';

  constructor(partial?: Partial<PartialMongoDBRule>) {
    Object.assign(this, partial);
  }
}

@JsonObject('BuiltinRule')
export class BuiltinRule implements Rule {
  @JsonProperty('_id', String, true)
  public readonly id?: string = undefined;

  @JsonProperty('name')
  public readonly name: string = '';

  @JsonProperty('actions', [String])
  public readonly actions: string[] = [];

  @JsonProperty('when', Any, true)
  public readonly when?: Record<string, any> = undefined;

  constructor(partial?: Partial<BuiltinRule>) {
    Object.assign(this, partial);
  }
}

@JsonObject('PartialBuiltinRule')
export class PartialBuiltinRule implements Rule {
  @JsonProperty('_id')
  public readonly id: string = '';

  @JsonProperty('name')
  public readonly name: string = '';

  constructor(partial?: Partial<BuiltinRule>) {
    Object.assign(this, partial);
  }
}

const jsonConvert: JsonConvert = new JsonConvert();

export const deserializeRule = (data: any) => {
  if ('database' in data) {
    return jsonConvert.deserializeObject(data, MongoDBRule);
  }
  return jsonConvert.deserializeObject(data, BuiltinRule);
};

export const deserializePartialRule = (data: any) => {
  if ('database' in data) {
    return jsonConvert.deserializeObject(data, PartialMongoDBRule);
  }
  return jsonConvert.deserializeObject(data, PartialBuiltinRule);
};

/* eslint-disable class-methods-use-this */
@JsonConverter
export class RulesConverter implements JsonCustomConvert<Rule[]> {
  public serialize(rules: Rule[]): any {
    return jsonConvert.serializeArray(rules);
  }

  public deserialize(rulesData: any): Rule[] {
    if (!(rulesData instanceof Array)) {
      throw new Error('expected rules to be an array');
    }
    return Object.values(rulesData).map(deserializeRule);
  }
}
