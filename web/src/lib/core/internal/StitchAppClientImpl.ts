import {
  CoreStitchAppClient,
  StitchAppClientConfiguration,
  StitchAppClientInfo,
  StitchAppRoutes,
  StitchRequestClient
} from "stitch-core";
import NamedServiceClientProvider from "../../services/internal/NamedServiceClientProvider";
import ServiceClientProvider from "../../services/internal/ServiceClientProvider";
import StitchServiceImpl from "../../services/internal/StitchServiceImpl";
import StitchAuthImpl from "../auth/internal/StitchAuthImpl";
import StitchAppClient from "../StitchAppClient";

export default class StitchAppClientImpl implements StitchAppClient {
  public readonly auth: StitchAuthImpl;

  private readonly coreClient: CoreStitchAppClient;
  private readonly info: StitchAppClientInfo;
  private readonly routes: StitchAppRoutes;

  public constructor(config: StitchAppClientConfiguration) {
    this.info = new StitchAppClientInfo(
      config.clientAppId,
      config.dataDirectory,
      config.localAppName,
      config.localAppVersion
    );
    this.routes = new StitchAppRoutes(this.info.clientAppId);
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
    provider: NamedServiceClientProvider<T>,
    serviceName: string
  ): T {
    return provider.getClient(
      new StitchServiceImpl(this.auth, this.routes.serviceRoutes, serviceName),
      this.info
    );
  }

  public getServiceClient<T>(provider: ServiceClientProvider<T>): T {
    return provider.getClient(
      new StitchServiceImpl(this.auth, this.routes.serviceRoutes, ""),
      this.info
    );
  }

  public callFunction(name: string, ...args: any[]): Promise<any> {
    return this.coreClient.callFunctionInternal(name, args);
  }
}
