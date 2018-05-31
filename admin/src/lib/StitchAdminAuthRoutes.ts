import { StitchAuthRoutes } from "stitch-core";
import StitchAdminClient from "./StitchAdminClient";

/**
 * The set of authentication routes on the Stitch server to authenticate as an admin user.
 */
export default class StitchAdminAuthRoutes implements StitchAuthRoutes {
  get baseAuthRoute(): string {
    return `${StitchAdminClient.apiPath}/auth`;
  }

  /**
   * The route on the server for getting a new access token.
   */
  get sessionRoute(): string {
    return `${this.baseAuthRoute}/session`;
  }

  /**
   * The route on the server for fetching the currently authenticated user's profile.
   */
  get profileRoute(): string {
    return `${this.baseAuthRoute}/profile`;
  }

  /**
   * Returns the route on the server for a particular authentication provider.
   */
  getAuthProviderRoute(providerName: string): string {
    return `${this.baseAuthRoute}/providers/${providerName}`;
  }

  /**
   * Returns the route on the server for logging in with a particular authentication provider.
   */
  getAuthProviderLoginRoute(providerName: string): string {
    return `${this.getAuthProviderRoute(providerName)}/login`;
  }

  /**
   * Returns the route on the server for linking the currently authenticated user with an identity associated with a
   * particular authentication provider.
   */
  getAuthProviderLinkRoute(providerName: string): string {
    return `${this.getAuthProviderLoginRoute(providerName)}?link=true`;
  }
}
