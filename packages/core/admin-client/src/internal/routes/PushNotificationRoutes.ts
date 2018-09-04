import { StitchAdminRoutes } from "../../StitchAdminResourceRoutes";
import PushNotificationsRoutes from "./PushNotificationsRoutes";

export default class PushNotificationRoutes implements StitchAdminRoutes {
    public readonly baseRoute: string;
    public readonly send: string;
    
    constructor(
        pushNotificationsRoutes: PushNotificationsRoutes, 
        pushNotificationId: string) {
        this.baseRoute = `${pushNotificationsRoutes.baseRoute}/${pushNotificationId}`
        this.send = `${this.baseRoute}/send`
    }
}
