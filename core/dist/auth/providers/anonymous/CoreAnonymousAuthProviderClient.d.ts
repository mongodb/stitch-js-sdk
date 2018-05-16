import AnonymousCredential from "./AnonymousCredential";
export default abstract class CoreAnonymousAuthProviderClient {
    private readonly providerName;
    protected constructor(providerName: string);
    getCredential(): AnonymousCredential;
}
