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

import { BasicResource } from "../../Resources";
import { json, Type } from "../../SerializeDecorator";
import StitchAdminAuth from "../../StitchAdminAuth";

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

export class Rule {
  public static aws(name: string, actions: string[]): Rule {
    return new AwsRule(name, actions);
  }

  public static awsS3(name: string, actions: AwsS3Actions[]): Rule {
    return new AwsS3Rule(name, actions);
  }

  public static mongoDb(namespace: string, rule: object): Rule {
    (rule as any).namespace = namespace;
    return new MongoDbRule(namespace, rule);
  }

  @json("_id", { omitEmpty: true })
  public readonly id: string;
  public readonly type: string;
}

class AwsRule extends Rule {
  @json("type") 
  public readonly type = "aws";
  public constructor(
    @json("name") readonly name: string,
    @json("actions") readonly actions: string[]) {
    super();
  }
}

class AwsS3Rule extends Rule {
  @json("type") public type = "aws-s3";
  constructor(
    @json("name") readonly name: string,
    @json("actions") readonly actions: AwsS3Actions[]) {
    super();
  }
}

class AwsSesRule extends Rule {
  @json("type") public type = "aws-ses";

  constructor(
    @json("name") readonly name: string,
    @json("actions") readonly actions: AwsSesActions[]) {
    super();
  }
}

class HttpRule extends Rule {
  @json("type") public type = "http";
  constructor(@json("name") readonly name: string, @json("actions") readonly actions: HttpActions[]) {
    super();
  }
}

class MongoDbRule extends Rule {
  @json("type") 
  public type = "mongodb";
  constructor(
    @json("namespace") readonly namespace: string,
    @json("rule") readonly rule: object) {
    super();
  }
}

class TwilioRule {
  @json("type") public type = "twilio";

  constructor(
    @json("name") readonly name: string, 
    @json("actions") readonly actions: TwilioActions[]) {}
}

// Resource for a specific rule of a service
export class RuleResource<T extends Rule> extends BasicResource<T> {
  constructor(adminAuth: StitchAdminAuth, url: string, readonly rule: T) {
    super(adminAuth, url);
  }

  public get(): Promise<T> {
    return this._get(this.rule.constructor as Type<T>);
  }

  public remove(): Promise<void> {
    return this._remove();
  }
}

// Resource for listing the rules of a service
export class RulesResource extends BasicResource<Rule> {
  public create(data: Rule): Promise<Rule> {
    return this._create(data, Rule);
  }

  public list(): Promise<Rule[]> {
    return this._list(Rule);
  }

  public rule<T extends Rule>(rule: T): RuleResource<T> {
    return new RuleResource(this.adminAuth, `${this.url}/${rule.id}`, rule);
  }
}
