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
  StitchAuthRequestClient,
  StitchAuthRoutes,
  StitchRequestClient
} from "mongodb-stitch-core-sdk";
import AuthProviderClientFactory from "../internal/AuthProviderClientFactory";
import UserPasswordAuthProviderClientImpl from "./internal/UserPasswordAuthProviderClientImpl";

export interface UserPasswordAuthProviderClient {
  /**
   * Registers a new user with the given email and password.
   *
   * @return A Promise that completes when registration completes/fails.
   */
  registerWithEmail(email: string, password: string): Promise<void>;

  /**
   * Confirms a user with the given token and token id.
   *
   * @return A Promise that completes when confirmation completes/fails.
   */
  confirmUser(token: string, tokenId: string): Promise<void>;

  /**
   * Resend the confirmation for a user to the given email.
   *
   * @return A Promise that completes when the resend request completes/fails.
   */
  resendConfirmationEmail(email: string): Promise<void>;

  /**
   * Reset the password of a user with the given token, token id, and new password.
   *
   * @return A Promise that completes when the password reset completes/fails.
   */
  resetPassword(
    token: string,
    tokenId: string,
    password: string
  ): Promise<void>;

  /**
   * Sends a user a password reset email for the given email.
   *
   * @return A Promise that completes when the reqest request completes/fails.
   */
  sendResetPasswordEmail(email: string): Promise<void>;
}

export namespace UserPasswordAuthProviderClient {
  export const factory: AuthProviderClientFactory<
    UserPasswordAuthProviderClient
  > = new class
    implements AuthProviderClientFactory<UserPasswordAuthProviderClient> {
    public getClient(
      authRequestClient: StitchAuthRequestClient, // this arg is ignored
      requestClient: StitchRequestClient,
      routes: StitchAuthRoutes
    ): UserPasswordAuthProviderClient {
      return new UserPasswordAuthProviderClientImpl(requestClient, routes);
    }
  }();
}
