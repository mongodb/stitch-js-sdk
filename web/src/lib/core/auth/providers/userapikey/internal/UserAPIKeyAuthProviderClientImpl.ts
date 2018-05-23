import { CoreUserAPIKeyAuthProviderClient, StitchAuthRequestClient, StitchAuthRoutes, UserAPIKey } from "stitch-core";
import { UserAPIKeyAuthProviderClient } from "../UserAPIKeyAuthProviderClient";

export default class UserAPIKeyAuthProviderClientImpl extends CoreUserAPIKeyAuthProviderClient
    implements UserAPIKeyAuthProviderClient {

  public createApiKey(name: string): Promise<UserAPIKey> {
    return super.createApiKey(name)
  }

  public fetchApiKey(keyId: string): Promise<UserAPIKey> {
    return super.fetchApiKey(keyId)
  }

  public fetchApiKeys(): Promise<UserAPIKey[]> {
    return super.fetchApiKeys()
  }

  public deleteApiKey(keyId: string): Promise<void> {
    return super.deleteApiKey(keyId)
  }

  public enableApiKey(keyId: string): Promise<void> {
    return super.enableApiKey(keyId)
  }

  public disableApiKey(keyId: string): Promise<void> {
    return super.disableApiKey(keyId)
  }

  public constructor(
    requestClient: StitchAuthRequestClient,
    routes: StitchAuthRoutes) {
    super(requestClient, routes)
  }
}
