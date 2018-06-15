import { FetchTransport, StitchAppClientConfiguration } from "stitch-core";
import LocalStorage from "./internal/common/LocalStorage";
import StitchAppClientImpl from "./internal/StitchAppClientImpl";
import StitchAppClient from "./StitchAppClient";

const DEFAULT_BASE_URL = "https://stitch.mongodb.com";
const TAG = "Stitch";
const appClients: { [key: string]: StitchAppClientImpl } = {};

export default class Stitch {
  public static initialize() {
    if (Stitch.initialized) {
      return;
    }

    // TODO: STITCH-1615 Web SDK: Get Application info on Initialization
    Stitch.initialized = true;
  }

  public static get defaultAppClient(): StitchAppClient {
    Stitch.ensureInitialized();
    if (Stitch.defaultClientAppId === undefined) {
      throw new Error("default app client has not yet been initialized/set");
    }
    return appClients[Stitch.defaultClientAppId];
  }

  public static getAppClient(clientAppId: string): StitchAppClient {
    if (appClients[clientAppId] !== undefined) {
      throw new Error(
        `client for app '${clientAppId}' has not yet been initialized`
      );
    }
    return appClients[clientAppId];
  }

  public static hasAppClient(clientAppId: string): boolean {
    return appClients[clientAppId] !== undefined;
  }

  public static initializeDefaultAppClient(
    configBuilder: StitchAppClientConfiguration.Builder
  ): StitchAppClient {
    const clientAppId = configBuilder.clientAppId;
    if (clientAppId === undefined || clientAppId === "") {
      throw new Error("clientAppId must be set to a non-empty string");
    }
    if (Stitch.defaultClientAppId != null) {
      throw new Error(
        `default app can only be set once; currently set to '${
          Stitch.defaultClientAppId
        }'`
      );
    }
    const client = Stitch.initializeAppClient(configBuilder);
    Stitch.defaultClientAppId = clientAppId;
    return client;
  }

  public static initializeAppClient(
    configBuilder: StitchAppClientConfiguration.Builder
  ): StitchAppClient {
    if (!configBuilder.clientAppId) {
      throw new Error("clientAppId must be set to a non-empty string");
    }

    if (appClients[configBuilder.clientAppId] !== undefined) {
      throw new Error(
        `client for app '${
          configBuilder.clientAppId
        }' has already been initialized`
      );
    }

    if (configBuilder.storage === undefined) {
      configBuilder.withStorage(new LocalStorage(configBuilder.clientAppId));
    }
    if (!configBuilder.transport) {
      configBuilder.withTransport(new FetchTransport());
    }
    if (!configBuilder.baseURL) {
      configBuilder.withBaseURL(DEFAULT_BASE_URL);
    }
    if (!configBuilder.localAppName) {
      configBuilder.withLocalAppName(Stitch.localAppName);
    }
    if (!configBuilder.localAppVersion) {
      configBuilder.withLocalAppVersion(Stitch.localAppVersion);
    }

    const config = configBuilder.build();
    if (appClients[config.clientAppId]) {
      return appClients[config.clientAppId];
    }

    const client = new StitchAppClientImpl(configBuilder.build());
    appClients[config.clientAppId] = client;
    return client;
  }

  private static initialized: boolean;
  private static localAppVersion: string;
  private static defaultClientAppId: string;
  private static localAppName: string;

  private static ensureInitialized() {
    if (!Stitch.initialized) {
      throw new Error(
        "Stitch not initialized yet; please call initialize() first"
      );
    }
  }
}
