import { StitchCredential } from "stitch-core";
import AuthProviderClientFactory from "./providers/internal/AuthProviderClientFactory";
import NamedAuthProviderClientFactory from "./providers/internal/NamedAuthProviderClientFactory";
import StitchRedirectCredential from "./providers/StitchRedirectCredential";
import StitchAuthListener from "./StitchAuthListener";
import { StitchUser } from "./StitchUser";

interface StitchAuth {
  isLoggedIn: boolean;

  user?: StitchUser;

  getProviderClient<ClientT>(
    provider: AuthProviderClientFactory<ClientT>
  ): ClientT;

  getProviderClientWithName<T>(
    provider: NamedAuthProviderClientFactory<T>,
    providerName: string
  ): T;

  loginWithCredential(credential: StitchCredential): Promise<StitchUser>;

  loginWithRedirect(credential: StitchRedirectCredential);

  linkUserWithRedirect(user: StitchUser, credential: StitchRedirectCredential);

  handleRedirect(): Promise<StitchUser>;

  hasRedirect(): boolean;

  logout(): Promise<void>;

  addAuthListener(listener: StitchAuthListener);

  removeAuthListener(listener: StitchAuthListener);
}

export default StitchAuth;
