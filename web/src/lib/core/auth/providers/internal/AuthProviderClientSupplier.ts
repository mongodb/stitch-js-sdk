import { StitchAuthRoutes, StitchRequestClient } from "stitch-core";

interface AuthProviderClientSupplier<T> {
    getClient(
        requestClient: StitchRequestClient,
        routes: StitchAuthRoutes): T;
}
  
export default AuthProviderClientSupplier;
