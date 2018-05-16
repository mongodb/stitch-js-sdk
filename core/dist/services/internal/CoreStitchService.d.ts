import StitchAuthRequestClient from "../../auth/internal/StitchAuthRequestClient";
import StitchServiceRoutes from "./StitchServiceRoutes";
export default abstract class CoreStitchService {
    private readonly requestClient;
    private readonly serviceRoutes;
    private readonly serviceName;
    protected constructor(requestClient: StitchAuthRequestClient, routes: StitchServiceRoutes, name: string);
    protected callFunctionInternal(name: string, ...args: any[]): any;
    private getCallServiceFunctionRequest(name, ...args);
}
