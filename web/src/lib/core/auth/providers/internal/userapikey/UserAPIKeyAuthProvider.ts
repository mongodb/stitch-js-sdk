import UserAPIKeyAuthProviderClient from "./UserAPIKeyAuthProviderClient";
import AuthProviderClientSupplier from "../AuthProviderClientSupplier";
import { StitchRequestClient, StitchAuthRoutes, StitchAuthRequestClient } from "stitch-core";
import UserAPIKeyAuthProviderClientImpl from "./internal/UserAPIKeyAuthProviderClientImpl";

export default class UserAPIKeyAuthProvider {
    public static ClientProvider: AuthProviderClientSupplier<UserAPIKeyAuthProviderClient> =
        new class implements AuthProviderClientSupplier<UserAPIKeyAuthProviderClient> {
          public getClient(
            authRequestClient: StitchAuthRequestClient,
            requestClient: StitchRequestClient, // this arg is ignored
            routes: StitchAuthRoutes): UserAPIKeyAuthProviderClient {
            return new UserAPIKeyAuthProviderClientImpl(authRequestClient, routes);
          }
        }();
}
