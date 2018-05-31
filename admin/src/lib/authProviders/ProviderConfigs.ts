import { Codec } from "../Codec";

export interface ProviderConfig {
    type: string
    config?: object
}

export class ProviderConfigCodec implements Codec<ProviderConfig> {
    decode(from: object): ProviderConfig {
        return {
            type: from["type"],
            config: from["config"]
        }
    }

    encode(from: ProviderConfig): object {
        return {
            type: from.type,
            config: from.config
        }
    }
}

export class Anon implements ProviderConfig { 
    type = "anon-user";
};

export class ApiKey implements ProviderConfig {
    type: "api-key";
}

export class Userpass implements ProviderConfig {
    type = "local-userpass";
    config = {
        emailConfirmationUrl: this.emailConfirmationUrl,
        resetPasswordUrl: this.resetPasswordUrl,
        confirmEmailSubject: this.confirmEmailSubject,
        resetPasswordSubject: this.resetPasswordSubject,
    }
    constructor(
        readonly emailConfirmationUrl: string,
        readonly resetPasswordUrl: string,
        readonly confirmEmailSubject: string,
        readonly resetPasswordSubject: string,
    ) {
    }
}

export class Custom implements ProviderConfig {
    type = "custom-token";
    config = {
        signingKey: this.signingKey
    }

    constructor(
        readonly signingKey: string
    ) {
    }
}
