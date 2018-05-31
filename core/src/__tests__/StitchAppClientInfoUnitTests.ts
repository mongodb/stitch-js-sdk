import { StitchAppClientInfo } from "../lib";

describe("StitchAppClientInfoUnitTests", () => {
  it("should init", () => {
    const clientAppId = "my_app-12345";
    const dataDirectory = "/srv/mongodb/stitch";
    const localAppName = "myApp";
    const localAppVersion = "1.0";

    const stitchAppClientInfo = new StitchAppClientInfo(
      clientAppId,
      dataDirectory,
      localAppName,
      localAppVersion
    );

    expect(stitchAppClientInfo.clientAppId).toEqual(clientAppId);
    expect(stitchAppClientInfo.dataDirectory).toEqual(dataDirectory);
    expect(stitchAppClientInfo.localAppName).toEqual(localAppName);
    expect(stitchAppClientInfo.localAppVersion).toEqual(localAppVersion);
  });
});
