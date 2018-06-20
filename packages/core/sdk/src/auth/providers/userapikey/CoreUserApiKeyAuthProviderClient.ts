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

import { ObjectID } from "bson";
import StitchAuthRequestClient from "../../../auth/internal/StitchAuthRequestClient";
import { StitchAuthRoutes } from "../../../auth/internal/StitchAuthRoutes";
import Method from "../../../internal/net/Method";
import { StitchAuthDocRequest } from "../../../internal/net/StitchAuthDocRequest";
import { StitchAuthRequest } from "../../../internal/net/StitchAuthRequest";
import StitchError from "../../../StitchError";
import StitchException from "../../../StitchException";
import { StitchRequestErrorCode } from "../../../StitchRequestErrorCode";
import StitchRequestException from "../../../StitchRequestException";
import CoreAuthProviderClient from "../internal/CoreAuthProviderClient";
import UserApiKey from "./models/UserApiKey";
import UserApiKeyAuthProvider from "./UserApiKeyAuthProvider";
import UserApiKeyCredential from "./UserApiKeyCredential";

enum ApiKeyFields {
  NAME = "name"
}

/**
 * A client for the user API key authentication provider which can be used to obtain a credential for logging in.
 */
export default class CoreUserApiKeyAuthProviderClient extends CoreAuthProviderClient<
  StitchAuthRequestClient
> {
  public constructor(
    requestClient: StitchAuthRequestClient,
    authRoutes: StitchAuthRoutes
  ) {
    const baseRoute = `${authRoutes.baseAuthRoute}/api_keys`;
    const name = UserApiKeyAuthProvider.DEFAULT_NAME;
    super(name, requestClient, baseRoute);
  }

  /**
   * Creates a user API key that can be used to authenticate as the current user.
   *
   * @param name the name of the API key to be created.
   */
  public createApiKey(name: string): Promise<UserApiKey> {
    const reqBuilder = new StitchAuthDocRequest.Builder();
    reqBuilder
      .withMethod(Method.POST)
      .withPath(this.baseRoute)
      .withDocument({
        [ApiKeyFields.NAME]: name
      })
      .withRefreshToken();

    return this.requestClient
      .doAuthenticatedRequest(reqBuilder.build())
      .then(response => {
        return UserApiKey.readFromApi(response.body!);
      })
      .catch(err => {
        throw StitchError.wrapDecodingError(err);
      });
  }

  /**
   * Fetches a user API key associated with the current user.
   *
   * @param keyId the id of the API key to fetch.
   */
  public fetchApiKey(keyId: ObjectID): Promise<UserApiKey> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder
      .withMethod(Method.GET)
      .withPath(this.getApiKeyRoute(keyId.toHexString()));
    reqBuilder.withRefreshToken();

    return this.requestClient
      .doAuthenticatedRequest(reqBuilder.build())
      .then(response => {
        return UserApiKey.readFromApi(response.body!);
      })
      .catch(err => {
        throw StitchError.wrapDecodingError(err);
      });
  }

  /**
   * Fetches the user API keys associated with the current user.
   */
  public fetchApiKeys(): Promise<UserApiKey[]> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder.withMethod(Method.GET).withPath(this.baseRoute);
    reqBuilder.withRefreshToken();

    return this.requestClient
      .doAuthenticatedRequest(reqBuilder.build())
      .then(response => {
        const json = JSON.parse(response.body!);
        if (Array.isArray(json)) {
          return json.map(value => UserApiKey.readFromApi(value));
        }

        throw new StitchRequestException(
          new Error("unexpected non-array response from server"),
          StitchRequestErrorCode.DECODING_ERROR
        );
      })
      .catch(err => {
        throw StitchError.wrapDecodingError(err);
      });
  }

  /**
   * Deletes a user API key associated with the current user.
   *
   * @param keyId the id of the API key to delete
   */
  public deleteApiKey(keyId: ObjectID): Promise<void> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder
      .withMethod(Method.DELETE)
      .withPath(this.getApiKeyRoute(keyId.toHexString()));
    reqBuilder.withRefreshToken();

    return this.requestClient
      .doAuthenticatedRequest(reqBuilder.build())
      .then(() => {});
  }

  /**
   * Enables a user API key associated with the current user.
   *
   * @param keyId the id of the API key to enable
   */
  public enableApiKey(keyId: ObjectID): Promise<void> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder
      .withMethod(Method.PUT)
      .withPath(this.getApiKeyEnableRoute(keyId.toHexString()));
    reqBuilder.withRefreshToken();

    return this.requestClient
      .doAuthenticatedRequest(reqBuilder.build())
      .then(() => {});
  }

  /**
   * Disables a user API key associated with the current user.
   *
   * @param keyId the id of the API key to disable
   */
  public disableApiKey(keyId: ObjectID): Promise<void> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder
      .withMethod(Method.PUT)
      .withPath(this.getApiKeyDisableRoute(keyId.toHexString()));
    reqBuilder.withRefreshToken();

    return this.requestClient
      .doAuthenticatedRequest(reqBuilder.build())
      .then(() => {});
  }

  private getApiKeyRoute(keyId: string): string {
    return `${this.baseRoute}/${keyId}`;
  }

  private getApiKeyEnableRoute(keyId: string): string {
    return `${this.getApiKeyRoute(keyId)}/enable`;
  }

  private getApiKeyDisableRoute(keyId: string): string {
    return `${this.getApiKeyRoute(keyId)}/disable`;
  }
}
