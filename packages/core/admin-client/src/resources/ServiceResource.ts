import { applyMixins, BasicResource, Gettable, Removable } from "../../Resources";
import ServiceRoutes from "../routes/ServiceRoutes";
import { RulesResource } from "./RulesResource";
import { ServiceResponse, ServiceResponseCodec } from "./ServicesResource";

// / Resource for a specific service of an application. Can fetch rules
// / of the service
export default class ServiceResource extends BasicResource<ServiceRoutes>
  implements Gettable<ServiceResponse, ServiceRoutes>, Removable<ServiceRoutes> {
    public codec = new ServiceResponseCodec();

    public get: () => Promise<ServiceResponse>;
    public remove: () => Promise<void>;

    public readonly rules = new RulesResource(
      this.authRequestClient,
      this.routes.rulesRoutes
    );
}
applyMixins(ServiceResource, [Gettable, Removable]);
