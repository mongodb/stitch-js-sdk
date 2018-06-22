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

export interface ProviderConfig {
  type: string;
  config?: object;
}

export class ProviderConfigCodec implements Codec<ProviderConfig> {
  public decode(from: any): ProviderConfig {
    return {
      config: from.config,
      type: from.type
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
  public constructor(
    public readonly emailConfirmationUrl: string,
    public readonly resetPasswordUrl: string,
    public readonly confirmEmailSubject: string,
    public readonly resetPasswordSubject: string
  ) {}
}

export class Custom implements ProviderConfig {
  public type = "custom-token";
  public config = {
    signingKey: this.signingKey
  };

  public constructor(public readonly signingKey: string) {}
}
