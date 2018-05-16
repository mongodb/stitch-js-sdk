import AnonymousAuthProviderClient from "./AnonymousAuthProviderClient";
import AuthProviderClientSupplier from "../AuthProviderClientSupplier";
import { StitchRequestClient, StitchAuthRoutes } from "stitch-core";
import AnonymousAuthProviderClientImpl from "./internal/AnonymousAuthProviderClientImpl";

export default class AnonymousAuthProvider {
    public static ClientProvider: AuthProviderClientSupplier<AnonymousAuthProviderClient> =
        new class implements AuthProviderClientSupplier<AnonymousAuthProviderClient> {
          public getClient(
            requestClient: StitchRequestClient,
            routes: StitchAuthRoutes): AnonymousAuthProviderClient {
            return new AnonymousAuthProviderClientImpl();
          }
        }();
}
