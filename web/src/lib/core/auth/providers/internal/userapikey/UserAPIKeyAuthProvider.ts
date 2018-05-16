import UserAPIKeyAuthProviderClient from "./UserAPIKeyAuthProviderClient";
import AuthProviderClientSupplier from "../AuthProviderClientSupplier";
import { StitchRequestClient, StitchAuthRoutes } from "stitch-core";
import UserAPIKeyAuthProviderClientImpl from "./internal/UserAPIKeyAuthProviderClientImpl";

export default class UserAPIKeyAuthProvider {
    public static ClientProvider: AuthProviderClientSupplier<UserAPIKeyAuthProviderClient> =
        new class implements AuthProviderClientSupplier<UserAPIKeyAuthProviderClient> {
          public getClient(
            requestClient: StitchRequestClient,
            routes: StitchAuthRoutes): UserAPIKeyAuthProviderClient {
            return new UserAPIKeyAuthProviderClientImpl();
          }
        }();
}
