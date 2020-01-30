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
  CoreUserPassAuthProviderClient,
  StitchAuthRoutes,
  StitchRequestClient,
  UserPasswordAuthProvider
} from "mongodb-stitch-core-sdk";
import { UserPasswordAuthProviderClient } from "../UserPasswordAuthProviderClient";

/** @hidden */
export default class UserPasswordAuthProviderClientImpl
  extends CoreUserPassAuthProviderClient
  implements UserPasswordAuthProviderClient {
  public constructor(
    requestClient: StitchRequestClient,
    routes: StitchAuthRoutes
  ) {
    super(UserPasswordAuthProvider.DEFAULT_NAME, requestClient, routes);
  }

  public registerWithEmail(email: string, password: string): Promise<void> {
    return super.registerWithEmailInternal(email, password);
  }

  public confirmUser(token: string, tokenId: string): Promise<void> {
    return super.confirmUserInternal(token, tokenId);
  }

  public resendConfirmationEmail(email: string): Promise<void> {
    return super.resendConfirmationEmailInternal(email);
  }

  public resetPassword(
    token: string,
    tokenId: string,
    password: string
  ): Promise<void> {
    return super.resetPasswordInternal(token, tokenId, password);
  }

  public sendResetPasswordEmail(email: string): Promise<void> {
    return super.sendResetPasswordEmailInternal(email);
  }

  public callResetPasswordFunction(email: string, password: string, args: any[]): Promise<void> {
    return super.callResetPasswordFunctionInternal(email, password, args);
  }
}
