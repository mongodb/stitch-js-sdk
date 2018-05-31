import { Codec, Encoder } from "../../Codec";

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

export class AwsS3 {
  type = "aws-s3";
  constructor(readonly name: string, readonly actions: Set<AwsS3Actions>) {}
}
export class AwsSes {
  type = "aws-ses";
  constructor(readonly name: string, readonly actions: Set<AwsSesActions>) {}
}
export class Http {
  type = "http";
  constructor(readonly name: string, readonly actions: Set<HttpActions>) {}
}
export class MongoDb {
  type = "mongodb";
  constructor(readonly namespace: string, readonly rule: object) {}
}
export class Twilio {
  type = "twilio";
  constructor(readonly name: string, readonly actions: Set<TwilioActions>) {}
}

export type RuleCreator = AwsS3 | AwsSes | Http | MongoDb;

export class RuleCreatorCodec implements Encoder<RuleCreator> {
  encode(from: RuleCreator): object {
    switch (from.type) {
      case "mongodb":
        return new MongoDbCodec().encode(from as MongoDb);
      default:
        return from;
    }
  }
}

export class MongoDbCodec implements Encoder<MongoDb> {
  encode(from: MongoDb): object {
    from.rule["namespace"] = from.namespace;
    return from.rule;
  }
}

export class RuleResponse {}

export class RuleResponseCodec implements Codec<RuleResponse> {
  encode(from: RuleResponse): object {
    return {};
  }

  decode(from: object): RuleResponse {
    return {};
  }
}
