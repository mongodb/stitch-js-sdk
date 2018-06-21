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

import { ObjectID } from "bson";
import {
  CoreUserApiKeyAuthProviderClient,
  StitchAuthRequestClient,
  StitchAuthRoutes,
  UserApiKey
} from "mongodb-stitch-core-sdk";
import { UserApiKeyAuthProviderClient } from "../UserApiKeyAuthProviderClient";

export default class UserApiKeyAuthProviderClientImpl
  extends CoreUserApiKeyAuthProviderClient
  implements UserApiKeyAuthProviderClient {
  public constructor(
    requestClient: StitchAuthRequestClient,
    routes: StitchAuthRoutes
  ) {
    super(requestClient, routes);
  }

  public createApiKey(name: string): Promise<UserApiKey> {
    return super.createApiKey(name);
  }

  public fetchApiKey(keyId: ObjectID): Promise<UserApiKey> {
    return super.fetchApiKey(keyId);
  }

  public fetchApiKeys(): Promise<UserApiKey[]> {
    return super.fetchApiKeys();
  }

  public deleteApiKey(keyId: ObjectID): Promise<void> {
    return super.deleteApiKey(keyId);
  }

  public enableApiKey(keyId: ObjectID): Promise<void> {
    return super.enableApiKey(keyId);
  }

  public disableApiKey(keyId: ObjectID): Promise<void> {
    return super.disableApiKey(keyId);
  }
}
