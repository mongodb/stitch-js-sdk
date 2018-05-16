import { StitchAuthRoutes } from "../../auth/internal/StitchAuthRoutes";
export default class StitchAppAuthRoutes implements StitchAuthRoutes {
    readonly sessionRoute: string;
    readonly profileRoute: string;
    private readonly clientAppId;
    constructor(clientAppId: string);
    getAuthProviderRoute(providerName: string): string;
    getAuthProviderLoginRoute(providerName: string): string;
    getAuthProviderLinkRoute(providerName: string): string;
}
