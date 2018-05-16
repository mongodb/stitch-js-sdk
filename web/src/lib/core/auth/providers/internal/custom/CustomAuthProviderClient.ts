import { CustomCredential } from "stitch-core";

interface CustomAuthProviderClient {
    getCredential(token: string): CustomCredential;
}

export default CustomAuthProviderClient;
