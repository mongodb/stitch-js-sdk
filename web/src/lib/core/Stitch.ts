import { FetchTransport, StitchAppClientConfiguration } from "stitch-core";
import LocalStorage from "./internal/common/LocalStorage";
import StitchAppClientImpl from "./internal/StitchAppClientImpl";
import StitchAppClient from "./StitchAppClient";

const DEFAULT_BASE_URL = "https://stitch.mongodb.com";
const TAG = "Stitch";
const appClients: {[key: string]: StitchAppClientImpl} = {};

export default class Stitch {
    private static ensureInitialized() {
      if (!Stitch.initialized) {
        throw new Error("Stitch not initialized yet; please call initialize() first");
      }
    }

    public static initialize() {
      if (Stitch.initialized) {
        return;
      }
  
      // TODO: get app info
  
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
            `client for app '${clientAppId}' has not yet been initialized`)
      }
      return appClients[clientAppId];
    }
  
    public static initializeDefaultAppClient(
        configBuilder: StitchAppClientConfiguration): StitchAppClient {
      const clientAppId = configBuilder.clientAppId;
      if (clientAppId === undefined || clientAppId === "") {
        throw new Error("clientAppId must be set to a non-empty string");
      }
      if (Stitch.defaultClientAppId != null) {
        throw new Error(
            `default app can only be set once; currently set to '${Stitch.defaultClientAppId}'`)
      }
      const client = Stitch.initializeAppClient(configBuilder);
      Stitch.defaultClientAppId = clientAppId;
      return client;
    }
  
    public static initializeAppClient(
        appConfig: StitchAppClientConfiguration): StitchAppClient {
      if (!appConfig.clientAppId) {
        throw new Error("clientAppId must be set to a non-empty string");
      }
  
      if (appClients[appConfig.clientAppId] !== undefined) {
        throw new Error(
            `client for app '${appConfig.clientAppId}' has already been initialized`);
      }

      const configBuilder = appConfig.builder();
      if (configBuilder.storage === undefined) {
        configBuilder.withStorage(new LocalStorage());
      }
      if (configBuilder.getTransport() == null) {
        configBuilder.withTransport(new FetchTransport());
      }
      if (configBuilder.getBaseURL() == null || configBuilder.getBaseURL().isEmpty()) {
        configBuilder.withBaseURL(DEFAULT_BASE_URL);
      }
      if (configBuilder.getLocalAppName() == null || configBuilder.getLocalAppName().isEmpty()) {
        configBuilder.withLocalAppName(Stitch.localAppName);
      }
      if (configBuilder.getLocalAppVersion() == null
          || configBuilder.getLocalAppVersion().isEmpty()) {
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
}
