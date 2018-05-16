import { AnonymousCredential } from "stitch-core";

interface AnonymousAuthProviderClient {
    credential: AnonymousCredential;
}

export default AnonymousAuthProviderClient;
