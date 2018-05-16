"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StitchClientConfiguration_1 = require("./StitchClientConfiguration");
class StitchAppClientConfiguration extends StitchClientConfiguration_1.default {
    constructor(config, clientAppId, localAppName, localAppVersion) {
        super(config.baseURL, config.storage, config.dataDirectory, config.transport);
        this.clientAppId = clientAppId;
        this.localAppVersion = localAppVersion;
        this.localAppName = localAppName;
    }
    builder() {
        return new StitchAppClientConfiguration.Builder(this);
    }
}
StitchAppClientConfiguration.Builder = class extends StitchClientConfiguration_1.default.Builder {
    static forApp(clientAppId, baseURL) {
        const builder = new StitchAppClientConfiguration.Builder().withClientAppId(clientAppId);
        if (baseURL) {
            builder.withBaseURL(baseURL);
        }
        return builder;
    }
    constructor(config) {
        super(config);
        if (config) {
            this.clientAppId = config.clientAppId;
            this.localAppVersion = config.localAppVersion;
            this.localAppName = config.localAppName;
        }
    }
    withClientAppId(clientAppId) {
        this.clientAppId = clientAppId;
        return this;
    }
    withLocalAppName(localAppName) {
        this.localAppName = localAppName;
        return this;
    }
    withLocalAppVersion(localAppVersion) {
        this.localAppVersion = localAppVersion;
        return this;
    }
    build() {
        if (!this.clientAppId) {
            throw new Error("clientAppId must be set to a non-empty string");
        }
        const config = super.build();
        return new StitchAppClientConfiguration(config, this.clientAppId, this.localAppName, this.localAppVersion);
    }
};
exports.default = StitchAppClientConfiguration;
//# sourceMappingURL=StitchAppClientConfiguration.js.map