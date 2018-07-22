import { StitchAdminRoutes } from "../../StitchAdminResourceRoutes";
import AuthProvidersRoutes from "./AuthProvidersRoutes";

export default class AuthProviderRoutes implements StitchAdminRoutes {
    public readonly baseRoute: string;

    constructor(authProvidersRoutes: AuthProvidersRoutes, providerId: string) {
        this.baseRoute = `${authProvidersRoutes.baseRoute}/${providerId}`;
    }
}
