import { StitchAuthRoutes, StitchRequestClient } from "stitch-core";
import AuthProviderClientSupplier from "../AuthProviderClientSupplier";
import CustomAuthProviderClient from "./CustomAuthProviderClient";
import CustomAuthProviderClientImpl from "./internal/CustomAuthProviderClientImpl";

export default class CustomAuthProvider {
    public static ClientProvider: AuthProviderClientSupplier<CustomAuthProviderClient> =
        new class implements AuthProviderClientSupplier<CustomAuthProviderClient> {
          public getClient(
            requestClient: StitchRequestClient, 
            routes: StitchAuthRoutes): CustomAuthProviderClient {
            return new CustomAuthProviderClientImpl();
          }
        }();
}
