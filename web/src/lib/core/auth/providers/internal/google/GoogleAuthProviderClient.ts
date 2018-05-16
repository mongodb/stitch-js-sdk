import { GoogleCredential } from "stitch-core";

export default interface GoogleAuthProviderClient {
    getCredential(authCode: string): GoogleCredential;
}
