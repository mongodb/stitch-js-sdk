/**
 * An interface representing the authentication API routes on the Stitch server.
 */
export interface StitchAuthRoutes {
  /**
   * The route on the server for getting a new access token.
   */
  readonly sessionRoute: string;

  /**
   * The route on the server for fetching the currently authenticated user's profile.
   */
  readonly profileRoute: string;

  /**
   * The base route on the server for authentication-related actions.
   */
  readonly baseAuthRoute: string;

  /**
   * Returns the route on the server for getting information about a particular authentication provider.
   */
  getAuthProviderRoute(providerName: string): string;

  /**
   * Returns the route on the server for logging in with a particular authentication provider.
   */
  getAuthProviderLoginRoute(providerName: string): string;

  /**
   * Returns the route on the server for linking the currently authenticated user with an identity associated with a
   * particular authentication provider.
   */
  getAuthProviderLinkRoute(providerName: string): string;

  getAuthProviderExtensionRoute(providerName: string, path: string);
}
