import { applyMixins, BasicResource, Gettable, Removable } from "../../Resources";
import UserRoutes from "../routes/UserRoutes";
import { UserResponse, UserResponseCodec } from "./UsersResource";

// / Resource for a single user of an application
export default class UserResource 
    extends BasicResource<UserRoutes>
    implements Gettable<UserResponse, UserRoutes>, Removable<UserRoutes> {
    public readonly codec = new UserResponseCodec();
  
    public get: () => Promise<UserResponse>;
    public remove: () => Promise<void>;
}
applyMixins(UserResource, [Gettable, Removable]);
