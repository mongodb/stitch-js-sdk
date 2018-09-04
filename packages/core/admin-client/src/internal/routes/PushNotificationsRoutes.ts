import { StitchAdminRoutes } from "../../StitchAdminResourceRoutes";
import AppRoutes from "./AppRoutes";
import PushNotificationRoutes from "./PushNotificationRoutes";

export default class PushNotificationsRoutes implements StitchAdminRoutes {
    public readonly baseRoute: string;

    constructor(appRoutes: AppRoutes) {
        this.baseRoute = `${appRoutes.baseRoute}/push_notifications`
    }

    public getPushNotificationRoutes(pushNotificationId: string) {
        return new PushNotificationRoutes(this, pushNotificationId);
    }
}
