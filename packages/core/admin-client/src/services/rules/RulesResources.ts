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

import { jsonProperty, TypeCtor } from "../../JsonMapper";
import { BasicResource } from "../../Resources";
import StitchAdminAuth from "../../StitchAdminAuth";

export enum AwsS3Action {
  Put = "put",
  SignPolicy = "signPolicy"
}

export enum AwsSesAction {
  Send = "send"
}

export enum HttpAction {
  Get = "get",
  Post = "post",
  Put = "put",
  Delete = "delete",
  Head = "head",
  Patch = "patch"
}

export enum TwilioAction {
  Send = "send"
}

export type Action = AwsS3Action | AwsSesAction | HttpAction | TwilioAction | string;

export class Rule {
  @jsonProperty("_id", { omitEmpty: true })
  public id: string;
  
  @jsonProperty("type")
  public readonly type: string;
  
  @jsonProperty("name") 
  public readonly name: string;
  
  @jsonProperty("actions")
  public readonly actions: Action[];
}

export class AwsRule extends Rule {
  public readonly type = "aws";
  public constructor(
    readonly name: string,
    readonly actions: string[]) {
    super();
  }
}

export class AwsS3Rule extends Rule {
  public readonly type = "aws-s3";
  constructor(
    readonly name: string,
    readonly actions: AwsS3Action[]) {
    super();
  }
}

export class AwsSesRule extends Rule {
  public readonly type = "aws-ses";

  constructor(
    readonly name: string,
    readonly actions: AwsSesAction[]) {
    super();
  }
}

export class HttpRule extends Rule {
  public readonly type = "http";
  constructor(
    readonly name: string,
    readonly actions: HttpAction[]) {
    super();
  }
}

export class AdditionalFields { 
  constructor(
    @jsonProperty("write")
    public readonly write: boolean = true,
    
    @jsonProperty("read")
    public readonly read: boolean = true
  ) {
  }
}

export class Role {
  constructor(
    public readonly name = "default",
    
    @jsonProperty("apply_when")
    public readonly applyWhen = {},

    public readonly fields = {},
    
    @jsonProperty("additional_fields")
    public readonly additionalFields = new AdditionalFields(),
    
    public readonly read: boolean = true,
    public readonly write: boolean = true,
    public readonly insert = true,
    
    @jsonProperty("delete")
    public readonly del = true
  ) {
  }
}

export class Schema {
  constructor(@jsonProperty("properties") public readonly properties: object = {}) {
  }
}

export class MongoDbRule extends Rule {  
  constructor(
    public readonly database: string,
    public readonly collection: string,
    @jsonProperty("roles", { typeCtor: Role, isArray: true })
    public readonly roles: [Role],
    public readonly schema: Schema
  ) {
    super();
  }
};

// export class MongoDbRule extends Rule {
//   public readonly type = "mongodb";
//   constructor(
//     @jsonProperty("namespace") readonly namespace: string,
//     @jsonProperty("rule", { typeCtor: MongoDbRuleConfig }) readonly rule: MongoDbRuleConfig) {
//     super();
//   }
// }

export class TwilioRule extends Rule {
  public readonly type = "twilio";

  constructor(
    readonly name: string, 
    readonly actions: TwilioAction[]) {
    super();
  }
}

// Resource for a specific rule of a service
export class RuleResource<T extends Rule> extends BasicResource<T> {
  constructor(adminAuth: StitchAdminAuth, url: string, private readonly rule: T) {
    super(adminAuth, url);
  }

  public get(): Promise<T> {
    return this._get(this.rule.constructor as TypeCtor<T>);
  }

  public remove(): Promise<void> {
    return this._remove();
  }
}

// Resource for listing the rules of a service
export class RulesResource<T extends Rule> extends BasicResource<T> {
  constructor(adminAuth: StitchAdminAuth, url: string, private readonly ruleType: TypeCtor<T>) {
    super(adminAuth, url);
  }

  public create(data: T): Promise<T> {
    return this._create(data, this.ruleType).then(created => {
      data.id = created.id
      return data;
    });
  }

  public list(): Promise<T[]> {
    return this._list(this.ruleType);
  }

  public rule(rule: T): RuleResource<T> {
    return new RuleResource(this.adminAuth, `${this.url}/${rule.id}`, rule);
  }
}
