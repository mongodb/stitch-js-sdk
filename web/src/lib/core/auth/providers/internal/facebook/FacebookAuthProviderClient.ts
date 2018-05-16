import { FacebookCredential } from "stitch-core";

export default interface FacebookAuthProviderClient {
    getCredential(accessToken: string): FacebookCredential;
}
