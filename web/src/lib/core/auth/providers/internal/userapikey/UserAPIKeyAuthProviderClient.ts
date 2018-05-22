import { UserAPIKey } from "stitch-core";

export default interface UserAPIKeyAuthProviderClient {
  /**
   * Creates a user API key that can be used to authenticate as the current user.
   * 
   * @param name the name of the API key to be created.
   */
  createApiKey(name: string): Promise<UserAPIKey>

  /**
   * Fetches a user API key associated with the current user.
   * 
   * @param keyId the id of the API key to fetch.
   */
  fetchApiKey(keyId: string): Promise<UserAPIKey>

  /**
   * Fetches the user API keys associated with the current user.
   */
  fetchApiKeys(): Promise<UserAPIKey[]>

  /**
   * Deletes a user API key associated with the current user.
   * 
   * @param keyId the id of the API key to delete
   */
  deleteApiKey(keyId: string): Promise<void>

  /**
   * Enables a user API key associated with the current user.
   * 
   * @param keyId the id of the API key to enable
   */
  enableApiKey(keyId: string): Promise<void>

  /**
   * Disables a user API key associated with the current user.
   * 
   * @param keyId the id of the API key to disable
   */
  disableApiKey(keyId: string): Promise<void>
}
