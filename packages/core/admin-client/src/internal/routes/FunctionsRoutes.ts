import { StitchAdminRoutes } from "../../StitchAdminResourceRoutes";
import AppRoutes from "./AppRoutes";

export default class FunctionsRoutes implements StitchAdminRoutes {
    public readonly baseRoute: string;

    constructor(appRoutes: AppRoutes) {
        this.baseRoute = `${appRoutes.baseRoute}/functions`
    }
}
