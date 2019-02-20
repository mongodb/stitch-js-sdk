/**
 * Copyright 2018-present MongoDB, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

export class AwsRuleCreator {
  public type = "aws";
  constructor(readonly name: string, readonly actions: string[]) {}
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
  | AwsRuleCreator
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
    from.rule["namespace".toString()] = from.namespace;
    return from.rule;
  }
}

export class RuleResponse {}

export class RuleResponseCodec implements Codec<RuleResponse> {
  public encode(from: RuleResponse): object {
    return {};
  }

  public decode(from: any): RuleResponse {
    return {};
  }
}
