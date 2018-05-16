import ServerAPIKeyCredential from "./ServerAPIKeyCredential";
export default abstract class CoreServerAPIKeyAuthProviderClient {
    private readonly providerName;
    protected constructor(providerName: string);
    getCredential(key: string): ServerAPIKeyCredential;
}
