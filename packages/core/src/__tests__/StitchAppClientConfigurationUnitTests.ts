import { MemoryStorage, StitchAppClientConfiguration } from "../lib";
import { BasicRequest } from "../lib/internal/net/BasicRequest";
import Response from "../lib/internal/net/Response";
import Transport from "../lib/internal/net/Transport";

describe("StitchAppClientConfigurationUnitTests", () => {
  it("should build", () => {
    const clientAppId = "foo";
    const localAppVersion = "bar";
    const localAppName = "baz";
    const baseUrl = "qux";
    const storage = new MemoryStorage();
    const transport = new class implements Transport {
      public roundTrip(request: BasicRequest): Promise<Response> {
        return Promise.resolve({ statusCode: 200, headers: {}, body: "good" });
      }
    }();

    // A minimum of clientAppId, baseUrl, storage, and transport must be set; latter 3 tested
    // elsewhere
    const builder = new StitchAppClientConfiguration.Builder();
    expect(builder.build).toThrow();

    builder.withBaseURL(baseUrl);
    builder.withStorage(storage);
    builder.withTransport(transport);

    expect(builder.build).toThrow();

    builder.withClientAppId("");

    expect(builder.build).toThrow();

    builder.withClientAppId(clientAppId);

    expect(builder.build).toThrow();

    builder.build();

    builder.withLocalAppVersion(localAppVersion).withLocalAppName(localAppName);
    let config = builder.build();

    expect(config.clientAppId).toEqual(clientAppId);
    expect(config.localAppVersion).toEqual(localAppVersion);
    expect(config.localAppName).toEqual(localAppName);
    expect(config.baseURL).toEqual(baseUrl);
    expect(config.storage).toEqual(storage);
    expect(config.transport).toEqual(transport);

    config = builder.build();

    expect(config.clientAppId).toEqual(clientAppId);
    expect(config.localAppVersion).toEqual(localAppVersion);
    expect(config.localAppName).toEqual(localAppName);
    expect(config.baseURL).toEqual(baseUrl);
    expect(config.storage).toEqual(storage);
    expect(config.transport).toEqual(transport);
  });
});
