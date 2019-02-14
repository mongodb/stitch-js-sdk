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
  CoreStitchUser, 
  StitchCredential, 
  StitchUserProfile, 
  StitchUserIdentity } from "mongodb-stitch-core-sdk";
    
/**
 * The StitchUser represents the currently logged-in user of the [[StitchAppClient]].
 * 
 * This can be retrieved from [[StitchAuth]] or from the result of certain methods
 * such as [[StitchAuth.loginWithCredential]].
 *
 * @see
 * - [[StitchAuth]]
 * - [[StitchCredential]]
 */
export default interface StitchUser extends CoreStitchUser {
  /**
   * The String representation of the ID of this Stitch user.
   */
  readonly id: string;

  /**
   * The time of the last auth event involving this user. 
   * This includes login, logout, and active user changed.
   */
  readonly lastAuthActivity: Date;

  /**
   * The type of authentication provider used to log in as this user.
   */
  readonly loggedInProviderType: string;

  /**
   * The name of the authentication provider used to log in as this user.
   */
  readonly loggedInProviderName: string;

  /**
   * Whether or not this user is logged in.
   * 
   * If the user is logged in, it can be switched to without reauthenticating 
   * using [[StitchAuth.switchToUserWithId]].
   * 
   * @note This is not a dynamic property. This is the state of whether or not
   * the user was logged in at the time this user object was created.
   * Use [[StitchAuth.listUsers]] to get a new list of users with current state.
   */
  readonly isLoggedIn: boolean;

  /**
   * A string describing the type of this user: either `server` or `normal`.
   */
  readonly userType?: string;

  /**
   * A [[StitchUserProfile]] object describing this user.
   */
  readonly profile: StitchUserProfile;

  /**
   * An array of [[StitchUserIdentity]] objects representing the identities 
   * linked to this user which can be used to log in as this user.
   */
  readonly identities: StitchUserIdentity[];

  /**
   * Links this {@link StitchUser} with a new identity, where the identity is 
   * defined by the credential specified as a parameter. This will only be 
   * successful if this {@link StitchUser} is the currently authenticated 
   * {@link StitchUser} for the client from which it was created.
   * 
   * @param credential The credential to use to link this user to a new identity.
   */
  linkWithCredential(credential: StitchCredential): Promise<StitchUser>;
}
