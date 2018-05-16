import StitchServiceRoutes from "../../services/internal/StitchServiceRoutes";
import StitchAppAuthRoutes from "./StitchAppAuthRoutes";

const BASE_ROUTE = "/api/client/v2.0";

function getAppRoute(clientAppId: string): string {
  return BASE_ROUTE + `/app/${clientAppId}`;
}

function getFunctionCallRoute(clientAppId: string): string {
  return getAppRoute(clientAppId) + "/functions/call";
}

class StitchAppRoutes {
  public readonly authRoutes: StitchAppAuthRoutes;
  public readonly serviceRoutes: StitchServiceRoutes;

  public readonly functionCallRoute: string;
  private readonly clientAppId: string;

  public constructor(clientAppId: string) {
    this.clientAppId = clientAppId;
    this.authRoutes = new StitchAppAuthRoutes(clientAppId);
    this.serviceRoutes = new StitchServiceRoutes(clientAppId);
    this.functionCallRoute = getFunctionCallRoute(clientAppId);
  }
}

export { BASE_ROUTE, getAppRoute, getFunctionCallRoute, StitchAppRoutes };
