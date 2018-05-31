import StitchAuthRequestClient from "../../auth/internal/StitchAuthRequestClient";
import Method from "../../internal/net/Method";
import { StitchAuthDocRequest } from "../../internal/net/StitchAuthDocRequest";
import StitchServiceRoutes from "./StitchServiceRoutes";

export default interface CoreStitchServiceClient {
  callFunctionInternal<T>(name: string, args: any[]): Promise<T>;
}
