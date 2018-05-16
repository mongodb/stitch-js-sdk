import { CoreStitchService, StitchAuthRequestClient, StitchServiceRoutes } from "stitch-core";
import StitchService from "../StitchService";

export default class StitchServiceImpl extends CoreStitchService implements StitchService {
    public constructor(
        requestClient: StitchAuthRequestClient,
        routes: StitchServiceRoutes,
        name: string) {
      super(requestClient, routes, name);
    }
  
    public callFunction(name: string, ...args: any[]): Promise<any> {
        return new Promise((resolve, reject) => {
            resolve(this.callFunctionInternal(name, args));
        })
    }
}
