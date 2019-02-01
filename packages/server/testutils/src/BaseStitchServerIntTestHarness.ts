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

import { fail } from "assert";
import { App, AppResponse } from "mongodb-stitch-core-admin-client";
import { BaseStitchIntTestHarness } from "mongodb-stitch-core-testutils";
import {
  MemoryStorage,
  Stitch,
  StitchAppClient,
  StitchAppClientConfiguration,
  Storage,
  UserPasswordAuthProviderClient,
  UserPasswordCredential
} from "mongodb-stitch-server-core";

const stitchBaseUrlEnvVar = "STITCH_BASE_URL";

export default class BaseStitchServerIntTestHarness extends BaseStitchIntTestHarness {
  public readonly clients: StitchAppClient[] = [];

  public setup(): Promise<void> {
    return super.setup();
  }

  public teardown(): Promise<void> {
    return super.teardown().then(() =>
      Promise.all(
        this.clients.map(it => {
          it.auth.logout();
        })
      )
    ).then(() => { return });
  }

  public get stitchBaseUrl(): string {
    const envVar = process.env[stitchBaseUrlEnvVar];
    return envVar !== undefined ? envVar : "http://localhost:9090";
  }

  public getAppClient(app: AppResponse, storage?: Storage): StitchAppClient {
    if (Stitch.hasAppClient(app.clientAppId)) {
      return Stitch.getAppClient(app.clientAppId);
    }

    const client = Stitch.initializeAppClient(
      app.clientAppId,
      new StitchAppClientConfiguration.Builder()
        .withBaseUrl(this.stitchBaseUrl)
        .withStorage(storage || new MemoryStorage(app.clientAppId))
        .build()
    );
    this.clients.push(client);
    return client;
  }

  // Registers a new email/password user, and logs them in, returning the user's ID
  public async registerAndLoginWithUserPass(
    app: App,
    client: StitchAppClient,
    email: string,
    pass: string
  ): Promise<string> {
    const emailPassClient = client.auth.getProviderClient(
      UserPasswordAuthProviderClient.factory
    );

    return emailPassClient
      .registerWithEmail(email, pass)
      .then(() => app.userRegistrations.sendConfirmation(email))
      .then(conf => emailPassClient.confirmUser(conf.token, conf.tokenId))
      .then(() =>
        client.auth.loginWithCredential(new UserPasswordCredential(email, pass))
      )
      .then(user => user.id);
  }
}
