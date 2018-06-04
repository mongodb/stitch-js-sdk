import StitchAuthRequestClient from "../../auth/internal/StitchAuthRequestClient";
import Method from "../../internal/net/Method";
import { StitchAuthRequest } from "../../internal/net/StitchAuthRequest";
import StitchServiceRoutes from "./StitchServiceRoutes";

export default interface CoreStitchServiceClient {
  callFunctionInternal<T>(name: string, args: any[]): Promise<T>;
}
