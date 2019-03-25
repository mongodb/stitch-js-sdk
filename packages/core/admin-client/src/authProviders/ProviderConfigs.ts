import { json } from "../SerializeDecorator";

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

export class Provider {
  @json("_id", { omitEmpty: true })
  public readonly id: string;
  public readonly name: string;
  public readonly type: string;
  public readonly config?: any;
  public readonly disabled: boolean;
}

export class AnonProviderConfig extends Provider {
  public readonly type = "anon-user";
}

export class ApiKey extends Provider {
  public type: "api-key";
}

export class UserpassProviderConfig {
  public constructor(
    public emailConfirmationUrl: string,
    public resetPasswordUrl: string,
    public confirmEmailSubject: string,
    public resetPasswordSubject: string
  ) {}
}

export class UserpassProvider extends Provider {
  public readonly type = "local-userpass";
  public constructor(readonly config: UserpassProviderConfig) {
    super();
  }
}

export class CustomProviderConfig {
  public constructor(readonly signingKey: string) {} 
}

export class CustomProvider extends Provider {
  public type = "custom-token";

  public constructor(public readonly config: CustomProviderConfig) {
    super();
  }
}
