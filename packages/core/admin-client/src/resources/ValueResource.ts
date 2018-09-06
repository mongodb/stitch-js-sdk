import ValueRoutes from "../internal/routes/ValueRoutes";
import { applyMixins, BasicResource, Gettable, Removable } from "../Resources";
import { ValueResponse, ValueResponseCodec } from "./ValuesResource";

// / Resource for a single user of an application
export default class ValueResource extends BasicResource<ValueRoutes>
  implements Gettable<ValueResponse, ValueRoutes>, Removable<ValueRoutes> {
  public readonly codec = new ValueResponseCodec();

  public get: () => Promise<ValueResponse>;
  public remove: () => Promise<void>;
}
applyMixins(ValueResource, [Gettable, Removable]);
