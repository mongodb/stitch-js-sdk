import { StitchAdminRoutes } from "../../StitchAdminResourceRoutes";
import AppRoutes from "./AppRoutes";
import UserRoutes from "./UserRoutes";

export default class UsersRoutes implements StitchAdminRoutes {
    public readonly baseRoute: string;

    constructor(appRoutes: AppRoutes) {
        this.baseRoute = `${appRoutes}/users`
    }

    public getUserRoutes(userId: string) {
        return new UserRoutes(this, userId)
    }
}
