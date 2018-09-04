import { StitchAdminRoutes } from "../../StitchAdminResourceRoutes";
import IncomingWebhooksRoutes from "./IncomingWebhooksRoutes";

export default class IncomingWebhookRoutes implements StitchAdminRoutes {
    public readonly baseRoute: string;

    constructor(incomingWebhooksRoutes: IncomingWebhooksRoutes, incomingWebhookId: string) {
        this.baseRoute = `${incomingWebhooksRoutes.baseRoute}/${incomingWebhookId}`
    }
}
