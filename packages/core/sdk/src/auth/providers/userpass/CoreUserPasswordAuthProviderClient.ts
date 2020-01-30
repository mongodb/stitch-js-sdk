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

import Method from "../../../internal/net/Method";
import { StitchDocRequest } from "../../../internal/net/StitchDocRequest";
import StitchRequestClient from "../../../internal/net/StitchRequestClient";
import { StitchAuthRoutes } from "../../internal/StitchAuthRoutes";
import CoreAuthProviderClient from "../internal/CoreAuthProviderClient";
import UserPasswordAuthProvider from "./UserPasswordAuthProvider";
import UserPasswordCredential from "./UserPasswordCredential";

enum RegistrationFields {
  EMAIL = "email",
  PASSWORD = "password"
}

enum ActionFields {
  EMAIL = "email",
  PASSWORD = "password",
  TOKEN = "token",
  TOKEN_ID = "tokenId",
  ARGS = "arguments"
}

/** @hidden */
export default class CoreUserPasswordAuthProviderClient extends CoreAuthProviderClient<
  StitchRequestClient
> {
  public constructor(
    providerName: string = UserPasswordAuthProvider.DEFAULT_NAME,
    requestClient: StitchRequestClient,
    authRoutes: StitchAuthRoutes
  ) {
    const baseRoute = authRoutes.getAuthProviderRoute(providerName);
    super(providerName, requestClient, baseRoute);
  }

  public registerWithEmailInternal(
    email: string,
    password: string
  ): Promise<void> {
    const reqBuilder = new StitchDocRequest.Builder();
    reqBuilder
      .withMethod(Method.POST)
      .withPath(this.getRegisterWithEmailRoute());
    reqBuilder.withDocument({
      [RegistrationFields.EMAIL]: email,
      [RegistrationFields.PASSWORD]: password
    });
    return this.requestClient.doRequest(reqBuilder.build()).then(() => {});
  }

  protected confirmUserInternal(token: string, tokenId: string): Promise<void> {
    const reqBuilder = new StitchDocRequest.Builder();
    reqBuilder.withMethod(Method.POST).withPath(this.getConfirmUserRoute());
    reqBuilder.withDocument({
      [ActionFields.TOKEN]: token,
      [ActionFields.TOKEN_ID]: tokenId
    });
    return this.requestClient.doRequest(reqBuilder.build()).then(() => {});
  }

  protected resendConfirmationEmailInternal(email: string): Promise<void> {
    const reqBuilder = new StitchDocRequest.Builder();
    reqBuilder
      .withMethod(Method.POST)
      .withPath(this.getResendConfirmationEmailRoute());
    reqBuilder.withDocument({ [ActionFields.EMAIL]: email });
    return this.requestClient.doRequest(reqBuilder.build()).then(() => {});
  }

  protected resetPasswordInternal(
    token: string,
    tokenId: string,
    password: string
  ): Promise<void> {
    const reqBuilder = new StitchDocRequest.Builder();
    reqBuilder.withMethod(Method.POST).withPath(this.getResetPasswordRoute());
    reqBuilder.withDocument({
      [ActionFields.TOKEN]: token,
      [ActionFields.TOKEN_ID]: tokenId,
      [ActionFields.PASSWORD]: password
    });
    return this.requestClient.doRequest(reqBuilder.build()).then(() => {});
  }

  protected sendResetPasswordEmailInternal(email: string): Promise<void> {
    const reqBuilder = new StitchDocRequest.Builder();
    reqBuilder
      .withMethod(Method.POST)
      .withPath(this.getSendResetPasswordEmailRoute());
    reqBuilder.withDocument({ [ActionFields.EMAIL]: email });
    return this.requestClient.doRequest(reqBuilder.build()).then(() => {});
  }

  protected callResetPasswordFunctionInternal(email: string, password: string, args: any[]): Promise<void> {
    const reqBuilder = new StitchDocRequest.Builder();
    reqBuilder
      .withMethod(Method.POST)
      .withPath(this.getCallResetPasswordFunctionRoute());
    reqBuilder.withDocument({
      [ActionFields.EMAIL]: email,
      [ActionFields.PASSWORD]: password,
      [ActionFields.ARGS]: args
    });
    return this.requestClient.doRequest(reqBuilder.build()).then(() => {});
  }

  private getRegisterWithEmailRoute(): string {
    return this.getExtensionRoute("register");
  }

  private getConfirmUserRoute(): string {
    return this.getExtensionRoute("confirm");
  }

  private getResendConfirmationEmailRoute(): string {
    return this.getExtensionRoute("confirm/send");
  }

  private getResetPasswordRoute(): string {
    return this.getExtensionRoute("reset");
  }

  private getSendResetPasswordEmailRoute(): string {
    return this.getExtensionRoute("reset/send");
  }

  private getCallResetPasswordFunctionRoute(): string {
    return this.getExtensionRoute("reset/call");
  }

  private getExtensionRoute(path: string): string {
    return `${this.baseRoute}/${path}`;
  }
}
