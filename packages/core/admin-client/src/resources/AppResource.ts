import { applyMixins, BasicResource, Gettable, Removable } from "../../Resources";
import AppRoutes from "../routes/AppRoutes";
import { AppResponse, AppResponseCodec } from "./AppsResource";
import { AuthProvidersResource } from "./AuthProvidersResource";
import { FunctionsResource } from "./FunctionsResource";
import { ServicesResource } from "./ServicesResource";
import { UserRegistrationsResource } from "./UserRegistrationsResource";
import { UsersResource } from "./UsersResource";

export default class AppResource 
  extends BasicResource<AppRoutes>
  implements Gettable<AppResponse, AppRoutes>, Removable<AppRoutes> {
    public readonly codec = new AppResponseCodec();
  
    public readonly authProviders = new AuthProvidersResource(
      this.authRequestClient,
      this.routes.authProvidersRoute
    );
    public readonly functions = new FunctionsResource(
      this.authRequestClient,
      this.routes.functionsRoute
    );
    public readonly services = new ServicesResource(
      this.authRequestClient,
      this.routes.servicesRoute
    );
    public readonly users = new UsersResource(
      this.authRequestClient, 
      this.routes.usersRoute
    );
    public readonly userRegistrations = new UserRegistrationsResource(
      this.authRequestClient,
      this.routes.userRegistrationsRoute
    );
  
    public get: () => Promise<AppResponse>;
    public remove: () => Promise<void>;
  }
  applyMixins(AppResource, [Gettable, Removable]);
  