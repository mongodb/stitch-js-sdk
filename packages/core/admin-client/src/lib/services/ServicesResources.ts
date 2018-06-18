import { Codec } from "mongodb-stitch-core-sdk";

enum Fields {
  Id = "_id",
  Name = "name",
  Type = "type"
}

export interface ServiceResponse {
  readonly id: string;
  readonly name: string;
  readonly type: string;
}

export class ServiceResponseCodec implements Codec<ServiceResponse> {
  public decode(from: object): ServiceResponse {
    return {
      id: from[Fields.Id],
      name: from[Fields.Name],
      type: from[Fields.Type]
    };
  }

  public encode(from: ServiceResponse): object {
    return {
      [Fields.Id]: from.id,
      [Fields.Name]: from.name,
      [Fields.Type]: from.type
    };
  }
}
