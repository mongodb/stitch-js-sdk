import AppsRoutes from "./internal/routes/AppsRoutes";

// tslint:disable-next-line:no-empty-interface
export interface StitchAdminRoutes {
    readonly baseRoute: string;
}

export class StitchAdminResourceRoutes implements StitchAdminRoutes {
    constructor(
        readonly baseRoute: string) {
    }

    public appsRoute(groupId: string): AppsRoutes {
        return new AppsRoutes(this, groupId);
    }
}
