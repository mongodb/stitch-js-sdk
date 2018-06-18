import { sign } from "jsonwebtoken";
import {
  Anon,
  App,
  AppResponse,
  Custom,
  FunctionCreator,
  Userpass
} from "mongodb-stitch-core-admin-client";
import {
  AnonymousAuthProvider,
  AnonymousCredential,
  CustomAuthProvider,
  CustomCredential,
  UserPasswordAuthProvider,
  UserPasswordCredential,
  UserType
} from "mongodb-stitch-core-sdk";
import { UserPasswordAuthProviderClient } from "mongodb-stitch-browser-core";
import BaseStitchIntTestWebHarness from "mongodb-stitch-browser-testutils";

const harness = new BaseStitchIntTestWebHarness();

beforeAll(() => harness.setup());
afterAll(() => harness.teardown());

describe("StitchAppClient", () => {
  it("should custom auth login", async () => {
    const [appResponse, app] = await harness.createApp();
    const signingKey = "abcdefghijklmnopqrstuvwxyz1234567890";
    await harness.addProvider(app as App, new Custom(signingKey));
    const client = harness.getAppClient(appResponse as AppResponse);
    const jwt = sign(
      {
        aud: (appResponse as AppResponse).clientAppId,
        exp: new Date().getTime() / 1000 + 5 * 60 * 1000,
        iat: new Date().getTime() / 1000 - 5 * 60 * 1000,
        nbf: new Date().getTime() / 1000 - 5 * 60 * 1000,
        stitch_meta: {
          email: "name@example.com",
          name: "Joe Bloggs",
          picture: "https://goo.gl/xqR6Jd"
        },
        sub: "uniqueUserID"
      },
      signingKey,
      {
        header: {
          alg: "HS256",
          typ: "JWT"
        }
      }
    );

    const user = await client.auth.loginWithCredential(
      new CustomCredential(jwt)
    );
    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(CustomAuthProvider.DEFAULT_NAME).toEqual(user.loggedInProviderName);
    expect(CustomAuthProvider.TYPE).toEqual(user.loggedInProviderType);
    expect(UserType.Normal).toEqual(user.userType);
    expect(user.identities[0].id).toBeDefined();
    expect(CustomAuthProvider.TYPE).toEqual(user.identities[0].providerType);
    expect(client.auth.isLoggedIn).toBeTruthy();
  });

  it("should follow multiple login semantics", async () => {
    const [appResponse, app] = await harness.createApp();
    await harness.addProvider(app as App, new Anon());
    await harness.addProvider(
      app as App,
      new Userpass(
        "http://emailConfirmURL.com",
        "http://resetPasswordURL.com",
        "email subject",
        "password subject"
      )
    );
    const client = harness.getAppClient(appResponse as AppResponse);

    // check storage
    expect(client.auth.isLoggedIn).toBeFalsy();
    expect(client.auth.user).toBeUndefined();

    // login anonymously
    const anonUser = await client.auth.loginWithCredential(
      new AnonymousCredential()
    );
    expect(anonUser).toBeDefined();

    // check storage
    expect(client.auth.isLoggedIn).toBeTruthy();
    expect(anonUser.loggedInProviderType).toEqual(AnonymousAuthProvider.TYPE);

    // login anonymously again and make sure user ID is the same
    expect(anonUser.id).toEqual(
      (await client.auth.loginWithCredential(new AnonymousCredential())).id
    );

    // check storage
    expect(client.auth.isLoggedIn).toBeTruthy();
    expect(client.auth.user!.loggedInProviderType).toEqual(
      AnonymousAuthProvider.TYPE
    );

    // login with email provider and make sure user ID is updated
    const emailUserId = await harness.registerAndLoginWithUserPass(
      app as App,
      client,
      "test@10gen.com",
      "hunter1"
    );
    expect(emailUserId).not.toEqual(anonUser.id);

    // check storage
    expect(client.auth.isLoggedIn).toBeTruthy();
    expect(client.auth.user!.loggedInProviderType).toEqual(
      UserPasswordAuthProvider.TYPE
    );

    // login with email provider under different user and make sure user ID is updated
    const id2 = await harness.registerAndLoginWithUserPass(
      app as App,
      client,
      "test2@10gen.com",
      "hunter2"
    );
    expect(emailUserId).not.toEqual(id2);

    // check storage
    expect(client.auth.isLoggedIn).toBeTruthy();
    expect(client.auth.user!.loggedInProviderType).toEqual(
      UserPasswordAuthProvider.TYPE
    );

    // Verify that logout clears storage
    await client.auth.logout();
    expect(client.auth.isLoggedIn).toBeFalsy();
    expect(client.auth.user).not.toBeDefined();
  });

  it("should link identity", async () => {
    const [appResponse, app] = await harness.createApp();
    await harness.addProvider(app as App, new Anon());
    await harness.addProvider(
      app as App,
      new Userpass(
        "http://emailConfirmURL.com",
        "http://resetPasswordURL.com",
        "email subject",
        "password subject"
      )
    );

    const client = harness.getAppClient(appResponse as AppResponse);
    const userPassClient = client.auth.getProviderClient(
      UserPasswordAuthProviderClient.Factory
    );

    const email = "user@10gen.com";
    const password = "password";
    await userPassClient.registerWithEmail(email, password);

    const conf = await (app as App).userRegistrations.sendConfirmation(email);
    await userPassClient.confirmUser(conf.token, conf.tokenId);

    const anonUser = await client.auth.loginWithCredential(
      new AnonymousCredential()
    );
    expect(anonUser).toBeDefined();
    expect(anonUser.loggedInProviderType).toEqual(AnonymousAuthProvider.TYPE);

    const linkedUser = await anonUser.linkWithCredential(
      new UserPasswordCredential(email, password)
    );

    expect(anonUser.id).toEqual(linkedUser.id);
    expect(linkedUser.loggedInProviderType).toEqual(
      UserPasswordAuthProvider.TYPE
    );

    expect(client.auth.user!.identities.length).toEqual(2);

    await client.auth.logout();
    expect(client.auth.isLoggedIn).toBeFalsy();
  });

  it("should call function", async () => {
    const [appResponse, app] = await harness.createApp();
    await harness.addProvider(app as App, new Anon());
    const client = harness.getAppClient(appResponse as AppResponse);

    await (app as App).functions.create({
      name: "testFunction",
      private: false,
      source:
        "exports = function(intArg, stringArg) { " +
        "return { intValue: intArg, stringValue: stringArg} " +
        "}"
    });

    await client.auth.loginWithCredential(new AnonymousCredential());

    const resultDoc = await client.callFunction("testFunction", [42, "hello"]);

    expect(resultDoc["intValue"]).toBeDefined();
    expect(resultDoc["stringValue"]).toBeDefined();
    expect(resultDoc["intValue"]).toEqual(42);
    expect(resultDoc["stringValue"]).toEqual("hello");
  });
});
