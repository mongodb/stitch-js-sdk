import StitchServiceRoutes from "../../services/internal/StitchServiceRoutes";
import StitchAppAuthRoutes from "./StitchAppAuthRoutes";
declare const BASE_ROUTE = "/api/client/v2.0";
declare function getAppRoute(clientAppId: string): string;
declare function getFunctionCallRoute(clientAppId: string): string;
declare class StitchAppRoutes {
    readonly authRoutes: StitchAppAuthRoutes;
    readonly serviceRoutes: StitchServiceRoutes;
    readonly functionCallRoute: string;
    private readonly clientAppId;
    constructor(clientAppId: string);
}
export { BASE_ROUTE, getAppRoute, getFunctionCallRoute, StitchAppRoutes };
