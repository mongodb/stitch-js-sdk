import { StitchAdminRoutes } from "../../StitchAdminResourceRoutes";
import AppRoutes from "./AppRoutes";
import ServiceRoutes from "./ServiceRoutes";

export default class ServicesRoutes implements StitchAdminRoutes {
    public readonly baseRoute: string;

    constructor(appRoutes: AppRoutes) {
        this.baseRoute = `${appRoutes.baseRoute}/services`
    }

    public getServiceRoutes(serviceId: string) {
        return new ServiceRoutes(this, serviceId);
    }
}
