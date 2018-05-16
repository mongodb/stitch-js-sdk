import AuthProviderClientSupplier from "../AuthProviderClientSupplier";
import GoogleAuthProviderClient from "./GoogleAuthProviderClient";
import { StitchRequestClient, StitchAuthRoutes } from "stitch-core";
import GoogleAuthProviderClientImpl from "./internal/GoogleAuthProviderClientImpl";

export default class GoogleAuthProvider {
    public static ClientProvider: AuthProviderClientSupplier<GoogleAuthProviderClient> =
        new class implements AuthProviderClientSupplier<GoogleAuthProviderClient> {
          public getClient(
            requestClient: StitchRequestClient,
            routes: StitchAuthRoutes): GoogleAuthProviderClient {
            return new GoogleAuthProviderClientImpl();
          }
        }();
}
