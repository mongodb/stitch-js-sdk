import RuleRoutes from "../internal/routes/RuleRoutes";
import { applyMixins, BasicResource, Gettable, Removable } from "../Resources";
import { RuleResponse, RuleResponseCodec } from "./RulesResource";

// / Resource for a specific rule of a service
export default class RuleResource extends BasicResource<RuleRoutes>
  implements Gettable<RuleResponse, RuleRoutes>, Removable<RuleRoutes> {
  public codec = new RuleResponseCodec();

  public get: () => Promise<RuleResponse>;
  public remove: () => Promise<void>;
}
applyMixins(RuleResource, [Gettable, Removable]);
