import { ObjectID } from "bson";
import {
  CoreUserApiKeyAuthProviderClient,
  StitchAuthRequestClient,
  StitchAuthRoutes,
  UserApiKey
} from "mongodb-stitch-core-sdk";
import { UserApiKeyAuthProviderClient } from "../UserApiKeyAuthProviderClient";

export default class UserApiKeyAuthProviderClientImpl
  extends CoreUserApiKeyAuthProviderClient
  implements UserApiKeyAuthProviderClient {
  public constructor(
    requestClient: StitchAuthRequestClient,
    routes: StitchAuthRoutes
  ) {
    super(requestClient, routes);
  }

  public createApiKey(name: string): Promise<UserApiKey> {
    return super.createApiKey(name);
  }

  public fetchApiKey(keyId: ObjectID): Promise<UserApiKey> {
    return super.fetchApiKey(keyId);
  }

  public fetchApiKeys(): Promise<UserApiKey[]> {
    return super.fetchApiKeys();
  }

  public deleteApiKey(keyId: ObjectID): Promise<void> {
    return super.deleteApiKey(keyId);
  }

  public enableApiKey(keyId: ObjectID): Promise<void> {
    return super.enableApiKey(keyId);
  }

  public disableApiKey(keyId: ObjectID): Promise<void> {
    return super.disableApiKey(keyId);
  }
}
