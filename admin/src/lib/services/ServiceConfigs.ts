import { Codec } from "../Codec";

export interface ServiceConfig {
  readonly name: string;
  readonly type: string;
  readonly config: object;

  readonly configCodec?: Codec<any>;
}

export class ServiceConfigCodec implements Codec<ServiceConfig> {
  decode(from: object): ServiceConfig {
    const type = from["type"];
    let config: object = from["config"];
    if (type === "twilio") {
      config = new TwilioConfigCodec().decode(config);
    }

    return {
      name: from["name"],
      type: from["type"],
      config
    };
  }

  encode(from: ServiceConfig): object {
    return {
      name: from.name,
      type: from.type,
      config: from.configCodec
        ? from.configCodec.encode(from.config)
        : from.config
    };
  }
}

export class Http implements ServiceConfig {
  readonly config = {};
  readonly type = "http";

  constructor(readonly name: string) {}
}

export interface AwsS3Config {
  readonly region: String;
  readonly accessKeyId: String;
  readonly secretAccessKey: String;
}

export class AwsS3 implements ServiceConfig {
  readonly type = "aws-s3";
  constructor(readonly name, readonly config: AwsS3Config) {}
}

export interface AwsSesConfig {
  readonly region: String;
  readonly accessKeyId: String;
  readonly secretAccessKey: String;
}

export class AwsSes implements ServiceConfig {
  readonly type = "aws-ses";
  constructor(readonly name, readonly config: AwsSesConfig) {}
}

export enum TwilioConfigFields {
  AuthToken = "auth_token",
  AccountSid = "sid"
}

export interface TwilioConfig {
  readonly authToken: String;
  readonly accountSid: String;
}

export class TwilioConfigCodec implements Codec<TwilioConfig> {
  decode(from: object): TwilioConfig {
    return {
      authToken: from[TwilioConfigFields.AuthToken],
      accountSid: from[TwilioConfigFields.AccountSid]
    };
  }

  encode(from: TwilioConfig): object {
    return {
      [TwilioConfigFields.AuthToken]: from.authToken,
      [TwilioConfigFields.AccountSid]: from.accountSid
    };
  }
}

export class Twilio implements ServiceConfig {
  readonly configCodec = new TwilioConfigCodec();
  readonly type = "twilio";
  constructor(readonly name, readonly config: TwilioConfig) {}
}

export interface MongoConfig {
  readonly uri: string;
}

export class Mongo implements ServiceConfig {
  constructor(readonly name, readonly type, readonly config: MongoConfig) {}
}
