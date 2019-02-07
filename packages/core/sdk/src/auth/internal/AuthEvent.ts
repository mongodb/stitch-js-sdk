import { CoreStitchUser } from "../..";

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

export enum AuthEventKind {
  ActiveUserSwitched,
  ListenerInitialized,
  UserCreated,
  UserLoggedIn,
  UserLoggedOut,
  UserRemoved,
}

export interface ActiveUserSwitched<TStitchUser extends CoreStitchUser> {
  kind: AuthEventKind.ActiveUserSwitched;
  currentActiveUser: TStitchUser;
  prevActiveUser: TStitchUser;
}

export interface ListenerInitialized {
  kind: AuthEventKind.ListenerInitialized;
}

export interface UserCreated<TStitchUser extends CoreStitchUser> {
  kind: AuthEventKind.UserCreated;
  createdUser: TStitchUser;
}

export interface UserLoggedIn<TStitchUser extends CoreStitchUser> {
  kind: AuthEventKind.UserLoggedIn;
  loggedInUser: TStitchUser;
  prevActiveUser: TStitchUser;
}

export interface UserLoggedOut<TStitchUser extends CoreStitchUser> {
  kind: AuthEventKind.UserLoggedOut;
  loggedOutUser: TStitchUser;
}

export interface UserRemoved<TStitchUser extends CoreStitchUser> {
  kind: AuthEventKind.UserRemoved;
  removedUser: TStitchUser;
}

/**
 * A discriminated union type representing an auth event that might occur and
 * should be sent to any underlying listeners.
 */
export type AuthEvent<TStitchUser extends CoreStitchUser> = 
  ActiveUserSwitched<TStitchUser> | 
  ListenerInitialized | 
  UserCreated<TStitchUser> | 
  UserLoggedIn<TStitchUser> | 
  UserLoggedOut<TStitchUser> | 
  UserRemoved<TStitchUser>;
