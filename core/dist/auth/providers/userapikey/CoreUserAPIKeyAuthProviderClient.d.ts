import UserAPIKeyCredential from "./UserAPIKeyCredential";
export default abstract class CoreUserAPIKeyAuthProviderClient {
    private readonly providerName;
    protected constructor(providerName: string);
    getCredential(key: string): UserAPIKeyCredential;
}
