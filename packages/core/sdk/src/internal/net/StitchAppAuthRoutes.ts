import { StitchAuthRoutes } from "../../auth/internal/StitchAuthRoutes";
import { BASE_ROUTE, getAppRoute } from "./StitchAppRoutes";

function getAuthProviderRoute(
  clientAppId: string,
  providerName: string
): string {
  return getAppRoute(clientAppId) + `/auth/providers/${providerName}`;
}

function getAuthProviderLoginRoute(
  clientAppId: string,
  providerName: string
): string {
  return getAuthProviderRoute(clientAppId, providerName) + "/login";
}

function getAuthProviderLinkRoute(
  clientAppId: string,
  providerName: string
): string {
  return getAuthProviderLoginRoute(clientAppId, providerName) + "?link=true";
}

export default class StitchAppAuthRoutes implements StitchAuthRoutes {
  public readonly baseAuthRoute: string = `${BASE_ROUTE}/auth`;

  public readonly sessionRoute: string = (() =>
    `${this.baseAuthRoute}/session`)();

  public readonly profileRoute: string = (() =>
    `${this.baseAuthRoute}/profile`)();

  private readonly clientAppId: string;

  constructor(clientAppId: string) {
    this.clientAppId = clientAppId;
  }

  public getAuthProviderRoute(providerName: string): string {
    return getAuthProviderRoute(this.clientAppId, providerName);
  }

  public getAuthProviderLoginRoute(providerName: string): string {
    return getAuthProviderLoginRoute(this.clientAppId, providerName);
  }

  public getAuthProviderLinkRoute(providerName: string): string {
    return getAuthProviderLinkRoute(this.clientAppId, providerName);
  }

  public getAuthProviderExtensionRoute(providerName: string, path: string) {
    return `${this.getAuthProviderRoute(providerName)}/${path}`;
  }
}
