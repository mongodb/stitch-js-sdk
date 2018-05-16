export interface StitchAuthRoutes {
    sessionRoute: string;
    profileRoute: string;
    getAuthProviderRoute(providerName: string): string;
    getAuthProviderLoginRoute(providerName: string): string;
    getAuthProviderLinkRoute(providerName: string): string;
}
