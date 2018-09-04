import { Method, StitchAuthRequest } from "mongodb-stitch-core-sdk";
import DebugRoutes from "../internal/routes/DebugRoutes";
import { BasicResource } from "../Resources";

export default class DebugResource extends BasicResource<DebugRoutes> {
    public executeFunction(userId: string, name = "", ...args: any[]) {
        const reqBuilder = new StitchAuthRequest.Builder();
        reqBuilder
            .withMethod(Method.POST)
            .withPath(this.routes.getExecuteFunctionRoute(userId))
            .withBody(JSON.stringify({name, "arguments": args}));
    
        return this.authRequestClient
          .doAuthenticatedRequest(reqBuilder.build())
          .then(() => {
            return;
          });
    }

    public executeFunctionSource(userId: string, source = "", evalSource = "") {
        const reqBuilder = new StitchAuthRequest.Builder();
        reqBuilder
            .withMethod(Method.POST)
            .withPath(this.routes.getExecuteFunctionSourceRoute(userId))
            .withBody(JSON.stringify({source, "eval_source": evalSource}));
    
        return this.authRequestClient
          .doAuthenticatedRequest(reqBuilder.build())
          .then(() => {
            return;
          });
    }
}
