import { MemoryStorage } from "../lib";
import Transport from "../lib/internal/net/Transport";
import { BasicRequest } from "../lib/internal/net/BasicRequest";
import Response from "../lib/internal/net/Response";
import { StitchClientConfiguration } from "../lib/StitchClientConfiguration";

describe("StitchClientConfigurationUnitTests", () => {
  it("should build", () => {
    const baseUrl = "http://domain.com";
    const storage = new MemoryStorage();
    const transport = new class implements Transport {
      roundTrip(request: BasicRequest): Promise<Response> {
        return Promise.resolve({ statusCode: 200, headers: {}, body: "good" });
      }
    }();

    // A minimum of baseUrl, storage, and transport must be set
    var builder = new StitchClientConfiguration.Builder();
    expect(builder.build).toThrow();

    builder.withBaseURL(baseUrl);

    expect(builder.build).toThrow();

    builder = new StitchClientConfiguration.Builder();
    builder.withStorage(storage);

    expect(builder.build).toThrow();

    builder = new StitchClientConfiguration.Builder();
    builder.withTransport(transport);

    expect(builder.build).toThrow();

    builder = new StitchClientConfiguration.Builder();
    builder.withBaseURL(baseUrl);
    builder.withStorage(storage);

    expect(builder.build).toThrow();

    builder = new StitchClientConfiguration.Builder();
    builder.withBaseURL(baseUrl);
    builder.withTransport(transport);

    expect(builder.build).toThrow();

    builder = new StitchClientConfiguration.Builder();
    builder.withStorage(storage);
    builder.withTransport(transport);

    expect(builder.build).toThrow();

    // Minimum satisfied
    builder = new StitchClientConfiguration.Builder();
    builder.withBaseURL(baseUrl);
    builder.withStorage(storage);
    builder.withTransport(transport);

    var config = builder.build();

    expect(config.baseURL).toEqual(baseUrl);
    expect(config.storage).toEqual(storage);
    expect(config.transport).toEqual(transport);
  });
});
