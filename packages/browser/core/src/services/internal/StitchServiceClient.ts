import { CoreStitchServiceClient, Decoder } from "mongodb-stitch-core-sdk";

export default interface StitchServiceClient extends CoreStitchServiceClient {
  callFunction<T>(name: string, args: any[], codec?: Decoder<T>): Promise<T>;
}
