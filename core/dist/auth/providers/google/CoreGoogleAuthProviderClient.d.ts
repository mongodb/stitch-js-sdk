import GoogleCredential from "./GoogleCredential";
export default abstract class CoreGoogleAuthProviderClient {
    private readonly providerName;
    protected constructor(providerName: string);
    getCredential(authCode: string): GoogleCredential;
}
