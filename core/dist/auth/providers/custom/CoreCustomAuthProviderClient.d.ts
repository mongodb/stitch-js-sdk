import CustomCredential from "./CustomCredential";
export default class CoreCustomAuthProviderClient {
    private readonly providerName;
    protected constructor(providerName: string);
    getCredential(token: string): CustomCredential;
}
