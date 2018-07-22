import { StitchAdminRoutes } from "../../StitchAdminResourceRoutes";
import AppRoutes from "./AppRoutes";

export default class UserRegistrationRoutes implements StitchAdminRoutes {
    public readonly baseRoute: string;

    constructor(appRoutes: AppRoutes) {
        this.baseRoute = `${appRoutes}/user_registrations`
    }

    public getSendConfirmationRoute(email: string) {
        return `${this.baseRoute}/by_email/${email}/send_confirm`
    }
}
