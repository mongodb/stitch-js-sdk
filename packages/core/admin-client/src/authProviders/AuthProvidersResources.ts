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

import { Method } from "mongodb-stitch-core-sdk";
import { TypeCtor } from "../JsonMapper";
import { BasicResource } from "../Resources";
import StitchAdminAuth from "../StitchAdminAuth";
import { Provider } from "./ProviderConfigs";

// Resource for a specific auth provider of an application
export class AuthProviderResource<T extends Provider> extends BasicResource<T> {
  constructor(adminAuth: StitchAdminAuth, url: string, readonly provider: T) {
    super(adminAuth, url);
  }
  public get(): Promise<T> {
    return this._get(this.provider.constructor as TypeCtor<T>);
  }
  public update(data: T): Promise<void> {
    return this._update(data, Method.PATCH);
  }
  public remove(): Promise<void> {
    return this._remove();
  }
  public enable(): Promise<void> {
    return this._enable();
  }
  public disable(): Promise<void> {
    return this._disable();
  }
}

// Resource for listing the auth providers of an application
export class AuthProvidersResource extends BasicResource<Provider> {
  public list(): Promise<Provider[]> {
    return this._list(Provider);
  }

  public create<T extends Provider>(data: T): Promise<T> {
    return this._create(data, data.constructor as TypeCtor<T>).then(created => {
      created.config = data.config;
      return created;
    });
  }

  // GET an auth provider
  // - parameter providerId: id of the provider
  public authProvider<T extends Provider>(provider: T): AuthProviderResource<T> {
    return new AuthProviderResource(this.adminAuth, `${this.url}/${provider.id}`, provider);
  }
}
