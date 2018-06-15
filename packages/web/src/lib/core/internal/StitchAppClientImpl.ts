import {
  CoreStitchAppClient,
  StitchAppClientConfiguration,
  StitchAppClientInfo,
  StitchAppRoutes,
  StitchRequestClient
} from "stitch-core";
import NamedServiceClientFactory from "../../services/internal/NamedServiceClientFactory";
import ServiceClientFactory from "../../services/internal/ServiceClientFactory";
import StitchServiceImpl from "../../services/internal/StitchServiceImpl";
import StitchAuthImpl from "../auth/internal/StitchAuthImpl";
import StitchBrowserAppRoutes from "../auth/internal/StitchBrowserAppRoutes";
import StitchAppClient from "../StitchAppClient";

export default class StitchAppClientImpl implements StitchAppClient {
  public readonly auth: StitchAuthImpl;

  private readonly coreClient: CoreStitchAppClient;
  private readonly info: StitchAppClientInfo;
  private readonly routes: StitchBrowserAppRoutes;

  public constructor(config: StitchAppClientConfiguration) {
    this.info = new StitchAppClientInfo(
      config.clientAppId,
      config.dataDirectory,
      config.localAppName,
      config.localAppVersion
    );
    this.routes = new StitchBrowserAppRoutes(
      this.info.clientAppId,
      config.baseURL
    );
    const requestClient = new StitchRequestClient(
      config.baseURL,
      config.transport
    );
    this.auth = new StitchAuthImpl(
      requestClient,
      this.routes.authRoutes,
      config.storage,
      this.info
    );
    this.coreClient = new CoreStitchAppClient(this.auth, this.routes);
  }

  public getServiceClientWithName<T>(
    provider: NamedServiceClientFactory<T>,
    serviceName: string
  ): T {
    return provider.getClient(
      new StitchServiceImpl(this.auth, this.routes.serviceRoutes, serviceName),
      this.info
    );
  }

  public getServiceClient<T>(provider: ServiceClientFactory<T>): T {
    return provider.getClient(
      new StitchServiceImpl(this.auth, this.routes.serviceRoutes, ""),
      this.info
    );
  }

  public callFunction(name: string, args: any[]): Promise<any> {
    return this.coreClient.callFunctionInternal(name, args);
  }
}
