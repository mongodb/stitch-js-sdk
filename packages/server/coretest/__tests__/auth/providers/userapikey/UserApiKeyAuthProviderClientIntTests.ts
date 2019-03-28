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

import { App, AppResource, Userpass } from "mongodb-stitch-core-admin-client";
import { BSON, StitchServiceErrorCode, StitchServiceError } from "mongodb-stitch-core-sdk";
import { UserApiKeyAuthProviderClient, UserApiKeyCredential } from "mongodb-stitch-server-core";
import { BaseStitchServerIntTestHarness } from "mongodb-stitch-server-testutils";

const harness = new BaseStitchServerIntTestHarness();

beforeAll(() => harness.setup());
afterAll(() => harness.teardown());

async function prepareApp(): Promise<[AppResource, App]> {
  const { app: appResponse, appResource: app } = await harness.createApp();
  await harness.addProvider(
    app,
    new Userpass(
      "http://emailConfirmUrl.com",
      "http://resetPasswordUrl.com",
      "email subject",
      "password subject"
    )
  );
  await harness.enableApiKeyProvider(app);
  return [appResponse as AppResource, app];
}

describe("UserApiKeyAuthProviderClient", () => {
  it("should create self api key", async () => {
    const [appResponse, app] = await prepareApp();
    const client = harness.getAppClient(appResponse);
    const originalUserId = await harness.registerAndLoginWithUserPass(
      app,
      client,
      "test@10gen.com",
      "hunter2"
    );

    const apiKeyClient = client.auth.getProviderClient(
      UserApiKeyAuthProviderClient.factory
    );

    const key = await apiKeyClient.createApiKey("key_test");

    expect(key).toBeDefined();
    expect(key.key).toBeDefined();

    await client.auth.logout();

    const user = await client.auth.loginWithCredential(
      new UserApiKeyCredential(key.key!)
    );
    expect(originalUserId).toEqual(user.id);
  });

  it("should fetch api key", async () => {
    const [appResponse, app] = await prepareApp();
    const client = harness.getAppClient(appResponse);
    await harness.registerAndLoginWithUserPass(
      app,
      client,
      "test@10gen.com",
      "hunter2"
    );

    const apiKeyClient = client.auth.getProviderClient(
      UserApiKeyAuthProviderClient.factory
    );

    const key = await apiKeyClient.createApiKey("key_test");

    expect(key).toBeDefined();
    expect(key.key).toBeDefined();

    const fetchedKey = await apiKeyClient.fetchApiKey(key.id);

    expect(fetchedKey).toBeDefined();
    expect(fetchedKey.key).not.toBeDefined();
    expect(key.id).toEqual(fetchedKey.id);
  });

  it("should enable/disable api key", async () => {
    const [appResponse, app] = await prepareApp();
    const client = harness.getAppClient(appResponse);
    await harness.registerAndLoginWithUserPass(
      app,
      client,
      "test@10gen.com",
      "hunter2"
    );
    const apiKeyClient = client.auth.getProviderClient(
      UserApiKeyAuthProviderClient.factory
    );

    const key = await apiKeyClient.createApiKey("key_test");
    expect(key).toBeDefined();
    expect(key.key).toBeDefined();

    await apiKeyClient.disableApiKey(key.id);
    expect((await apiKeyClient.fetchApiKey(key.id)).disabled).toBeTruthy();

    await apiKeyClient.enableApiKey(key.id);
    expect((await apiKeyClient.fetchApiKey(key.id)).disabled).toBeFalsy();

    await apiKeyClient.deleteApiKey(key.id);
    expect(0).toEqual((await apiKeyClient.fetchApiKeys()).length);
  });

  it("should not create key with invalid name", async () => {
    const [appResponse, app] = await prepareApp();
    const client = harness.getAppClient(appResponse);
    await harness.registerAndLoginWithUserPass(
      app,
      client,
      "test@10gen.com",
      "hunter2"
    );

    const apiKeyClient = client.auth.getProviderClient(
      UserApiKeyAuthProviderClient.factory
    );

    try {
      await apiKeyClient.createApiKey("$()!$");
      fail("did not fail when creating key with invalid name");
    } catch (e) {
      expect(e instanceof StitchServiceError);
      expect(StitchServiceErrorCode.InvalidParameter).toEqual(e.errorCode);
    }
  });

  it("should not fetch inexistent key", async () => {
    const [appResponse, app] = await prepareApp();
    const client = harness.getAppClient(appResponse);
    await harness.registerAndLoginWithUserPass(
      app,
      client,
      "test@10gen.com",
      "hunter2"
    );

    const apiKeyClient = client.auth.getProviderClient(
      UserApiKeyAuthProviderClient.factory
    );

    try {
      await apiKeyClient.fetchApiKey(new BSON.ObjectID());
      fail("found a nonexistent key");
    } catch (e) {
      expect(e instanceof StitchServiceError).toBeTruthy();
      expect(StitchServiceErrorCode.ApiKeyNotFound).toEqual(e.errorCode);
    }
  });
});
