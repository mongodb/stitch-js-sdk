import StitchAuthRequestClient from "../../auth/internal/StitchAuthRequestClient";
import Method from "../../internal/net/Method";
import { StitchAuthDocRequest } from "../../internal/net/StitchAuthDocRequest";
import StitchServiceRoutes from "./StitchServiceRoutes";

export default interface CoreStitchService {
  callFunctionInternal<T>(name: string, args: any[]): Promise<T>;
}
