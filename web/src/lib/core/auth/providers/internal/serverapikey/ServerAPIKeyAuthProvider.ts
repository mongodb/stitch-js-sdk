import ServerAPIKeyAuthProviderClient from "./ServerAPIKeyAuthProviderClient";
import AuthProviderClientSupplier from "../AuthProviderClientSupplier";
import { StitchRequestClient, StitchAuthRoutes } from "stitch-core";
import ServerAPIKeyAuthProviderClientImpl from "./internal/ServerAPIKeyAuthProviderClientImpl";

export default class ServerAPIKeyAuthProvider {
    public static ClientProvider: AuthProviderClientSupplier<ServerAPIKeyAuthProviderClient> =
        new class implements AuthProviderClientSupplier<ServerAPIKeyAuthProviderClient> {
          public getClient(
            requestClient: StitchRequestClient,
            routes: StitchAuthRoutes): ServerAPIKeyAuthProviderClient {
            return new ServerAPIKeyAuthProviderClientImpl();
          }
        }();
}
