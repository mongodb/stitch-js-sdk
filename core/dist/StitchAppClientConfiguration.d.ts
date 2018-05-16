import StitchClientConfiguration from "./StitchClientConfiguration";
export default class StitchAppClientConfiguration extends StitchClientConfiguration {
    static Builder: any;
    readonly clientAppId: string;
    readonly localAppName: string;
    readonly localAppVersion: string;
    private constructor();
    builder(): any;
}
