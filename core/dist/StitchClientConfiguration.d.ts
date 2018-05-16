import { Storage } from "./internal/common/Storage";
import Transport from "./internal/net/Transport";
export default class StitchClientConfiguration {
    static Builder: {
        new (config?: StitchClientConfiguration | undefined): {
            baseURL: string;
            storage: Storage;
            dataDirectory: string;
            transport: Transport;
            withBaseURL(baseURL: string): any;
            withStorage(storage: Storage): any;
            withDataDirectory(dataDirectory: string): any;
            withTransport(transport: Transport): any;
            build(): StitchClientConfiguration;
        };
    };
    readonly baseURL: string;
    readonly storage: Storage;
    readonly dataDirectory: string;
    readonly transport: Transport;
    protected constructor(baseURL: string, storage: Storage, dataDirectory: string, transport: Transport);
    builder(): {
        baseURL: string;
        storage: Storage;
        dataDirectory: string;
        transport: Transport;
        withBaseURL(baseURL: string): any;
        withStorage(storage: Storage): any;
        withDataDirectory(dataDirectory: string): any;
        withTransport(transport: Transport): any;
        build(): StitchClientConfiguration;
    };
}
