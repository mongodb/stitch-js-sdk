import {
  StitchAuthRequestClient,
  StitchAuthRoutes,
  StitchRequestClient
} from "mongodb-stitch-core-sdk";

interface AuthProviderClientFactory<ClientT> {
  getClient(
    authRequestClient: StitchAuthRequestClient,
    requestClient: StitchRequestClient,
    routes: StitchAuthRoutes
  ): ClientT;
}

export default AuthProviderClientFactory;
