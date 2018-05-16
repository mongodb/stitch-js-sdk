import { UserAPIKeyCredential } from "stitch-core";

export default interface UserAPIKeyAuthProviderClient {
    getCredential(key: string): UserAPIKeyCredential;
}