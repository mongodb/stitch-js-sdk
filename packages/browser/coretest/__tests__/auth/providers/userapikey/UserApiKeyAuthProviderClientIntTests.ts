import { ObjectID } from "bson";
import { App, AppResponse, Userpass } from "mongodb-stitch-core-admin-client";
import { StitchServiceErrorCode, StitchServiceException } from "mongodb-stitch-core-sdk";
import { UserAPIKeyAuthProviderClient, UserAPIKeyCredential } from "mongodb-stitch-browser-core";
import BaseStitchWebIntTestHarness from "mongodb-stitch-browser-testutils";

const harness = new BaseStitchWebIntTestHarness();

beforeAll(() => harness.setup());
afterAll(() => harness.teardown());

async function prepareApp(): Promise<[AppResponse, App]> {
  const [appResponse, app] = await harness.createApp();
  await harness.addProvider(
    app as App,
    new Userpass(
      "http://emailConfirmURL.com",
      "http://resetPasswordURL.com",
      "email subject",
      "password subject"
    )
  );
  await harness.enableApiKeyProvider(app as App);
  return [appResponse as AppResponse, app as App];
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
      UserAPIKeyAuthProviderClient.Factory
    );

    const key = await apiKeyClient.createApiKey("key_test");

    expect(key).toBeDefined();
    expect(key.key).toBeDefined();

    await client.auth.logout();

    const user = await client.auth.loginWithCredential(
      new UserAPIKeyCredential(key.key!)
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
      UserAPIKeyAuthProviderClient.Factory
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
      UserAPIKeyAuthProviderClient.Factory
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
      UserAPIKeyAuthProviderClient.Factory
    );

    try {
      await apiKeyClient.createApiKey("$()!$");
      fail("did not fail when creating key with invalid name");
    } catch (e) {
      expect(e instanceof StitchServiceException);
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
      UserAPIKeyAuthProviderClient.Factory
    );

    try {
      await apiKeyClient.fetchApiKey(new ObjectID());
      fail("found a nonexistent key");
    } catch (e) {
      expect(e instanceof StitchServiceException).toBeTruthy();
      expect(StitchServiceErrorCode.APIKeyNotFound).toEqual(e.errorCode);
    }
  });
});
