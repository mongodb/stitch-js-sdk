import { CoreStitchServiceClient, Decoder } from "stitch-core";

export default interface StitchServiceClient extends CoreStitchServiceClient {
  callFunction<T>(name: string, args: any[], codec?: Decoder<T>): Promise<T>;
}
