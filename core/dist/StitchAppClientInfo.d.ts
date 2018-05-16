export default class StitchAppClientInfo {
    readonly clientAppId: string;
    readonly dataDirectory: string;
    readonly localAppName: string;
    readonly localAppVersion: string;
    constructor(clientAppId: string, dataDirectory: string, localAppName: string, localAppVersion: string);
}
