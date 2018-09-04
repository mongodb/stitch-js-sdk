import { ObjectId } from "bson";
import { Codec, Encoder }  from "mongodb-stitch-core-sdk";
import ValuesRoutes from "../internal/routes/ValuesRoutes";
import { applyMixins, BasicResource, Creatable, Listable } from "../Resources";
import ValueResource from "./ValueResource";

export class ValueCreatorCodec implements Encoder<ValueCreator> {
  public encode(from: ValueCreator): object {
    return {
      name: from.name,
      private: from.private,
      value: from.value,
    }
  }
}

export interface ValueCreator {
  name: string;
  value: any;
  private: boolean;
}

enum ValueResponseFields {
  Id = "_id",
  Name = "name",
  Private = "private",
  Value = "value"
}
export class ValueResponseCodec implements Codec<ValueResponse> {
  public encode(from: ValueResponse): object {
    return {
    }
  }

  public decode(from: object): ValueResponse {
    return {
      id: new ObjectId(from[ValueResponseFields.Id]),
      name: from[ValueResponseFields.Name],
      private: from[ValueResponseFields.Private],
      value: from[ValueResponseFields.Value],
    }
  }
}
export interface ValueResponse {
  id: ObjectId
  name: string;
  value: any;
  private: boolean;
}

// / Resource for a list of users of an application
export class ValuesResource extends BasicResource<ValuesRoutes>
  implements Listable<ValueResponse, ValuesRoutes>, Creatable<ValueCreator, ValueResponse, ValuesRoutes> {
  public readonly codec = new ValueResponseCodec();
  public readonly creatorCodec = new ValueCreatorCodec();

  public create: (data: ValueCreator) => Promise<ValueResponse>;
  public list: () => Promise<ValueResponse[]>;

  public value(vid: string): ValueResource {
    return new ValueResource(
      this.authRequestClient,
      this.routes.getValueRoutes(vid)
    );
  }
}
applyMixins(ValuesResource, [Listable, Creatable]);
