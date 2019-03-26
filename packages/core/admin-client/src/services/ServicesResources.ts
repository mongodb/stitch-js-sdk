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
import { Type } from "../JsonMapper";
import { BasicResource } from "../Resources";
import StitchAdminAuth from "../StitchAdminAuth";
import { Rule, RulesResource } from "./rules/RulesResources";
import { Config, Service } from "./ServiceConfigs";

export class ConfigResource<T extends Config> extends BasicResource<T> {
  constructor(adminAuth: StitchAdminAuth, url: string, private readonly config: T) {
    super(adminAuth, url);
  }

  public get(): Promise<T> {
    return this._get(this.config.constructor as Type<T>);
  }

  public update(data: T): Promise<void> {
    return this._update(data, Method.PATCH);
  }
}

// Resource for a specific service of an application. Can fetch rules
// Of the service
export class ServiceResource<U extends Rule, T extends Service<U>> extends BasicResource<T> {
  public readonly rules = new RulesResource<U>(this.adminAuth, `${this.url}/rules`, this.service.ruleType);
  public readonly config = new ConfigResource(this.adminAuth, `${this.url}/config`, this.service.config);

  constructor(adminAuth: StitchAdminAuth, url: string, private readonly service: T) {
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
export class ServicesResource extends BasicResource<Service<Rule>> {
  public list(): Promise<Array<Service<Rule>>> {
    return this._list(class extends Service<Rule> {
      public readonly ruleType = Rule
    });
  }

  public create<U extends Rule, T extends Service<U>>(data: T): Promise<T> {
    return this._create(data, data.constructor as Type<T>).then((result) => {
      data.id = result.id;
      data.version = result.version;
      return data;
    });
  }

  // GET a service
  // - parameter id: id of the requested service
  public service<U extends Rule, T extends Service<U>>(service: T): ServiceResource<U, T> {
    return new ServiceResource<U, T>(this.adminAuth, `${this.url}/${service.id}`, service);
  }
}
