import { Codec, Encoder } from "mongodb-stitch-core-sdk";

export enum AwsS3Actions {
  Put = "put",
  SignPolicy = "signPolicy"
}

export enum AwsSesActions {
  Send = "send"
}

export enum HttpActions {
  Get = "get",
  Post = "post",
  Put = "put",
  Delete = "delete",
  Head = "head",
  Patch = "patch"
}

export enum TwilioActions {
  Send = "send"
}

export class AwsS3RuleCreator {
  public type = "aws-s3";
  constructor(readonly name: string, readonly actions: AwsS3Actions[]) {}
}
export class AwsSesRuleCreator {
  public type = "aws-ses";

  constructor(readonly name: string, readonly actions: AwsSesActions[]) {}
}
export class HttpRuleCreator {
  public type = "http";
  constructor(readonly name: string, readonly actions: HttpActions[]) {}
}
export class MongoDbRuleCreator {
  public type = "mongodb";
  constructor(readonly namespace: string, readonly rule: object) {}
}
export class TwilioRuleCreator {
  public type = "twilio";

  constructor(readonly name: string, readonly actions: TwilioActions[]) {}
}

export type RuleCreator =
  | AwsS3RuleCreator
  | AwsSesRuleCreator
  | HttpRuleCreator
  | MongoDbRuleCreator
  | TwilioRuleCreator;

export class RuleCreatorCodec implements Encoder<RuleCreator> {
  public encode(from: RuleCreator): object {
    switch (from.type) {
      case "mongodb":
        return new MongoDbCodec().encode(from as MongoDbRuleCreator);
      default:
        return from;
    }
  }
}

export class MongoDbCodec implements Encoder<MongoDbRuleCreator> {
  public encode(from: MongoDbRuleCreator): object {
    from.rule["namespace"] = from.namespace;
    return from.rule;
  }
}

export class RuleResponse {}

export class RuleResponseCodec implements Codec<RuleResponse> {
  public encode(from: RuleResponse): object {
    return {};
  }

  public decode(from: object): RuleResponse {
    return {};
  }
}
