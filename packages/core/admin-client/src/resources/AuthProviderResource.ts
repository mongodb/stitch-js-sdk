import { applyMixins, BasicResource, Disablable, Enablable, Gettable, Removable, Updatable } from "../../Resources";
import AuthProviderRoutes from "../routes/AuthProviderRoutes";
import { AuthProviderResponse, AuthProviderResponseCodec } from "./AuthProvidersResource";

// / Resource for a specific auth provider of an application
export default class AuthProviderResource extends BasicResource<AuthProviderRoutes>
  implements
    Gettable<AuthProviderResponse, AuthProviderRoutes>,
    Updatable<AuthProviderResponse, AuthProviderRoutes>,
    Removable<AuthProviderRoutes>,
    Enablable<AuthProviderRoutes>,
    Disablable<AuthProviderRoutes> {
  public readonly codec = new AuthProviderResponseCodec();
  public readonly updatableCodec = new AuthProviderResponseCodec();

  public get: () => Promise<AuthProviderResponse>;
  public update: (data: AuthProviderResponse) => Promise<AuthProviderResponse>;
  public remove: () => Promise<void>;
  public enable: () => Promise<void>;
  public disable: () => Promise<void>;
}
applyMixins(AuthProviderResource, [
  Gettable,
  Updatable,
  Removable,
  Enablable,
  Disablable
]);
