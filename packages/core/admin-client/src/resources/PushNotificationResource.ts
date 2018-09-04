import { Method, StitchAuthRequest } from "mongodb-stitch-core-sdk";
import PushNotificationRoutes from "../internal/routes/PushNotificationRoutes";
import { applyMixins, BasicResource, Gettable, Removable, Updatable } from "../Resources";
import { PushNotificationResponse, PushNotificationResponseCodec } from "./PushNotificationsResource";

// / Resource for a single user of an application
export default class PushNotificationResource 
    extends BasicResource<PushNotificationRoutes>
    implements Gettable<PushNotificationResponse, PushNotificationRoutes>, 
    Updatable<PushNotificationResponse, PushNotificationRoutes>, Removable<PushNotificationRoutes> {
    public readonly codec = new PushNotificationResponseCodec();
    public readonly updatableCodec = new PushNotificationResponseCodec();

    public get: () => Promise<PushNotificationResponse>;
    public remove: () => Promise<void>;
    public update: (data) => Promise<PushNotificationResponse>;
    public send(): Promise<void> {
        const reqBuilder = new StitchAuthRequest.Builder();
        reqBuilder.withMethod(Method.POST).withPath(this.routes.send);
    
        return this.authRequestClient
          .doAuthenticatedRequest(reqBuilder.build())
          .then(() => {
            return;
          });
    }
}
applyMixins(PushNotificationResource, [Gettable, Removable, Updatable]);
