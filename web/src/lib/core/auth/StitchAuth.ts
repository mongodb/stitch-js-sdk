import { StitchCredential } from "stitch-core";
import AuthProviderClientSupplier from "./providers/internal/AuthProviderClientSupplier";
import NamedAuthProviderClientSupplier from "./providers/internal/NamedAuthProviderClientSupplier";
import StitchAuthListener from "./StitchAuthListener";
import StitchUser from "./StitchUser";

interface StitchAuth {
    isLoggedIn: boolean;
  
    user?: StitchUser;

    getProviderClient<T>(provider: AuthProviderClientSupplier<T>): T;
  
    getProviderClientWithName<T>(
        provider: NamedAuthProviderClientSupplier<T>, providerName: string): T;
  
    loginWithCredential(credential: StitchCredential): Promise<StitchUser>;
  
    logout(): Promise<void>;
  
    addAuthListener(listener: StitchAuthListener);

    removeAuthListener(listener: StitchAuthListener);
}

export default StitchAuth;
