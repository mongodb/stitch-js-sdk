import { ObjectId } from "bson";
import { Codec } from "mongodb-stitch-core-sdk";
import IncomingWebhooksRoutes from "../internal/routes/IncomingWebhooksRoutes";
import { applyMixins, BasicResource, Creatable, Listable } from "../Resources";
import IncomingWebhookResource from "./IncomingWebhookResource";

enum IncomingWebhookFields {
  Id = "_id",
  Name = "name",
  FunctionSource = "function_source",
  RunAsUserId = "run_as_user_id",
  RunAsUserIdScriptSource = "run_as_user_id_script_source",
  Options = "options",
  RespondResult = "respond_result"
}

export class IncomingWebhookCreatorCodec
  implements Codec<IncomingWebhookCreator> {
  public encode(from: IncomingWebhookCreator): object {
    return {
      [IncomingWebhookFields.Name]: from.name,
      [IncomingWebhookFields.FunctionSource]: from.functionSource,
      [IncomingWebhookFields.RunAsUserId]: from.runAsUserId,
      [IncomingWebhookFields.RunAsUserIdScriptSource]:
        from.runAsUserIdScriptSource,
      [IncomingWebhookFields.Options]: from.options,
      [IncomingWebhookFields.RespondResult]: from.respondResult
    };
  }

  public decode(from: object): IncomingWebhookCreator {
    return {
      functionSource: from[IncomingWebhookFields.FunctionSource],
      name: from[IncomingWebhookFields.Name],
      options: from[IncomingWebhookFields.Options],
      respondResult: from[IncomingWebhookFields.RespondResult],
      runAsUserId: from[IncomingWebhookFields.RunAsUserId],
      runAsUserIdScriptSource:
        from[IncomingWebhookFields.RunAsUserIdScriptSource]
    };
  }
}

export interface IncomingWebhookCreator {
  name: string;
  functionSource: string;
  runAsUserId: string;
  runAsUserIdScriptSource: string;
  // Service specific options
  options: object;
  // Whether or not to send the result of the function in the response
  respondResult: boolean;
}

export class IncomingWebhookResponseCodec
  implements Codec<IncomingWebhookResponse> {
  public encode(from: IncomingWebhookResponse): object {
    return {
      [IncomingWebhookFields.Id]: from.id,
      [IncomingWebhookFields.Name]: from.name,
      [IncomingWebhookFields.FunctionSource]: from.functionSource,
      [IncomingWebhookFields.RunAsUserId]: from.runAsUserId,
      [IncomingWebhookFields.RunAsUserIdScriptSource]:
        from.runAsUserIdScriptSource,
      [IncomingWebhookFields.Options]: from.options,
      [IncomingWebhookFields.RespondResult]: from.respondResult
    };
  }

  public decode(from: object): IncomingWebhookResponse {
    return {
      functionSource: from[IncomingWebhookFields.FunctionSource],
      id: from[IncomingWebhookFields.Id],
      name: from[IncomingWebhookFields.Name],
      options: from[IncomingWebhookFields.Options],
      respondResult: from[IncomingWebhookFields.RespondResult],
      runAsUserId: from[IncomingWebhookFields.RunAsUserId],
      runAsUserIdScriptSource:
        from[IncomingWebhookFields.RunAsUserIdScriptSource]
    };
  }
}

export interface IncomingWebhookResponse {
  id: ObjectId;
  name: string;
  functionSource: string;
  runAsUserId: string;
  runAsUserIdScriptSource: string;
  // Service specific options
  options?: object;
  // Whether or not to send the result of the function in the response
  respondResult: boolean;
}

// / Resource for a list of users of an application
export class IncomingWebhooksResource
  extends BasicResource<IncomingWebhooksRoutes>
  implements
    Listable<IncomingWebhookResponse, IncomingWebhooksRoutes>,
    Creatable<
      IncomingWebhookCreator,
      IncomingWebhookResponse,
      IncomingWebhooksRoutes
    > {
  public readonly codec = new IncomingWebhookResponseCodec();
  public readonly creatorCodec = new IncomingWebhookCreatorCodec();

  public create: (
    data: IncomingWebhookCreator
  ) => Promise<IncomingWebhookResponse>;
  public list: () => Promise<IncomingWebhookResponse[]>;

  public incomingWebhook(iwid: string): IncomingWebhookResource {
    return new IncomingWebhookResource(
      this.authRequestClient,
      this.routes.incomingWebhookRoute(iwid)
    );
  }
}
applyMixins(IncomingWebhooksResource, [Listable, Creatable]);
