import AuthProviderClientSupplier from "../AuthProviderClientSupplier";
import UserPasswordAuthProviderClient from "./UserPasswordAuthProviderClient";
import { StitchAuthRequestClient, StitchRequestClient, StitchAuthRoutes } from "stitch-core";
import UserPasswordAuthProviderClientImpl from "./internal/UserPasswordAuthProviderClientImpl";

export default class UserPasswordAuthProvider {
    public static ClientProvider: AuthProviderClientSupplier<UserPasswordAuthProviderClient> =
        new class implements AuthProviderClientSupplier<UserPasswordAuthProviderClient> {
          public getClient(
            authRequestClient: StitchAuthRequestClient, // this arg is ignored
            requestClient: StitchRequestClient,
            routes: StitchAuthRoutes): UserPasswordAuthProviderClient {
            return new UserPasswordAuthProviderClientImpl(requestClient, routes);
          }
        }();
}
