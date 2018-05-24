import { StitchAuthRoutes, StitchRequestClient } from "stitch-core";

interface NamedAuthProviderClientFactory<T> {
    getClient(
        providerName: string,
        requestClient: StitchRequestClient,
        routes: StitchAuthRoutes): T;
}

export default NamedAuthProviderClientFactory;
