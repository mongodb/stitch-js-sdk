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

import fetch from "fetch-everywhere";
import BSON from "bson";
import {
  App,
  AppResponse,
  AuthProviderResponse,
  ProviderConfig,
  RuleCreator,
  RuleResponse,
  Service,
  ServiceConfig,
  ServiceResponse,
  StitchAdminClient
} from "mongodb-stitch-core-admin-client";
import {
  UserApiKeyAuthProvider,
  UserPasswordCredential
} from "mongodb-stitch-core-sdk";

jest.setTimeout(30000);

export default abstract class BaseStitchIntTestHarness {
  protected abstract readonly stitchBaseUrl: string;

  private groupId = "";
  private apps: App[] = [];
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
      this.apps.map(app => {
        app.remove();
      })
    ).then(() => {
      this.adminClient.logout();
      this.adminClient.close();
    });
  }

  public async createApp(
    appName = `test-${new BSON.ObjectID().toHexString()}`
  ): Promise<Array<App | AppResponse>> {
    return this.adminClient
      .apps(this.groupId)
      .create(appName)
      .then((appInfo: AppResponse) => {
        const app: App = this.adminClient.apps(this.groupId).app(appInfo.id);
        this.apps.push(app);
        return [appInfo, app];
      });
  }

  public async addProvider(
    app: App,
    config: ProviderConfig
  ): Promise<AuthProviderResponse> {
    let authProviders;
    return app.authProviders
      .create(config)
      .then(resp => {
        authProviders = resp;
        return app.authProviders.authProvider(resp.id).enable();
      })
      .then(() => authProviders);
  }

  public async enableApiKeyProvider(app: App): Promise<void> {
    return app.authProviders.list().then(responses => {
      const apiKeyProvider = responses.find(
        it => it.name === UserApiKeyAuthProvider.DEFAULT_NAME
      )!;
      return app.authProviders.authProvider(apiKeyProvider.id).enable();
    });
  }

  public async addService(
    app: App,
    type: string,
    config: ServiceConfig
  ): Promise<Array<ServiceResponse | Service>> {
    return app.services.create(config).then(svcInfo => {
      const svc = app.services.service(svcInfo.id);
      return [svcInfo, svc];
    });
  }

  public async addRule(
    svc: Service,
    config: RuleCreator
  ): Promise<RuleResponse> {
    return svc.rules.create(config);
  }
}
