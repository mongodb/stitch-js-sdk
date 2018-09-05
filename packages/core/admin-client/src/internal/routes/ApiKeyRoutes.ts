import { StitchAdminRoutes } from "../../StitchAdminResourceRoutes";

export default class ApiKeysRoutes implements StitchAdminRoutes {
    public readonly baseRoute: string;

    constructor(apiKeysRoutes: ApiKeysRoutes, id: string) {
        this.baseRoute = `${apiKeysRoutes.baseRoute}/${id}`
    }
}
