import AuthProvidersRoutes from "../../authProviders/routes/AuthProvidersRoutes";
import { StitchAdminRoutes } from "../../StitchAdminResourceRoutes";
import AppsRoutes from "./AppsRoutes";
import FunctionsRoutes from "./FunctionsRoutes";
import ServicesRoutes from "./ServicesRoutes";
import UserRegistrationRoutes from "./UserRegistrationsRoutes";
import UsersRoutes from "./UsersRoutes";

export default class AppRoutes implements StitchAdminRoutes {
    public readonly baseRoute: string;

    public readonly authProvidersRoute = new AuthProvidersRoutes(this);
    public readonly functionsRoute = new FunctionsRoutes(this);
    public readonly servicesRoute = new ServicesRoutes(this);
    public readonly usersRoute = new UsersRoutes(this);
    public readonly userRegistrationsRoute = new UserRegistrationRoutes(this);

    constructor(appsRoutes: AppsRoutes, appId: string) {
        this.baseRoute = `${appsRoutes.baseRoute}/${appId}`
    }
}
