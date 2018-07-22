import { StitchAdminRoutes } from "../../StitchAdminResourceRoutes";
import RulesRoutes from "./RulesRoutes";
import ServicesRoutes from "./ServicesRoutes";

export default class ServiceRoutes implements StitchAdminRoutes {
    public readonly baseRoute: string;
    public readonly rulesRoutes = new RulesRoutes(this);
    
    constructor(servicesRoutes: ServicesRoutes, serviceId: string) {
        this.baseRoute = `${servicesRoutes}/${serviceId}`
    }
}
