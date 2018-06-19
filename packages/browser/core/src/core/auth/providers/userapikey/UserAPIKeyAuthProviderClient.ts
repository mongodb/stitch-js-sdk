import { ObjectID } from "bson";
import {
  StitchAuthRequestClient,
  StitchAuthRoutes,
  StitchRequestClient,
  UserApiKey
} from "mongodb-stitch-core-sdk";
import AuthProviderClientFactory from "../internal/AuthProviderClientFactory";
import UserApiKeyAuthProviderClientImpl from "./internal/UserApiKeyAuthProviderClientImpl";

export interface UserApiKeyAuthProviderClient {
  /**
   * Creates a user API key that can be used to authenticate as the current user.
   *
   * @param name the name of the API key to be created.
   */
  createApiKey(name: string): Promise<UserApiKey>;

  /**
   * Fetches a user API key associated with the current user.
   *
   * @param keyId the id of the API key to fetch.
   */
  fetchApiKey(keyId: ObjectID): Promise<UserApiKey>;

  /**
   * Fetches the user API keys associated with the current user.
   */
  fetchApiKeys(): Promise<UserApiKey[]>;

  /**
   * Deletes a user API key associated with the current user.
   *
   * @param keyId the id of the API key to delete
   */
  deleteApiKey(keyId: ObjectID): Promise<void>;

  /**
   * Enables a user API key associated with the current user.
   *
   * @param keyId the id of the API key to enable
   */
  enableApiKey(keyId: ObjectID): Promise<void>;

  /**
   * Disables a user API key associated with the current user.
   *
   * @param keyId the id of the API key to disable
   */
  disableApiKey(keyId: ObjectID): Promise<void>;
}

export namespace UserApiKeyAuthProviderClient {
  export const factory: AuthProviderClientFactory<
    UserApiKeyAuthProviderClient
  > = new class
    implements AuthProviderClientFactory<UserApiKeyAuthProviderClient> {
    public getClient(
      authRequestClient: StitchAuthRequestClient,
      requestClient: StitchRequestClient, // this arg is ignored
      routes: StitchAuthRoutes
    ): UserApiKeyAuthProviderClient {
      return new UserApiKeyAuthProviderClientImpl(authRequestClient, routes);
    }
  }();
}
