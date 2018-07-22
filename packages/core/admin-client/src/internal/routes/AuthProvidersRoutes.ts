import { StitchAdminRoutes } from "../../StitchAdminResourceRoutes";
import AppRoutes from "./AppRoutes";

export default class AuthProvidersRoutes implements StitchAdminRoutes {
    public readonly baseRoute: string;

    constructor(appRoutes: AppRoutes) {
        this.baseRoute = `${appRoutes.baseRoute}/auth_providers`
    }

    public authProviderRoute(providerId: string): string { 
        return `${this.baseRoute}/${providerId}`
    }
}
