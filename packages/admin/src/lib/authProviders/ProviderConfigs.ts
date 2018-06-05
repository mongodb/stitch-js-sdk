import { Codec } from "stitch-core";

export interface ProviderConfig {
  type: string;
  config?: object;
}

export class ProviderConfigCodec implements Codec<ProviderConfig> {
  public decode(from: object): ProviderConfig {
    return {
      config: from["config"],
      type: from["type"]
    };
  }

  public encode(from: ProviderConfig): object {
    return {
      config: from.config,
      type: from.type
    };
  }
}

export class Anon implements ProviderConfig {
  public type = "anon-user";
}

export class ApiKey implements ProviderConfig {
  public type: "api-key";
}

export class Userpass implements ProviderConfig {
  public type = "local-userpass";
  public config = {
    confirmEmailSubject: this.confirmEmailSubject,
    emailConfirmationUrl: this.emailConfirmationUrl,
    resetPasswordSubject: this.resetPasswordSubject,
    resetPasswordUrl: this.resetPasswordUrl
  };
  constructor(
    readonly emailConfirmationUrl: string,
    readonly resetPasswordUrl: string,
    readonly confirmEmailSubject: string,
    readonly resetPasswordSubject: string
  ) {}
}

export class Custom implements ProviderConfig {
  public type = "custom-token";
  public config = {
    signingKey: this.signingKey
  };

  constructor(readonly signingKey: string) {}
}
