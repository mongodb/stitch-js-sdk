import AllowedRequestOriginsRoutes from "../internal/routes/AllowedRequestOriginsRoutes";
import SecurityRoutes from "../internal/routes/SecurityRoutes";
import { BasicResource } from "../Resources";
import AllowedRequestOriginsResource from "./AllowedRequestOriginsResource";

export default class SecurityResource extends BasicResource<SecurityRoutes> {
    public readonly allowedRequestOrigins = new AllowedRequestOriginsResource(
        this.authRequestClient,
        new AllowedRequestOriginsRoutes(this.routes)
    )
}
