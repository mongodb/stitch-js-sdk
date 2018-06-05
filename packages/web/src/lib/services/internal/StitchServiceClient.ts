import { CoreStitchServiceClient } from "stitch-core";

export default interface StitchServiceClient extends CoreStitchServiceClient {
  callFunction(name: string, args: any[]): Promise<any>;
}
