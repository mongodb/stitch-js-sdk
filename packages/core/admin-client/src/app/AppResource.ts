import { AppResponse, AppResponseCodec } from "../apps/AppsResources";
import { applyMixins, AuthProvidersResource, BasicResource, Gettable, Removable } from "../Resources";
import { StitchAdminAuthProvidersRoutes } from "../StitchAdminResourceRoutes";

export class AppResource extends BasicResource implements Gettable<AppResponse>, Removable {
    public readonly codec = new AppResponseCodec();
  
    public readonly authProviders = new AuthProvidersResource(
      this.authRequestClient,
      new StitchAdminAuthProvidersRoutes(this.routes.baseRoute)
    );
    public readonly functions = new FunctionsResource(
      this.authRequestClient,
      `${this.url}/functions`
    );
    public readonly services = new ServicesResource(
      this.authRequestClient,
      `${this.url}/services`
    );
    public readonly users = new UsersResource(this.authRequestClient, `${this.url}/users`);
    public readonly userRegistrations = new UserRegistrationsResource(
      this.authRequestClient,
      `${this.url}/user_registrations`
    );
  
    public get: () => Promise<AppResponse>;
    public remove: () => Promise<void>;
  }
  applyMixins(AppResource, [Gettable, Removable]);