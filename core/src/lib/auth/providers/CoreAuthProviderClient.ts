import StitchRequestClient from "../../internal/net/StitchRequestClient";
import { StitchAuthRoutes } from "../internal/StitchAuthRoutes";

export default abstract class CoreAuthProviderClient {
  protected readonly providerName: string;
  protected readonly requestClient: StitchRequestClient;
  protected readonly authRoutes: StitchAuthRoutes;

  protected constructor(
    providerName: string,
    requestClient: StitchRequestClient,
    authRoutes: StitchAuthRoutes
  ) {
    this.providerName = providerName;
    this.requestClient = requestClient;
    this.authRoutes = authRoutes;
  }
}
