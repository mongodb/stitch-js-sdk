import { StitchCredential } from "mongodb-stitch-core-sdk";
import AuthProviderClientFactory from "./providers/internal/AuthProviderClientFactory";
import NamedAuthProviderClientFactory from "./providers/internal/NamedAuthProviderClientFactory";
import StitchAuthListener from "./StitchAuthListener";
import StitchUser from "./StitchUser";

interface StitchAuth {
  isLoggedIn: boolean;

  user?: StitchUser;

  getProviderClient<ClientT>(
    factory: AuthProviderClientFactory<ClientT>
  ): ClientT;

  getProviderClient<T>(
    factory: NamedAuthProviderClientFactory<T>,
    providerName: string
  ): T;

  loginWithCredential(credential: StitchCredential): Promise<StitchUser>;

  logout(): Promise<void>;

  addAuthListener(listener: StitchAuthListener);

  removeAuthListener(listener: StitchAuthListener);
}

export default StitchAuth;
