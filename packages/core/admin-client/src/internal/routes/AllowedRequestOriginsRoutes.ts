import { StitchAdminRoutes } from "../../StitchAdminResourceRoutes";
import SecurityRoutes from "./SecurityRoutes";

export default class AllowedRequestOriginsRoutes implements StitchAdminRoutes {
    public readonly baseRoute: string;

    constructor(securityRoutes: SecurityRoutes) {
        this.baseRoute = `${securityRoutes.baseRoute}/allowed_request_origins`;
    }
}
