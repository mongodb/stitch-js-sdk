import { ObjectID } from "bson";
import {
  CoreUserAPIKeyAuthProviderClient,
  StitchAuthRequestClient,
  StitchAuthRoutes,
  UserAPIKey
} from "mongodb-stitch-core-sdk";
import { UserAPIKeyAuthProviderClient } from "../UserAPIKeyAuthProviderClient";

export default class UserAPIKeyAuthProviderClientImpl
  extends CoreUserAPIKeyAuthProviderClient
  implements UserAPIKeyAuthProviderClient {
  public constructor(
    requestClient: StitchAuthRequestClient,
    routes: StitchAuthRoutes
  ) {
    super(requestClient, routes);
  }

  public createApiKey(name: string): Promise<UserAPIKey> {
    return super.createApiKey(name);
  }

  public fetchApiKey(keyId: ObjectID): Promise<UserAPIKey> {
    return super.fetchApiKey(keyId);
  }

  public fetchApiKeys(): Promise<UserAPIKey[]> {
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
