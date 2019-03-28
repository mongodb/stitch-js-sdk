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

import { sign } from "jsonwebtoken";
import { UserPasswordAuthProviderClient, Stitch } from "mongodb-stitch-server-core";
import { BaseStitchServerIntTestHarness } from "mongodb-stitch-server-testutils";
import {
  Anon,
  App,
  AppResource,
  Custom,
  FunctionCreator,
  Userpass
} from "mongodb-stitch-core-admin-client";
import {
  AnonymousAuthProvider,
  AnonymousCredential,
  CustomAuthProvider,
  CustomCredential,
  MemoryStorage,
  UserPasswordAuthProvider,
  UserPasswordCredential,
  UserType,
  StitchClientError,
  StitchClientErrorCode
} from "mongodb-stitch-core-sdk";

const harness = new BaseStitchServerIntTestHarness();

beforeAll(() => harness.setup());
afterAll(() => harness.teardown());

describe("StitchAppClient", () => {
  it("should custom auth login", async () => {
    const { app: appResponse, appResource: app } = await harness.createApp();
    const signingKey = "abcdefghijklmnopqrstuvwxyz1234567890";
    await harness.addProvider(app, new Custom(signingKey));
    const client = harness.getAppClient(appResponse as AppResource);
    const jwt = sign(
      {
        aud: (appResponse as AppResource).clientAppId,
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

  it("should follow multiple login semantics and allow multiple users", async () => {
    const { app: appResponse, appResource: app } = await harness.createApp();
    await harness.addProvider(app, new Anon());
    await harness.addProvider(
      app,
      new Userpass(
        "http://emailConfirmUrl.com",
        "http://resetPasswordUrl.com",
        "email subject",
        "password subject"
      )
    );

    const concreteAppResource = appResponse as AppResource;

    let storage = new MemoryStorage(concreteAppResource.clientAppId);
    let client = harness.getAppClient(concreteAppResource, storage);
    
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
      app,
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
      app,
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
    expect(client.auth.listUsers()[2].isLoggedIn).toEqual(false);

    // Log back into the last user
    await client.auth.loginWithCredential(new UserPasswordCredential(
      "test2@10gen.com", "hunter2"
    ));
    expect(client.auth.isLoggedIn).toBeTruthy();
    expect(client.auth.user!.loggedInProviderType).toEqual(
      UserPasswordAuthProvider.TYPE
    );

    expect(client.auth.listUsers().length).toEqual(3);
    
    expect(client.auth.listUsers()[0].id).toEqual(anonUser.id);
    expect(client.auth.listUsers()[1].id).toEqual(emailUserId);
    expect(client.auth.listUsers()[2].id).toEqual(id2);

    // imitate an app restart
    Stitch.clearApps();
    client = harness.getAppClient(appResponse as AppResource, storage);

    // check everything is as it was
    expect(client.auth.listUsers().length).toEqual(3);
    expect(client.auth.isLoggedIn).toBeTruthy();
    expect(client.auth.user!.loggedInProviderType).toEqual(
      UserPasswordAuthProvider.TYPE
    );

    expect(client.auth.listUsers().length).toEqual(3);
    
    expect(client.auth.listUsers()[0].id).toEqual(anonUser.id);
    expect(client.auth.listUsers()[1].id).toEqual(emailUserId);
    expect(client.auth.listUsers()[2].id).toEqual(id2);

    // verify that removing the user with id2 removes the second email/pass user
    // and logs out the active user
    await client.auth.logoutUserWithId(id2);
    expect(client.auth.listUsers()[2].isLoggedIn).toEqual(false);
    expect(client.auth.isLoggedIn).toBeFalsy();

    // and assert that you can remove a user even if you're not logged in
    await client.auth.removeUserWithId(id2);
    expect(client.auth.listUsers().length).toEqual(2);

    // switch to the user with emailUserId and verify 
    // that is the user switched to
    client.auth.switchToUserWithId(emailUserId);
    
    expect(client.auth.isLoggedIn).toBeTruthy();
    expect(client.auth.user!.loggedInProviderType).toEqual(
      UserPasswordAuthProvider.TYPE
    );
    expect(client.auth.user!.id).toEqual(emailUserId);

    expect(client.auth.listUsers()[0].id).toEqual(anonUser.id);
    expect(client.auth.listUsers()[1].id).toEqual(emailUserId);

    // imitate an app restart
    Stitch.clearApps();
    client = harness.getAppClient(appResponse as AppResource, storage);

    // assert that we're still logged in
    expect(client.auth.listUsers().length).toEqual(2);
    expect(client.auth.isLoggedIn).toBeTruthy();
    expect(client.auth.user!.loggedInProviderType).toEqual(
      UserPasswordAuthProvider.TYPE
    );
    expect(client.auth.user!.id).toEqual(emailUserId);

    expect(client.auth.listUsers()[0].id).toEqual(anonUser.id);
    expect(client.auth.listUsers()[1].id).toEqual(emailUserId);

    // assert that removing the active user leaves just the anon user
    await client.auth.removeUser();
    expect(client.auth.isLoggedIn).toBeFalsy();
    expect(client.auth.listUsers().length).toEqual(1);

    client.auth.switchToUserWithId(anonUser.id);
    expect(client.auth.isLoggedIn).toBeTruthy();

    expect(client.auth.user!.loggedInProviderType).toEqual(
      AnonymousAuthProvider.TYPE
    );
    expect(client.auth.user!.id).toEqual(anonUser.id);
    expect(client.auth.listUsers()[0].id).toEqual(anonUser.id);

    // assert that logging out of the anonymous user removes it as well
    await client.auth.logout();

    expect(client.auth.isLoggedIn).toBeFalsy();
    expect(client.auth.listUsers().length).toEqual(0);
    expect(client.auth.user).toBeUndefined();
  });

  it("should link identity", async () => {
    const { app: appResponse, appResource: app } = await harness.createApp();
    await harness.addProvider(app, new Anon());
    await harness.addProvider(
      app,
      new Userpass(
        "http://emailConfirmUrl.com",
        "http://resetPasswordUrl.com",
        "email subject",
        "password subject"
      )
    );

    const client = harness.getAppClient(appResponse as AppResource);
    const userPassClient = client.auth.getProviderClient(
      UserPasswordAuthProviderClient.factory
    );

    const email = "user@10gen.com";
    const password = "password";
    await userPassClient.registerWithEmail(email, password);

    const conf = await (app).userRegistrations.sendConfirmation(email);
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
    expect(client.auth.listUsers()[0].isLoggedIn).toEqual(false);

    // assert that there is one user in the list, and that it did not get 
    // deleted when logging out because the linked user is no longer anon
    expect(client.auth.listUsers().length).toEqual(1);
    expect(client.auth.listUsers()[0].id).toEqual(linkedUser.id);
  });

  it("should call function", async () => {
    const { app: appResponse, appResource: app } = await harness.createApp();
    await harness.addProvider(app, new Anon());
    const client = harness.getAppClient(appResponse as AppResource);

    await (app).functions.create({
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

  it("should update lastAuthActivity on various auth events", async () => {
    const { app: appResponse, appResource: app } = await harness.createApp();
    await harness.addProvider(app, new Anon());
    await harness.addProvider(
      app,
      new Userpass(
        "http://emailConfirmUrl.com",
        "http://resetPasswordUrl.com",
        "email subject",
        "password subject"
      )
    );

    let client = harness.getAppClient(appResponse as AppResource);

    const checkpoint1 = new Date();

    // login with email provider
    const user1Id = await harness.registerAndLoginWithUserPass(
      app,
      client,
      "test@10gen.com",
      "hunter1"
    );

    // login should set an authActivity after the pre-login time
    expect(client.auth.user!.lastAuthActivity.getTime()).toBeGreaterThan(
      checkpoint1.getTime()
    );
    expect(
      client.auth.listUsers()[0].lastAuthActivity.getTime()
    ).toBeGreaterThan(
      checkpoint1.getTime()
    );

    const checkpoint2 = client.auth.user!.lastAuthActivity;

    // login with email provider on a separate account
    const user2Id = await harness.registerAndLoginWithUserPass(
      app,
      client,
      "test2@10gen.com",
      "hunter2"
    );

    // active user time should have been updated 
    expect(client.auth.user!.lastAuthActivity.getTime()).toBeGreaterThan(
      checkpoint2.getTime()
    )

    // both users should have been updated on new login
    expect(
      client.auth.listUsers()[0].lastAuthActivity.getTime()
    ).toBeGreaterThan(
      checkpoint2.getTime()
    );

    expect(
      client.auth.listUsers()[1].lastAuthActivity.getTime()
    ).toBeGreaterThan(
      checkpoint2.getTime()
    );

    const checkpoint3 = client.auth.user!.lastAuthActivity;

    // sleep a few milliseconds to simulate time passing, since user switch is
    // instantaneous
    let wait = ms => new Promise((resolve, _) => setTimeout(resolve, ms));
    await wait(10);

    client.auth.switchToUserWithId(user1Id);

    // both users and active user lastAuthActivity should have been update on 
    // active user switched
    expect(client.auth.user!.lastAuthActivity.getTime()).toBeGreaterThan(
      checkpoint3.getTime()
    )

    // both users should have been updated on new login
    expect(
      client.auth.listUsers()[0].lastAuthActivity.getTime()
    ).toBeGreaterThan(
      checkpoint3.getTime()
    );

    expect(
      client.auth.listUsers()[1].lastAuthActivity.getTime()
    ).toBeGreaterThan(
      checkpoint3.getTime()
    );

    const checkpoint4 = client.auth.user!.lastAuthActivity;

    await client.auth.logoutUserWithId(user2Id);

    // only the logged out user should have lastAuthActivity updated on logout  
    expect(client.auth.user!.lastAuthActivity.getTime()).toEqual(
      checkpoint4.getTime()
    )
    expect(
      client.auth.listUsers()[0].lastAuthActivity.getTime()
    ).toEqual(
      checkpoint4.getTime()
    );

    expect(
      client.auth.listUsers()[1].lastAuthActivity.getTime()
    ).toBeGreaterThan(
      checkpoint4.getTime()
    );
  });

  it("should prevent calling logout and removeUser with args", async () => {
    const { app: appResponse, appResource: app } = await harness.createApp();
    await harness.addProvider(app, new Anon());
    await harness.addProvider(
      app,
      new Userpass(
        "http://emailConfirmUrl.com",
        "http://resetPasswordUrl.com",
        "email subject",
        "password subject"
      )
    );

    const concreteAppResource = appResponse as AppResource;

    let storage = new MemoryStorage(concreteAppResource.clientAppId);
    let client = harness.getAppClient(concreteAppResource, storage);

    // check storage
    expect(client.auth.isLoggedIn).toBeFalsy();
    expect(client.auth.user).toBeUndefined();

    // login anonymously
    const anonUser = await client.auth.loginWithCredential(
      new AnonymousCredential()
    );
    expect(anonUser).toBeDefined();

    // login with email provider and make sure user ID is updated
    const emailUserId = await harness.registerAndLoginWithUserPass(
      app,
      client,
      "test@10gen.com",
      "hunter1"
    );
    expect(emailUserId).not.toEqual(anonUser.id);

    // attempting to log out the anon user with logout should not work
    try {
      // @ts-ignore: Expected 0 arguments, but got 1
      await client.auth.logout(anonUser.id);
      fail("logout should have failed");
    } catch (error) {
      expect(error instanceof StitchClientError).toBeTruthy();
      expect(error.errorCode).toEqual(
        StitchClientErrorCode.UnexpectedArguments
      );
    }

    expect(client.auth.user!.id).toEqual(emailUserId);
    expect(client.auth.isLoggedIn).toBeTruthy();

    expect(client.auth.listUsers().length).toBe(2);

    // attempting to remove the anon user with removeUser should not work
    try {
      // @ts-ignore: Expected 0 arguments, but got 1
      await client.auth.removeUser(anonUser.id);
      fail("removeUser should have failed");
    } catch (error) {
      expect(error instanceof StitchClientError).toBeTruthy();
      expect(error.errorCode).toEqual(
        StitchClientErrorCode.UnexpectedArguments
      );
    }

    expect(client.auth.user!.id).toEqual(emailUserId);
    expect(client.auth.isLoggedIn).toBeTruthy();

    expect(client.auth.listUsers().length).toBe(2);
  });
});
