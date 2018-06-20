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

import { Codec } from "mongodb-stitch-core-sdk";

export interface ServiceConfig {
  readonly name: string;
  readonly type: string;
  readonly config: object;

  readonly configCodec?: Codec<any>;
}

export class ServiceConfigCodec implements Codec<ServiceConfig> {
  public decode(from: object): ServiceConfig {
    const type = from["type"];
    let config: object = from["config"];
    if (type === "twilio") {
      config = new TwilioConfigCodec().decode(config);
    }

    return {
      config,
      name: from["name"],
      type: from["type"]
    };
  }

  public encode(from: ServiceConfig): object {
    return {
      config: from.configCodec
        ? from.configCodec.encode(from.config)
        : from.config,
      name: from.name,
      type: from.type
    };
  }
}

export class Http implements ServiceConfig {
  public readonly config = {};
  public readonly type = "http";

  constructor(readonly name: string) {}
}

export interface AwsS3Config {
  readonly region: string;
  readonly accessKeyId: string;
  readonly secretAccessKey: string;
}

export class AwsS3 implements ServiceConfig {
  public readonly type = "aws-s3";
  constructor(readonly name, readonly config: AwsS3Config) {}
}

export interface AwsSesConfig {
  readonly region: string;
  readonly accessKeyId: string;
  readonly secretAccessKey: string;
}

export class AwsSes implements ServiceConfig {
  public readonly type = "aws-ses";
  constructor(readonly name, readonly config: AwsSesConfig) {}
}

export enum TwilioConfigFields {
  AuthToken = "auth_token",
  AccountSid = "sid"
}

export interface TwilioConfig {
  readonly authToken: string;
  readonly accountSid: string;
}

export class TwilioConfigCodec implements Codec<TwilioConfig> {
  public decode(from: object): TwilioConfig {
    return {
      accountSid: from[TwilioConfigFields.AccountSid],
      authToken: from[TwilioConfigFields.AuthToken]
    };
  }

  public encode(from: TwilioConfig): object {
    return {
      [TwilioConfigFields.AuthToken]: from.authToken,
      [TwilioConfigFields.AccountSid]: from.accountSid
    };
  }
}

export class Twilio implements ServiceConfig {
  public readonly configCodec = new TwilioConfigCodec();
  public readonly type = "twilio";
  constructor(readonly name, readonly config: TwilioConfig) {}
}

export interface MongoConfig {
  readonly uri: string;
}

export class Mongo implements ServiceConfig {
  constructor(readonly name, readonly type, readonly config: MongoConfig) {}
}
