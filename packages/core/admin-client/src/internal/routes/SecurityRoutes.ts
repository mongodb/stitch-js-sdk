import { StitchAdminRoutes } from "../../StitchAdminResourceRoutes";
import AllowedRequestOriginsRoutes from "./AllowedRequestOriginsRoutes";
import AppRoutes from "./AppRoutes";

export default class SecurityRoutes implements StitchAdminRoutes {
    public readonly baseRoute: string;

    public readonly allowedRequestOrigins: AllowedRequestOriginsRoutes;

    constructor(appRoutes: AppRoutes) {
        this.baseRoute = `${appRoutes.baseRoute}/security`
        this.allowedRequestOrigins = new AllowedRequestOriginsRoutes(this);
    }
}
