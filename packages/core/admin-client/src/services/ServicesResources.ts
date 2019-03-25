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

import { BasicResource } from "../Resources";
import { Type } from "../SerializeDecorator";
import StitchAdminAuth from "../StitchAdminAuth";
import { RulesResource } from "./rules/RulesResources";
import { Service } from "./ServiceConfigs";

// Resource for a specific service of an application. Can fetch rules
// Of the service
export class ServiceResource<T extends Service> extends BasicResource<T> {
  public readonly rules = new RulesResource(this.adminAuth, `${this.url}/rules`);

  constructor(adminAuth: StitchAdminAuth, url: string, readonly service: T) {
    super(adminAuth, url);
  }

  public get(): Promise<T> {
    return this._get(this.service.constructor as Type<T>);
  }

  public remove(): Promise<void> {
    return this._remove();
  }
}

// Resource for listing services of an application
export class ServicesResource extends BasicResource<Service> {
  public list(): Promise<Service[]> {
    return this._list(Service);
  }

  public create<T extends Service>(data: T): Promise<T> {
    return this._create(data, data.constructor as Type<T>);
  }

  // GET a service
  // - parameter id: id of the requested service
  public service<T extends Service>(service: T): ServiceResource<T> {
    return new ServiceResource<T>(this.adminAuth, `${this.url}/${service.id}`, service);
  }
}
