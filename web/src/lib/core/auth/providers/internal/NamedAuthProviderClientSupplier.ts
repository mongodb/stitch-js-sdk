import { StitchAuthRoutes, StitchRequestClient } from "stitch-core";

interface NamedAuthProviderClientSupplier<T> {
    getClient(
        providerName: string,
        requestClient: StitchRequestClient,
        routes: StitchAuthRoutes): T;
}

export default NamedAuthProviderClientSupplier;
