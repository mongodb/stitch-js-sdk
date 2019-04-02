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

import {
  Anon,
  App,
  AppResource,
  UserpassProvider,
  UserpassProviderConfig
} from "mongodb-stitch-core-admin-client";
import {
  AnonymousCredential,
  MemoryStorage,
  UserPasswordCredential
} from "mongodb-stitch-core-sdk";
import { StitchAppClient, StitchAuth, StitchUser, UserPasswordAuthProviderClient } from "mongodb-stitch-server-core";
import { BaseStitchServerIntTestHarness } from "mongodb-stitch-server-testutils";

const harness = new BaseStitchServerIntTestHarness();

beforeAll(() => harness.setup());
afterAll(() => harness.teardown());

async function prepareListenerTest(): Promise<[StitchAppClient, AppResource]> {
  const { app: appResponse, appResource: app } = await harness.createApp();
  await harness.addProvider(app, new Anon());
  await harness.addProvider(
    app,
    new UserpassProvider(new UserpassProviderConfig(
      "http://emailConfirmUrl.com",
      "http://resetPasswordUrl.com",
      "email subject",
      "password subject"
    ))
  );

  return Promise.resolve([
    harness.getAppClient(
      appResponse, 
      new MemoryStorage((appResponse).clientAppId
    )), 
    app
  ] as [StitchAppClient, AppResource]);
}

describe("StitchAuthListener", () => {
  it("should notify on user added event", async () => {
    const [client, app] = await prepareListenerTest();

    // User added event will be triggered three times, and there is one 
    // additional assertion in the test
    expect.assertions(3 + 1);
    
    client.auth.addAuthListener({
      onUserAdded(_: StitchAuth, addedUser: StitchUser) {
        expect(addedUser.id).toBeDefined();
      }
    });

    // this should trigger the user being added
    await harness.registerAndLoginWithUserPass(
      app,
      client,
      "test@10gen.com",
      "hunter1"
    );

    // this should not trigger a user added event because the user
    // already exists
    await client.auth.logout();
    await client.auth.loginWithCredential(
      new UserPasswordCredential("test@10gen.com", "hunter1")
    );

    // this should trigger another user added event
    const anonUser1 = await client.auth.loginWithCredential(
      new AnonymousCredential()
    );

    // logging out of the anon user and logging back in should trigger a new
    // user event because logging out of an anon user removes the user
    await client.auth.logoutUserWithId(anonUser1.id);
    const anonUser2 = await client.auth.loginWithCredential(
      new AnonymousCredential()
    );

    expect(anonUser1.id).not.toBe(anonUser2.id);
  });

  it("should notify on user logged in event", async () => {
    const [client, app] = await prepareListenerTest();

    // Login event will be triggered three times, with two assertions per 
    // time, and there is one additional assertion in the test
    expect.assertions(3*2 + 1);

    client.auth.addAuthListener({
      onUserLoggedIn(_: StitchAuth, loggedInUser: StitchUser) {
        expect(loggedInUser.id).toBeDefined();
        expect(loggedInUser.isLoggedIn).toBeTruthy();
      }
    });

    // this should trigger the user being logged in
    await harness.registerAndLoginWithUserPass(
      app,
      client,
      "test@10gen.com",
      "hunter1"
    );

    // this should also trigger the user logging in
    await client.auth.logout();
    const emailPassUser = await client.auth.loginWithCredential(
      new UserPasswordCredential("test@10gen.com", "hunter1")
    );

    // this should trigger another user logging in event event
    const anonUser1 = await client.auth.loginWithCredential(
      new AnonymousCredential()
    );

    // logging into the anonymous user again, even when not the active user,
    // should not trigger a login event, since under the hood it is simply 
    // changing the active user and re-using the anonymous session.
    client.auth.loginWithCredential(new AnonymousCredential());
    client.auth.switchToUserWithId(emailPassUser.id);
    client.auth.loginWithCredential(new AnonymousCredential());

    expect(client.auth.user!.id).toBe(anonUser1.id);
  });

  it("should notify on user logged out event", async () => {
    const [client, app] = await prepareListenerTest();

    // Logout event will be triggered three times, with two assertions per 
    // time, and there is one additional assertion in the test
    expect.assertions(3*2 + 1);

    client.auth.addAuthListener({
      onUserLoggedOut(_: StitchAuth, loggedOutUser: StitchUser) {
        expect(loggedOutUser.id).toBeDefined();
        expect(loggedOutUser.isLoggedIn).toBeFalsy();
      }
    });

    await harness.registerAndLoginWithUserPass(
      app,
      client,
      "test@10gen.com",
      "hunter1"
    );

    // this should trigger the user logging out
    await client.auth.logout();
    const emailPassUser = await client.auth.loginWithCredential(
      new UserPasswordCredential("test@10gen.com", "hunter1")
    );

    // logging a user out when they're not the active user should trigger a 
    // logout event
    await client.auth.loginWithCredential(
      new AnonymousCredential()
    );
    await client.auth.logoutUserWithId(emailPassUser.id);

    // logging out a user when they are already logged out should not trigger
    // a logout event
    await client.auth.logoutUserWithId(emailPassUser.id);

    // removing a user should trigger a logout if they are already logged in
    await client.auth.removeUser();

    // removing a user who is already logged out should not trigger a logout
    await client.auth.removeUserWithId(emailPassUser.id)

    // make sure there are no more users left after removing everyone
    expect(client.auth.listUsers().length).toBe(0)
  });

  it("should notify on active user changed event", async () => {
    const [client, app] = await prepareListenerTest();

    // User changed event will be triggered five times, with two assertions
    // per time, and there is one additional assertion in the test
    expect.assertions(5*2 + 1);

    let expectingCurrentUserToBeDefined = false
    let expectingPreviousUserToBeDefined = false

    client.auth.addAuthListener({
      onActiveUserChanged(
        _: StitchAuth, 
        currentActiveUser: StitchUser | undefined,
        previousActiveUser: StitchUser | undefined
      ) {
        expect(currentActiveUser !== undefined).toBe(
          expectingCurrentUserToBeDefined
        );

        expect(previousActiveUser !== undefined).toBe(
          expectingPreviousUserToBeDefined
        );
      }
    });

    // this should trigger the event a current user and no previous user
    expectingCurrentUserToBeDefined = true;
    expectingPreviousUserToBeDefined = false;
    await harness.registerAndLoginWithUserPass(
      app,
      client,
      "test@10gen.com",
      "hunter1"
    );

    // this should trigger the event with a previous user and no current user 
    expectingCurrentUserToBeDefined = false;
    expectingPreviousUserToBeDefined = true;
    await client.auth.logout();

    // this should trigger the event with a a current user and no previous user
    expectingCurrentUserToBeDefined = true;
    expectingPreviousUserToBeDefined = false;
    const emailPassUser = await client.auth.loginWithCredential(
      new UserPasswordCredential("test@10gen.com", "hunter1")
    );

    // logging a user in when there is an active user should trigger the event
    // with both a current user and no previous user
    expectingCurrentUserToBeDefined = true;
    expectingPreviousUserToBeDefined = true;
    await client.auth.loginWithCredential(
      new AnonymousCredential()
    );

    // logging a user out when they're not the active user should not trigger
    // an active user changed event
    await client.auth.logoutUserWithId(emailPassUser.id);

    // logging out a user when they are already logged out should not trigger
    // a user changed event
    await client.auth.logoutUserWithId(emailPassUser.id);

    // removing a user should trigger the event with a previous user and no
    // current user if they are the active user
    // this should trigger the event with a previous user and no current user 
    expectingCurrentUserToBeDefined = false;
    expectingPreviousUserToBeDefined = true;
    await client.auth.logout();
    await client.auth.removeUser();

    // removing a user who is already logged out should not trigger the event
    await client.auth.removeUserWithId(emailPassUser.id);

    // make sure there are no more users left after removing everyone
    expect(client.auth.listUsers().length).toBe(0);
  });

  it("should notify on user removed event", async () => {
    const [client, app] = await prepareListenerTest();

    // Remove event will be triggered two times, with two assertions per time, 
    // and there are two additional assertions in the test
    expect.assertions(3*2 + 2);

    client.auth.addAuthListener({
      onUserRemoved(_: StitchAuth, removedUser: StitchUser) {
        expect(removedUser.id).toBeDefined();
        expect(removedUser.isLoggedIn).toBeFalsy();
      }
    });

    await harness.registerAndLoginWithUserPass(
      app,
      client,
      "test@10gen.com",
      "hunter1"
    );

    // loggout out an email/pass user should not trigger the remove event
    await client.auth.logout();
    const emailPassUser = await client.auth.loginWithCredential(
      new UserPasswordCredential("test@10gen.com", "hunter1")
    );

    // removing a user out when they're not the active user should trigger a 
    // remove event
    await client.auth.loginWithCredential(
      new AnonymousCredential()
    );
    await client.auth.removeUserWithId(emailPassUser.id);

    // logging out an anonymous user should trigger a remove
    await client.auth.logout();

    // make sure there are no more users left after removing everyone
    expect(client.auth.listUsers().length).toBe(0);

    // log back in as the email/pass user, and assert that removing the active
    // user triggers the remove event
    await client.auth.loginWithCredential(
      new UserPasswordCredential("test@10gen.com", "hunter1")
    );
    await client.auth.removeUser();

    // make sure there are no more users left after removing everyone
    expect(client.auth.listUsers().length).toBe(0);
  });

  it("should notify on user linked event", async () => {
    const [client, app] = await prepareListenerTest();

    // Remove event will be triggered once, with three assertions, 
    // and there is one additional assertion in the test.
    expect.assertions(1*3 + 1);

    let expectedUserId: string;

    client.auth.addAuthListener({
      onUserLinked(_: StitchAuth, linkedUser: StitchUser) {
        expect(linkedUser.id).toBe(expectedUserId);
        expect(linkedUser.isLoggedIn).toBeTruthy();
        expect(linkedUser.identities.length).toBe(2);
      }
    });

    const userPassClient = client.auth.getProviderClient(
      UserPasswordAuthProviderClient.factory
    );

    const email = "user@10gen.com";
    const password = "password";
    await userPassClient.registerWithEmail(email, password);

    const conf = await app.userRegistrations.sendConfirmation(email);
    await userPassClient.confirmUser(conf.token, conf.tokenId);

    const anonUser = await client.auth.loginWithCredential(
      new AnonymousCredential()
    );

    expectedUserId = anonUser.id;

    // linking to the user/password auth provider identity should trigger the
    // link event
    await anonUser.linkWithCredential(
      new UserPasswordCredential(email, password)
    );

    // assert that there is one user in the list, because the linking should
    // not have created a new user.
    expect(client.auth.listUsers().length).toEqual(1);
  });

  it("should notify on listener registered event", async () => {
    const [client, _] = await prepareListenerTest();

    // listener registered event will be triggered once
    expect.assertions(1);

    client.auth.addAuthListener({
      onListenerRegistered(auth: StitchAuth) {
        expect(auth).toBeDefined();
      }
    })
  });
});
