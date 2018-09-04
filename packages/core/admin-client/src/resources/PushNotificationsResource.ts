import { ObjectId } from "bson";
import { Codec, Encoder }  from "mongodb-stitch-core-sdk";
import PushNotificationsRoutes from "../internal/routes/PushNotificationsRoutes";
import { applyMixins, BasicResource, Creatable, Listable } from "../Resources";
import PushNotificationResource from "./PushNotificationResource";

enum PushNotificationState {
    Draft = "draft",
    Sent = "sent",
}

enum PushNotificationFields {
    Id = "_id",
    AppId = "appID",
    State = "type",
    Topic = "topic",
    Message = "message",
    Label = "label",
    Created = "created",
    Sent = "sent"
}

export class PushNotificationCreatorCodec implements Encoder<PushNotificationCreator> {
  public encode(from: PushNotificationCreator): object {
    return {
        [PushNotificationFields.Label]: from.label,
		[PushNotificationFields.Message]: from.message,
		[PushNotificationFields.State]: PushNotificationState.Draft,
		[PushNotificationFields.Topic]: from.topic,
    }
  }
}

export interface PushNotificationCreator {
  label: string;
  message: string;
  topic: string;
}

export class PushNotificationResponseCodec implements Codec<PushNotificationResponse> {
  public encode(from: PushNotificationResponse): object {
    return {
    }
  }

  public decode(from: object): PushNotificationResponse {
    return {
        appId: new ObjectId(from[PushNotificationFields.AppId]),
        created: from[PushNotificationFields.Created],
        id: new ObjectId(from[PushNotificationFields.Id]),
        label: from[PushNotificationFields.Label],
        message: from[PushNotificationFields.Message],
        sent: from[PushNotificationFields.Sent],
        state: from[PushNotificationFields.State],
        topic: from[PushNotificationFields.Topic],
    }
  }
}

export interface PushNotificationResponse {
  id: ObjectId
	appId: ObjectId
	state: PushNotificationState
	topic: string
	message: string
	label: string
	created: number
	sent: number
}

// / Resource for a list of users of an application
export class PushNotificationsResource extends BasicResource<PushNotificationsRoutes>
  implements Listable<PushNotificationResponse, PushNotificationsRoutes>, Creatable<PushNotificationCreator, PushNotificationResponse, PushNotificationsRoutes> {
  public readonly codec = new PushNotificationResponseCodec();
  public readonly creatorCodec = new PushNotificationCreatorCodec();

  public create: (data: PushNotificationCreator) => Promise<PushNotificationResponse>;
  public list: () => Promise<PushNotificationResponse[]>;

  public value(vid: string): PushNotificationResource {
    return new PushNotificationResource(
      this.authRequestClient,
      this.routes.getPushNotificationRoutes(vid)
    );
  }
}
applyMixins(PushNotificationsResource, [Listable, Creatable]);
