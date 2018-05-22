import StitchRequestClient from "../../internal/net/StitchRequestClient";
import { StitchAuthRoutes } from "../internal/StitchAuthRoutes";

/**
 * The class from which all Core auth provider clients inherit. Only auth 
 * provider clients that make requests to the Stitch server need to inherit this class.	
 */
export default abstract class CoreAuthProviderClient<RequestClientType> {
  /**
   * The name of the authentication provider.
   */
  protected readonly providerName: string;

  /**
   * The request client used by the client to make requests. Is of a generic type since some auth provider clients 
   * use an authenticated request client while others use an unauthenticated request client.
   */
  protected readonly requestClient: RequestClientType;

  /**
   * The base route for this authentication provider client.
   */
  protected readonly baseRoute: string;

  protected constructor(
    providerName: string,
    requestClient: RequestClientType,
    baseRoute: string
  ) {
    this.providerName = providerName;
    this.requestClient = requestClient;
    this.baseRoute = baseRoute;
  }
}
