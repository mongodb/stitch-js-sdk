export default class StitchAppClientInfo {
  public readonly clientAppId: string;
  public readonly dataDirectory: string;
  public readonly localAppName: string;
  public readonly localAppVersion: string;

  public constructor(
    clientAppId: string,
    dataDirectory: string,
    localAppName: string,
    localAppVersion: string
  ) {
    this.clientAppId = clientAppId;
    this.dataDirectory = dataDirectory;
    this.localAppName = localAppName;
    this.localAppVersion = localAppVersion;
  }
}
