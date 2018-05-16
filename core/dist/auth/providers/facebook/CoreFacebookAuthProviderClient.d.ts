import FacebookCredential from "./FacebookCredential";
export default class CoreFacebookAuthProviderClient {
    private readonly providerName;
    protected constructor(providerName: string);
    getCredential(accessToken: string): FacebookCredential;
}
