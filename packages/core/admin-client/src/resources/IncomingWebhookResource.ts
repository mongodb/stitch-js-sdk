import IncomingWebhookRoutes from "../internal/routes/IncomingWebhookRoutes";
import {
  applyMixins,
  BasicResource,
  Gettable,
  Removable,
  Updatable
} from "../Resources";
import {
  IncomingWebhookCreator,
  IncomingWebhookCreatorCodec,
  IncomingWebhookResponse,
  IncomingWebhookResponseCodec
} from "./IncomingWebhooksResource";

export default class IncomingWebhookResource
  extends BasicResource<IncomingWebhookRoutes>
  implements
    Gettable<IncomingWebhookResponse, IncomingWebhookRoutes>,
    Updatable<IncomingWebhookCreator, IncomingWebhookRoutes>,
    Removable<IncomingWebhookRoutes> {
  public readonly codec = new IncomingWebhookResponseCodec();
  public readonly updatableCodec = new IncomingWebhookCreatorCodec();

  public get: () => Promise<IncomingWebhookResponse>;
  public update: (
    data: IncomingWebhookCreator
  ) => Promise<IncomingWebhookCreator>;
  public remove: () => Promise<void>;
}
applyMixins(IncomingWebhookResource, [Gettable, Updatable, Removable]);
