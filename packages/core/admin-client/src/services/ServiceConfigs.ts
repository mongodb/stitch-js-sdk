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

import { json } from "../SerializeDecorator";

export class AwsConfig {
  constructor(
    public readonly accessKeyId: string,
    public readonly secretAccessKey: string) {}
}

export class AwsS3Config {
  constructor(
    public readonly region: string,
    public readonly accessKeyId: string,
    public readonly secretAccessKey: string) {}
}

export class AwsSesConfig {
  constructor(
    readonly region: string,
    readonly accessKeyId: string,
    readonly secretAccessKey: string) {}
}

export class MongoConfig {
  constructor(@json("uri") readonly uri: string) {}
}

export class TwilioConfig {
  constructor(
    @json("auth_token")
    public readonly authToken: string,
    @json("sid")
    public readonly accountSid: string) {
  }
}

export class Service {
  public static awsS3(name: string, config: AwsS3Config): Service {
    return new AwsS3(name, config)
  }

  public static http(name: string): Service {
    return new Http(name);
  }

  public static twilio(name: string, config: TwilioConfig): Service {
    return new Twilio(name, config);
  }

  public static mongo(config: MongoConfig): Service {
    return new Mongo(config);
  }

  @json("_id", { omitEmpty: true })
  public readonly id: string;
  public readonly type: string;
  public readonly name: string;
}

class Http extends Service {
  @json("config") public readonly config = {};
  @json("type") public readonly type = "http";
  constructor(@json("name") readonly name: string) {
    super();
  }
}

export class AwsS3 extends Service {
  public readonly type = "aws-s3";
  public constructor(
    @json("name") public readonly name: string,
    @json("config", { prototype: AwsS3Config }) public readonly config: AwsS3Config
  ) {
    super();
  }
}

export class AwsSes extends Service {
  @json("type") public readonly type = "aws-ses";
  public constructor(
    @json("name") public readonly name: string,
    @json("config", { prototype: AwsSesConfig }) public readonly config: AwsSesConfig
  ) {
    super();
  }
}

export class Twilio extends Service {
  @json("type")
  public readonly type = "twilio";
  public constructor(
    @json("name") readonly name: string,
    @json("config", { prototype: TwilioConfig }) readonly config: TwilioConfig) {
    super();
  }
}

export class Mongo extends Service {
  @json("type") public readonly type: string = "mongodb-atlas";
  @json("name") public readonly name: string = "mongodb-atlas";
  public constructor(
    @json("config", { prototype: MongoConfig }) public readonly config: MongoConfig
  ) {
    super();
  }
}
