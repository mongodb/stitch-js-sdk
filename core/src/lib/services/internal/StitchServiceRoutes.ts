import { getFunctionCallRoute } from "../../internal/net/StitchAppRoutes";

export default class StitchServiceRoutes {
  public readonly functionCallRoute: string;
  private readonly clientAppId: string;

  public constructor(clientAppId: string) {
    this.clientAppId = clientAppId;
    this.functionCallRoute = getFunctionCallRoute(clientAppId);
  }
}
