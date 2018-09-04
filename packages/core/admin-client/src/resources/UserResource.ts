import { Method, StitchAuthRequest } from "mongodb-stitch-core-sdk";
import UserRoutes from "../internal/routes/UserRoutes";
import { applyMixins, BasicResource, Gettable, Removable } from "../Resources";
import { UserResponse, UserResponseCodec } from "./UsersResource";

// / Resource for a single user of an application
export default class UserResource 
    extends BasicResource<UserRoutes>
    implements Gettable<UserResponse, UserRoutes>, Removable<UserRoutes> {
    public readonly codec = new UserResponseCodec();
  
    public get: () => Promise<UserResponse>;
    public remove: () => Promise<void>;
    public logout(): Promise<void> {
        const reqBuilder = new StitchAuthRequest.Builder();
        reqBuilder.withMethod(Method.PUT).withPath(this.routes.logout);
    
        return this.authRequestClient
          .doAuthenticatedRequest(reqBuilder.build())
          .then(() => {
            return;
          });
      }
}
applyMixins(UserResource, [Gettable, Removable]);
