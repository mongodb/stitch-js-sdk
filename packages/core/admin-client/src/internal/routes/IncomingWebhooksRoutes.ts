
import { StitchAdminRoutes } from "../../StitchAdminResourceRoutes";
import IncomingWebhookRoutes from "./IncomingWebhookRoutes";
import ServiceRoutes from "./ServiceRoutes";

export default class IncomingWebhooksRoutes implements StitchAdminRoutes {
    public readonly baseRoute: string;

    constructor(serviceRoutes: ServiceRoutes) {
        this.baseRoute = `${serviceRoutes.baseRoute}/incoming_webhooks`
    }

    public incomingWebhookRoute(iwid: string): IncomingWebhookRoutes {
        return new IncomingWebhookRoutes(this, iwid)
    }
}
