import { StitchAdminRoutes } from "../../StitchAdminResourceRoutes";
import UsersRoutes from "./UsersRoutes";

export default class UserRoutes implements StitchAdminRoutes {
    public readonly baseRoute: string;
    public readonly logout: string;
    
    constructor(usersRoutes: UsersRoutes, userId: string) {
        this.baseRoute = `${usersRoutes}/${userId}`
        this.logout = `${this.baseRoute}/logout`
    }
}
