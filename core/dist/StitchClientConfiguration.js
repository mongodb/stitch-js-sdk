"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class StitchClientConfiguration {
    constructor(baseURL, storage, dataDirectory, transport) {
        this.baseURL = baseURL;
        this.storage = storage;
        this.dataDirectory = dataDirectory;
        this.transport = transport;
    }
    builder() {
        return new StitchClientConfiguration.Builder(this);
    }
}
StitchClientConfiguration.Builder = class {
    constructor(config) {
        if (config) {
            this.baseURL = config.baseURL;
            this.storage = config.storage;
            this.dataDirectory = config.dataDirectory;
            this.transport = config.transport;
        }
    }
    withBaseURL(baseURL) {
        this.baseURL = baseURL;
        return this;
    }
    withStorage(storage) {
        this.storage = storage;
        return this;
    }
    withDataDirectory(dataDirectory) {
        this.dataDirectory = dataDirectory;
        return this;
    }
    withTransport(transport) {
        this.transport = transport;
        return this;
    }
    build() {
        if (!this.baseURL) {
            throw new Error("baseURL must be set");
        }
        if (!this.storage) {
            throw new Error("storage must be set");
        }
        if (!this.transport) {
            throw new Error("transport must be set");
        }
        return new StitchClientConfiguration(this.baseURL, this.storage, this.dataDirectory, this.transport);
    }
};
exports.default = StitchClientConfiguration;
//# sourceMappingURL=StitchClientConfiguration.js.map