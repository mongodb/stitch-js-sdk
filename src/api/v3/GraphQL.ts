import { Any, JsonObject, JsonProperty } from 'json2typescript';

@JsonObject('GraphQLConfig')
export class GraphQLConfig {
  @JsonProperty('use_natural_pluralization')
  public readonly useNaturalPluralization: boolean = false;

  constructor(partial?: Partial<GraphQLConfig>) {
    Object.assign(this, partial);
  }
}

export enum GraphQLAlertType {
  Mongo = 'mongo',
  Custom = 'custom',
}

@JsonObject('GraphQLAlert')
export class GraphQLAlert {
  @JsonProperty('error_code')
  public readonly errorCode: string = '';

  @JsonProperty('message')
  public readonly message: string = '';

  @JsonProperty('details', Any, true)
  public readonly ruleId?: Record<string, any> = undefined;

  constructor(partial?: Partial<GraphQLAlert>) {
    Object.assign(this, partial);
  }
}

export enum GraphQLResolverType {
  Query = 'Query',
  Mutation = 'Mutation',
}

@JsonObject('CustomResolver')
export class CustomResolver {
  @JsonProperty('_id', String, true)
  public readonly id?: string = undefined;

  @JsonProperty('function_id')
  public readonly functionId: string = '';

  @JsonProperty('on_type')
  public readonly onType: GraphQLResolverType = GraphQLResolverType.Query;

  @JsonProperty('field_name')
  public readonly fieldName: string = '';

  @JsonProperty('input_type', Any, true)
  public readonly inputType?: any = undefined;

  @JsonProperty('payload_type', Any, true)
  public readonly payloadType?: any = undefined;

  constructor(partial?: Partial<CustomResolver>) {
    Object.assign(this, partial);
  }
}

@JsonObject('GraphQLAlerts')
export class GraphQLAlerts {
  @JsonProperty('type')
  public readonly type: GraphQLAlertType = GraphQLAlertType.Mongo;

  @JsonProperty('service_id')
  public readonly serviceId: string = '';

  @JsonProperty('rule_id')
  public readonly ruleId: string = '';

  @JsonProperty('custom_resolver_id')
  public readonly customResolverId: string = '';

  /* eslint-disable react/static-property-placement */
  @JsonProperty('display_name')
  public readonly displayName: string = '';

  @JsonProperty('warnings', [GraphQLAlert])
  public readonly warnings: GraphQLAlert[] = [];

  @JsonProperty('errors', [GraphQLAlert])
  public readonly errors: GraphQLAlert[] = [];

  constructor(partial?: Partial<GraphQLAlerts>) {
    Object.assign(this, partial);
  }
}
