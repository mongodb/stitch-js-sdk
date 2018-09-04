import { StitchAdminResourceRoutes, StitchAdminRoutes } from "../../StitchAdminResourceRoutes";
import AppRoutes from "./AppRoutes";

export default class AppsRoutes implements StitchAdminRoutes {
    public readonly baseRoute: string;

    constructor(parentRoute: StitchAdminResourceRoutes, groupId: string) {
        this.baseRoute = `${parentRoute.baseRoute}/groups/${groupId}/apps`;
    }

    public appRoute(appId: string): AppRoutes {
        return new AppRoutes(this, appId);
    }
}
