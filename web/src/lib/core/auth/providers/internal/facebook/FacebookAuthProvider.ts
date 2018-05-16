import FacebookAuthProviderClient from "./FacebookAuthProviderClient";
import AuthProviderClientSupplier from "../AuthProviderClientSupplier";
import { StitchRequestClient, StitchAuthRoutes } from "stitch-core";
import FacebookAuthProviderClientImpl from "./internal/FacebookAuthProviderClientImpl";

export default class FacebookAuthProvider {
    public static ClientProvider: AuthProviderClientSupplier<FacebookAuthProviderClient> =
        new class implements AuthProviderClientSupplier<FacebookAuthProviderClient> {
          public getClient(
            requestClient: StitchRequestClient,
            routes: StitchAuthRoutes): FacebookAuthProviderClient {
            return new FacebookAuthProviderClientImpl();
          }
        }();
}
