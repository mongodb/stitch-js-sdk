import { StitchAdminRoutes } from "../../StitchAdminResourceRoutes";
import AppsRoutes from "./AppsRoutes";
import AuthProvidersRoutes from "./AuthProvidersRoutes";
import DebugRoutes from "./DebugRoutes";
import FunctionsRoutes from "./FunctionsRoutes";
import PushNotificationsRoute from "./PushNotificationsRoutes";
import ServicesRoutes from "./ServicesRoutes";
import UserRegistrationRoutes from "./UserRegistrationsRoutes";
import UsersRoutes from "./UsersRoutes";
import ValuesRoutes from "./ValuesRoutes";

export default class AppRoutes implements StitchAdminRoutes {
    public readonly baseRoute: string;

    public readonly authProvidersRoute;
    public readonly debugRoute;
    public readonly functionsRoute;
    public readonly pushNotificationsRoute;
    public readonly servicesRoute;
    public readonly usersRoute;
    public readonly userRegistrationsRoute;
    public readonly valuesRoute;

    constructor(appsRoutes: AppsRoutes, appId: string) {
        this.baseRoute = `${appsRoutes.baseRoute}/${appId}`
        this.authProvidersRoute = new AuthProvidersRoutes(this);
        this.debugRoute = new DebugRoutes(this);
        this.functionsRoute = new FunctionsRoutes(this);
        this.pushNotificationsRoute = new PushNotificationsRoute(this);
        this.servicesRoute = new ServicesRoutes(this);
        this.usersRoute = new UsersRoutes(this);
        this.userRegistrationsRoute = new UserRegistrationRoutes(this);
        this.valuesRoute = new ValuesRoutes(this);
    }
}
