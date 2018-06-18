import StitchRequestClient from "../../../internal/net/StitchRequestClient";
import { StitchAuthRoutes } from "../../internal/StitchAuthRoutes";

/**
 * The class from which all Core auth provider clients inherit. Only auth
 * provider clients that make requests to the Stitch server need to inherit this class.
 */
export default abstract class CoreAuthProviderClient<RequestClientType> {
  /**
   * Construct a new CoreAuthProviderClient
   * @param providerName The name of the authentication provider.
   * @param requestClient The request client used by the client to make requests.
   * Is of a generic type since some auth provider clients
   * use an authenticated request client while others use an unauthenticated request client.
   * @param baseRoute The base route for this authentication provider client.
   */
  protected constructor(
    protected readonly providerName: string,
    protected readonly requestClient: RequestClientType,
    protected readonly baseRoute: string
  ) {}
}
