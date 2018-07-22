// tslint:disable-next-line:no-empty-interface
export interface StitchAdminRoutes {
    readonly baseRoute: string;
}

export class StitchAdminResourceRoutes implements StitchAdminRoutes {

    constructor(
        readonly baseRoute: string) {
    }

    public appsRoute(groupId: string): StitchAdminAppsRoutes {
        return new StitchAdminAppsRoutes(`${this.baseRoute}/groups/${groupId}`)
    }
}

export class StitchAdminAppsRoutes implements StitchAdminRoutes {
    public readonly baseRoute: string;

    constructor(groupRoute: string) {
        this.baseRoute = `${groupRoute}/apps`
    }

    public appRoute(appId: string) {
        return `${this.baseRoute}/${appId}`
    }
}

export class StitchAdminAppRoutes implements StitchAdminRoutes {
    public readonly authProvidersRoute = new StitchAdminAuthProvidersRoutes(this.baseRoute);
    public readonly functionsRoute = new StitchAdminFunctionsRoutes(this.baseRoute);
    public readonly servicesRoute = new StitchAdminServicesRoutes(this.baseRoute);
    public readonly usersRoute = `${this.baseRoute}/users`
    public readonly userRegistrationsRoute = `${this.baseRoute}/user_registrations`

    constructor(public readonly baseRoute: string) {
    }
}

export class StitchAdminAuthProvidersRoutes implements StitchAdminRoutes {
    public readonly baseRoute: string;

    constructor(appRoute: string) {
        this.baseRoute = `${appRoute}/auth_providers`
    }

    public authProviderRoute(providerId: string): string { 
        return `${this.baseRoute}/${providerId}`
    }
}

export class StitchAdminFunctionsRoutes implements StitchAdminRoutes {
    public readonly baseRoute: string;

    constructor(appRoute: string) {
        this.baseRoute = `${appRoute}/functions`
    }
}

export class StitchAdminServicesRoutes implements StitchAdminRoutes {
    public readonly baseRoute: string;

    constructor(appRoute: string) {
        this.baseRoute = `${appRoute}/services`
    }
}