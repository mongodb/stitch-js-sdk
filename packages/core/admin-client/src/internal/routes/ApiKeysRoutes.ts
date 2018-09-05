import { StitchAdminRoutes } from "../../StitchAdminResourceRoutes";
import ApiKeyRoutes from "./ApiKeyRoutes";
import AppRoutes from "./AppRoutes";

export default class ApiKeysRoutes implements StitchAdminRoutes {
    public readonly baseRoute: string;

    constructor(appRoutes: AppRoutes) {
        this.baseRoute = `${appRoutes.baseRoute}/api_keys`
    }

    public apiKey(id: string) {
        return new ApiKeyRoutes(this, id)
    }
}
