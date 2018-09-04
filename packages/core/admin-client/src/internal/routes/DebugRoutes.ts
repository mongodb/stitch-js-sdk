import { StitchAdminRoutes } from "../../StitchAdminResourceRoutes";
import AppRoutes from "./AppRoutes";

export default class DebugRoutes implements StitchAdminRoutes {
    public readonly baseRoute: string;

    constructor(appRoutes: AppRoutes) {
        this.baseRoute = `${appRoutes}/debug`
    }

    public getExecuteFunctionRoute(userId: string) {
        return `${this.baseRoute}/execute_function?user_id=${userId}`;
    }

    public getExecuteFunctionSourceRoute(userId: string) {
        return `${this.baseRoute}/execute_function_source?user_id=${userId}`;
    }
}
