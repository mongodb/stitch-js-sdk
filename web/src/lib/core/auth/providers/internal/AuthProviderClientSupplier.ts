import { StitchAuthRoutes, StitchRequestClient, StitchAuthRequestClient } from "stitch-core";

interface AuthProviderClientSupplier<ClientT> {
    getClient(
        authRequestClient: StitchAuthRequestClient,
        requestClient: StitchRequestClient,
        routes: StitchAuthRoutes): ClientT;
}
  
export default AuthProviderClientSupplier;
