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

import { EJSON } from "bson";
import { Method, StitchAuthRequest } from "mongodb-stitch-core-sdk";
import { AuthProvidersResource } from "../authProviders/AuthProvidersResources";
import { DebugResource } from "../debug/DebugResources";
import { FunctionsResource } from "../functions/FunctionsResources";
import { deserialize, jsonProperty } from "../JsonMapper";
import { BasicResource, checkEmpty } from "../Resources";
import { ServicesResource } from "../services/ServicesResources";
import { UserRegistrationsResource } from "../userRegistrations/UserRegistrationsResources";
import { UsersResource } from "../users/UsersResources";

/// View into a specific application
export class App {
  /// Unique, internal id of this application
  @jsonProperty("_id")
  public readonly id: string;
  /// Name of this application
  @jsonProperty("name")
  public readonly name: string;
  /// Public, client app id (for `StitchClient`) of this application
  @jsonProperty("client_app_id")
  public readonly clientAppId: string;
  @jsonProperty("location")
  public readonly location: string;
  @jsonProperty("deployment_model")
  public readonly deploymentModel: string;
  @jsonProperty("domain_id")
  public readonly domainId: string
  @jsonProperty("group_id")
  public readonly groupId: string;
}

export class AppResource extends BasicResource<App> {
  public readonly authProviders = new AuthProvidersResource(
    this.adminAuth,
    `${this.url}/auth_providers`
  );
  public readonly debug = new DebugResource(
    this.adminAuth,
    `${this.url}/debug`
  )
  public readonly functions = new FunctionsResource(
    this.adminAuth,
    `${this.url}/functions`
  );
  public readonly services = new ServicesResource(
    this.adminAuth,
    `${this.url}/services`
  );
  public readonly users = new UsersResource(
    this.adminAuth, 
    `${this.url}/users`
  );
  public readonly userRegistrations = new UserRegistrationsResource(
    this.adminAuth,
    `${this.url}/user_registrations`
  );

  public get(): Promise<App> {
    return this._get(App);
  }

  public remove(): Promise<void> {
    return this._remove();
  }
}

export class AppsResource extends BasicResource<App> {
  public list(): Promise<App[]> {
    return this._list(App);
  }

  // POST a new application
  // - parameter name: name of the new application
  // - parameter defaults: whether or not to enable default values
  public create(name: string, product?: string): Promise<App> {
    // this is a special case due to the query string
    const encodedApp = { name };
    const req = new StitchAuthRequest.Builder()
      .withMethod(Method.POST)
      .withPath(`${this.url}?product=${product ? product : ""}`)
      .withBody(JSON.stringify(encodedApp))
      .build();

    return this.adminAuth.doAuthenticatedRequest(req).then(response => {
      checkEmpty(response);
      return deserialize(EJSON.parse(response.body!), App);
    });
  }

  // GET an application
  // - parameter id: id for the application
  public app(appId: string): AppResource {
    return new AppResource(this.adminAuth, `${this.url}/${appId}`);
  }
}
