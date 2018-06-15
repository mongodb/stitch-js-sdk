export default class StitchAppClientInfo {
  public constructor(
    public readonly clientAppId: string,
    public readonly dataDirectory: string,
    public readonly localAppName: string,
    public readonly localAppVersion: string
  ) {
  }
}
