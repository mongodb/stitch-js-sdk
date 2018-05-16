import StitchClientConfiguration from "./StitchClientConfiguration";

export default class StitchAppClientConfiguration extends StitchClientConfiguration {
  public static Builder = class extends StitchClientConfiguration.Builder {
    public static forApp(clientAppId: string, baseURL?: string) {
      const builder = new StitchAppClientConfiguration.Builder().withClientAppId(
        clientAppId
      );
      if (baseURL) {
        builder.withBaseURL(baseURL);
      }
      return builder;
    }

    public clientAppId: string;
    public localAppName: string;
    public localAppVersion: string;

    private constructor(config?: StitchAppClientConfiguration) {
      super(config);
      if (config) {
        this.clientAppId = config.clientAppId;
        this.localAppVersion = config.localAppVersion;
        this.localAppName = config.localAppName;
      }
    }

    public withClientAppId(clientAppId: string): this {
      this.clientAppId = clientAppId;
      return this;
    }

    public withLocalAppName(localAppName: string): this {
      this.localAppName = localAppName;
      return this;
    }

    public withLocalAppVersion(localAppVersion: string): this {
      this.localAppVersion = localAppVersion;
      return this;
    }

    public build(): StitchAppClientConfiguration {
      if (!this.clientAppId) {
        throw new Error("clientAppId must be set to a non-empty string");
      }

      const config = super.build();
      return new StitchAppClientConfiguration(
        config,
        this.clientAppId,
        this.localAppName,
        this.localAppVersion
      );
    }
  };

  public readonly clientAppId: string;
  public readonly localAppName: string;
  public readonly localAppVersion: string;

  private constructor(
    config: StitchClientConfiguration,
    clientAppId: string,
    localAppName: string,
    localAppVersion: string
  ) {
    super(
      config.baseURL,
      config.storage,
      config.dataDirectory,
      config.transport
    );
    this.clientAppId = clientAppId;
    this.localAppVersion = localAppVersion;
    this.localAppName = localAppName;
  }

  public builder() {
    return new StitchAppClientConfiguration.Builder(this);
  }
}
