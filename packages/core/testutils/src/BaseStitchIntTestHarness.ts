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

import fetch from "cross-fetch";
import {
  App,
  AppResource,
  AppsResource,
  Provider,
  Rule,
  Service,
  ServiceResource,
  StitchAdminClient
} from "mongodb-stitch-core-admin-client";
import {
  BSON,
  UserApiKeyAuthProvider,
  UserPasswordCredential
} from "mongodb-stitch-core-sdk";

jest.setTimeout(30000);

export default abstract class BaseStitchIntTestHarness {
  protected abstract readonly stitchBaseUrl: string;

  private groupId = "";
  private appResources: AppResource[] = [];
  private initialized = false;

  private readonly adminClient: StitchAdminClient = new StitchAdminClient(
    this.stitchBaseUrl
  );

  public setup(): Promise<void> {
    // Verify stitch is up
    return fetch(this.stitchBaseUrl)
      .then(result =>
        this.adminClient.loginWithCredential(
          new UserPasswordCredential("unique_user@domain.com", "password")
        )
      )
      .then(result => this.adminClient.adminProfile())
      .then(profile => {
        this.groupId = profile.roles[0].groupId;
        this.initialized = true;
      })
      .catch(e => {
        throw new Error(
          `Expected Stitch server to be available at '${this.stitchBaseUrl}': ${
            e.message
          }`
        );
      });
  }

  public teardown(): Promise<void> {
    if (!this.initialized) {
      return Promise.resolve();
    }

    return Promise.all(
      this.appResources.map(app => {
        app.remove();
      })
    ).then(() => {
      this.adminClient.logout();
      this.adminClient.close();
    });
  }

  public appsResource(): AppsResource {
    return this.adminClient.apps(this.groupId);
  }

  public async createApp(
    appName = `test-${new BSON.ObjectID().toHexString()}`
  ): Promise<{app: App, appResource: AppResource}> {
    return this.adminClient
      .apps(this.groupId)
      .create(appName)
      .then((app: App) => {
        const appResource: AppResource = this.adminClient.apps(this.groupId).app(app.id);
        this.appResources.push(appResource);
        return {app, appResource};
      });
  }

  public async addProvider<T extends Provider>(
    app: AppResource,
    config: T
  ): Promise<T> {
    let authProvider: T;
    return app.authProviders
      .create(config)
      .then(resp => {
        authProvider = resp;
        return app.authProviders.authProvider(resp).enable();
      })
      .then(() => authProvider);
  }

  public async enableApiKeyProvider(app: AppResource): Promise<void> {
    return app.authProviders.list().then(responses => {
      const apiKeyProvider = responses.find(
        it => it.name === UserApiKeyAuthProvider.DEFAULT_NAME
      )!;
      return app.authProviders.authProvider(apiKeyProvider).enable();
    });
  }

  public async addService<T extends Service>(
    app: AppResource,
    config: T
  ): Promise<Array<T | ServiceResource<T>>> {
    return app.services.create(config).then(svcInfo => {
      const svc = app.services.service(svcInfo);
      return [svcInfo, svc];
    });
  }

  public async addRule<T extends Service>(
    svc: ServiceResource<T>,
    config: Rule
  ): Promise<Rule> {
    return svc.rules.create(config);
  }
}
