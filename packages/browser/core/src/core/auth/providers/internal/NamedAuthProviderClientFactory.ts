import { StitchAuthRoutes, StitchRequestClient } from "mongodb-stitch-core-sdk";

interface NamedAuthProviderClientFactory<T> {
  getNamedClient(
    providerName: string,
    requestClient: StitchRequestClient,
    routes: StitchAuthRoutes
  ): T;
}

export default NamedAuthProviderClientFactory;
