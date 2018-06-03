import { App, AppResponse, AuthProviderResponse, ProviderConfig, RuleCreator, RuleResponse, Service, ServiceConfig, ServiceResponse, StitchAdminClient } from "stitch-admin";
import { UserAPIKeyAuthProvider, UserPasswordCredential } from "stitch-core";

export default abstract class BaseStitchIntTestHarness {
    protected abstract readonly stitchBaseUrl: string

    private groupId: string = "";
    private apps: App[] = [];
    private initialized = false;

    private readonly adminClient: StitchAdminClient = new StitchAdminClient(this.stitchBaseUrl)

    public setup(): Promise<void> {
        // Verify stitch is up
        return fetch(this.stitchBaseUrl).then(() => {
            return this.adminClient.loginWithCredential(
                new UserPasswordCredential(
                        "unique_user@domain.com",
                        "password"
                )
            )
        }).then(() => {
            return this.adminClient.adminProfile();
        }).then(profile => {
            this.groupId = profile.roles[0].groupId;
            this.initialized = true;
        }).catch((e) => {
            throw new Error(`Expected Stitch server to be available at '${this.stitchBaseUrl}': ${e.message}`)
        });
    }

    public teardown(): Promise<void> {
        if (!this.initialized) {
            return Promise.resolve();
        }

        return Promise.all(this.apps.map(app => { app.remove() })).then(() =>
            this.adminClient.logout()
        );
    }

    public createApp(appName: string = "test-${ObjectId().toHexString()}"): Promise<Array<(App | AppResponse)>> {
        return this.adminClient.apps(this.groupId).create(appName).then((appInfo: AppResponse) => {
            const app: App = this.adminClient.apps(this.groupId).app(appInfo.id);
            this.apps.push(app);
            return [appInfo, app];
        });
    }

    public addProvider(app: App, config: ProviderConfig): Promise<AuthProviderResponse> {
        let authProviders;
        return app.authProviders.create(config).then(resp => {
            authProviders = resp;
            return app.authProviders.authProvider(resp.id).enable();
        }).then(() => {
            return authProviders
        });
    }

    public enableApiKeyProvider(app: App): Promise<void> {
        return app.authProviders.list().then(responses => {
            const apiKeyProvider = responses.find(it => it.name === UserAPIKeyAuthProvider.DEFAULT_NAME)!;
            return app.authProviders.authProvider(apiKeyProvider.id).enable();
        });
    }

    public addService(app: App, type: string, config: ServiceConfig): Promise<Array<ServiceResponse | Service>> {
        return app.services.create(config).then(svcInfo => {
            const svc = app.services.service(svcInfo.id)
            return [svcInfo, svc];
        });
    }

    public addRule(svc: Service, config: RuleCreator): Promise<RuleResponse> {
        return svc.rules.create(config)
    }
}
