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

import { Rule } from "..";
import { jsonProperty, TypeCtor } from "../JsonMapper";
import { AwsS3Rule, AwsSesRule, HttpRule, MongoDbRule, TwilioRule } from "./rules/RulesResources";

export type Config = any;

export class TwilioConfig implements Config {
  constructor(
    @jsonProperty("sid")
    public accountSid: string,

    @jsonProperty("auth_token", { omitEmpty: true })
    public authToken?: string) {
  }
}

export class AwsConfig implements Config {
  constructor(
    public readonly accessKeyId: string,
    public readonly secretAccessKey: string) {}
}

export class AwsS3Config implements Config {
  constructor(
    public readonly region: string,
    public readonly accessKeyId: string,
    public readonly secretAccessKey: string) {}
}

export class AwsSesConfig implements Config {
  constructor(
    readonly region: string,
    readonly accessKeyId: string,
    readonly secretAccessKey: string) {}
}

export class MongoConfig implements Config {
  constructor(@jsonProperty("uri") readonly uri: string) {}
}

export abstract class Service<T extends Rule> {
  @jsonProperty("_id", { omitEmpty: true })
  public id: string;

  @jsonProperty("type")
  public readonly type: string;
  
  @jsonProperty("name")
  public readonly name: string;
  
  @jsonProperty("config")
  public config: Config;
  
  @jsonProperty("version")
  public version: number;
  
  public abstract get ruleType(): TypeCtor<T>;
}

export class HttpService extends Service<HttpRule> {
  public readonly config = {};
  
  @jsonProperty("type")
  public readonly type = "http";
  
  public get ruleType() {
    return HttpRule;
  }
  
  constructor(@jsonProperty("name") readonly name: string) {
    super();
  }
}

export class AwsS3Service extends Service<AwsS3Rule> {
  public readonly type = "aws-s3";
  public get ruleType() {
    return AwsS3Rule;
  }

  public constructor(
    public readonly name: string,
    @jsonProperty("config", { typeCtor: AwsS3Config }) public readonly config: AwsS3Config
  ) {
    super();
  }
}

export class AwsSesService extends Service<AwsSesRule> {
  public readonly type = "aws-ses";
  public get ruleType() {
    return AwsSesRule;
  }

  public constructor(
    public readonly name: string,
    @jsonProperty("config", { typeCtor: AwsSesConfig }) public readonly config: AwsSesConfig
  ) {
    super();
  }
}

export class TwilioService extends Service<TwilioRule> {
  public readonly type = "twilio";
  public get ruleType() {
    return TwilioRule;
  }

  public constructor(
    public readonly name: string,
    
    @jsonProperty("config", { typeCtor: TwilioConfig })
    public config: TwilioConfig) {
    super();
  }
}

export class MongoDbService extends Service<MongoDbRule> {
  public readonly type: string = "mongodb";
  public readonly name: string = "mongodb1";

  public get ruleType() {
    return MongoDbRule;
  }

  public constructor(
    @jsonProperty("config", { typeCtor: MongoConfig }) 
    public readonly config: MongoConfig
  ) {
    super();
  }
}
