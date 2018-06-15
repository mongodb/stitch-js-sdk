import { StitchAppAuthRoutes, StitchAppRoutes } from "stitch-core";
import StitchBrowserAppAuthRoutes from "./StitchBrowserAppAuthRoutes";

export default class StitchBrowserAppRoutes extends StitchAppRoutes {
  public readonly authRoutes: StitchBrowserAppAuthRoutes;

  public constructor(clientAppId: string, baseUrl: string) {
    super(clientAppId);
    this.authRoutes = new StitchBrowserAppAuthRoutes(clientAppId, baseUrl);
  }
}
