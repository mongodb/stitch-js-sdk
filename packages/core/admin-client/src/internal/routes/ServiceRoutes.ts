import { StitchAdminRoutes } from "../../StitchAdminResourceRoutes";
import IncomingWebhooksRoutes from "./IncomingWebhooksRoutes";
import RulesRoutes from "./RulesRoutes";
import ServicesRoutes from "./ServicesRoutes";

export default class ServiceRoutes implements StitchAdminRoutes {
    public readonly baseRoute: string;
    public readonly rulesRoutes = new RulesRoutes(this);
    public readonly incomingWebhooksRoutes = new IncomingWebhooksRoutes(this);
    
    constructor(servicesRoutes: ServicesRoutes, serviceId: string) {
        this.baseRoute = `${servicesRoutes.baseRoute}/${serviceId}`
    }
}
