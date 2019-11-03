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

import { jsonProperty } from "../JsonMapper";

class Provider {
  @jsonProperty("_id", { omitEmpty: true })
  public readonly id: string;

  @jsonProperty("name")
  public readonly name: string;

  @jsonProperty("type")
  public readonly type: string;

  @jsonProperty("disabled")
  public readonly disabled: boolean;
  
  @jsonProperty("config")
  public config?: any;
}

class AnonProvider extends Provider {
  public readonly type = "anon-user";
}

class ApiKeyProvider extends Provider {
  public readonly type: "api-key";
}

class UserpassProviderConfig {
  public constructor(
    @jsonProperty("emailConfirmationUrl") public emailConfirmationUrl: string,
    
    @jsonProperty("resetPasswordUrl") public resetPasswordUrl: string,
    
    @jsonProperty("confirmEmailSubject") public confirmEmailSubject: string,
    
    @jsonProperty("resetPasswordSubject") public resetPasswordSubject: string,

    @jsonProperty("runResetFunction") public runResetFunction = false,

    @jsonProperty("resetFunctionId") public resetFunctionId = "",

    @jsonProperty("resetFunctionName") public resetFunctionName = ""
  ) {}
}

class UserpassProvider extends Provider {
  public readonly type = "local-userpass";
  public constructor(readonly config: UserpassProviderConfig) {
    super();
  }
}

class FunctionProviderConfig {
  public constructor(
    @jsonProperty("authFunctionId") readonly authFunctionId: string,
    @jsonProperty("authFunctionName") readonly authFunctionName: string
  ) {}
}

class FunctionProvider extends Provider {
  public readonly type = "custom-function"

  public constructor(public readonly config: FunctionProviderConfig) {
    super();
  }
 }

class CustomProviderConfig {
  public constructor(@jsonProperty("signingKey") readonly signingKey: string) {} 
}

class CustomProvider extends Provider {
  public readonly type = "custom-token";

  public constructor(public readonly config: CustomProviderConfig) {
    super();
  }
}

export {
  Provider, 
  AnonProvider as AnonProviderConfig, 
  ApiKeyProvider as ApiKey, 
  UserpassProviderConfig, 
  UserpassProvider, 
  CustomProviderConfig, 
  CustomProvider
};
