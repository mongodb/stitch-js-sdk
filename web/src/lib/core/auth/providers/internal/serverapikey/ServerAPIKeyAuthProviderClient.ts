import { ServerAPIKeyCredential } from "stitch-core";

export default interface ServerAPIKeyAuthProviderClient {
    getCredential(key: string): ServerAPIKeyCredential;
}
