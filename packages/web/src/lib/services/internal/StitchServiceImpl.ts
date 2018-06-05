import {
  CoreStitchServiceClient,
  CoreStitchServiceClientImpl,
  StitchAuthRequestClient,
  StitchServiceRoutes
} from "stitch-core";
import StitchServiceClient from "./StitchServiceClient";

export default class StitchServiceImpl extends CoreStitchServiceClientImpl
  implements StitchServiceClient {
  public constructor(
    requestClient: StitchAuthRequestClient,
    routes: StitchServiceRoutes,
    name: string
  ) {
    super(requestClient, routes, name);
  }

  public callFunction(name: string, args: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      resolve(this.callFunctionInternal(name, args));
    });
  }
}
