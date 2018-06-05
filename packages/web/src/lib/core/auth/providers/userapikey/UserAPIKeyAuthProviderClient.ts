import { ObjectID } from "bson";
import {
  StitchAuthRequestClient,
  StitchAuthRoutes,
  StitchRequestClient,
  UserAPIKey
} from "stitch-core";
import AuthProviderClientFactory from "../internal/AuthProviderClientFactory";
import UserAPIKeyAuthProviderClientImpl from "./internal/UserAPIKeyAuthProviderClientImpl";

export interface UserAPIKeyAuthProviderClient {
  /**
   * Creates a user API key that can be used to authenticate as the current user.
   *
   * @param name the name of the API key to be created.
   */
  createApiKey(name: string): Promise<UserAPIKey>;

  /**
   * Fetches a user API key associated with the current user.
   *
   * @param keyId the id of the API key to fetch.
   */
  fetchApiKey(keyId: ObjectID): Promise<UserAPIKey>;

  /**
   * Fetches the user API keys associated with the current user.
   */
  fetchApiKeys(): Promise<UserAPIKey[]>;

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

export namespace UserAPIKeyAuthProviderClient {
  export const Factory: AuthProviderClientFactory<
    UserAPIKeyAuthProviderClient
  > = new class
    implements AuthProviderClientFactory<UserAPIKeyAuthProviderClient> {
    public getClient(
      authRequestClient: StitchAuthRequestClient,
      requestClient: StitchRequestClient, // this arg is ignored
      routes: StitchAuthRoutes
    ): UserAPIKeyAuthProviderClient {
      return new UserAPIKeyAuthProviderClientImpl(authRequestClient, routes);
    }
  }();
}
