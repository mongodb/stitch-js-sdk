import {
  StitchAuthRequestClient,
  StitchAuthRoutes,
  StitchRequestClient
} from "stitch-core";

interface AuthProviderClientFactory<ClientT> {
  getClient(
    authRequestClient: StitchAuthRequestClient,
    requestClient: StitchRequestClient,
    routes: StitchAuthRoutes
  ): ClientT;
}

export default AuthProviderClientFactory;
